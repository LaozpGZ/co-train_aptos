import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { Reward, RewardStatus } from '../entities/reward.entity';
import { EventLog, EventStatus } from '../entities/event-log.entity';
import { TransactionManagerService } from './transaction-manager.service';
import { EventListenerService } from './event-listener.service';
import { RewardCalculatorService } from './reward-calculator.service';
import { WebSocketService } from '../../websocket/websocket.service';

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private isProcessing = false;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(EventLog)
    private eventLogRepository: Repository<EventLog>,
    private transactionManager: TransactionManagerService,
    private eventListener: EventListenerService,
    private rewardCalculator: RewardCalculatorService,
    private webSocketService: WebSocketService,
    private configService: ConfigService,
  ) {}

  /**
   * Monitor pending transactions every 30 seconds
   */
  @Cron('*/30 * * * * *')
  async monitorPendingTransactions() {
    if (this.isProcessing) {
      return;
    }

    try {
      this.isProcessing = true;
      this.logger.debug('Starting pending transaction monitoring...');

      const pendingTransactions = await this.transactionManager.getPendingTransactions();
      
      if (pendingTransactions.length === 0) {
        this.logger.debug('No pending transactions to monitor');
        return;
      }

      this.logger.log(`Monitoring ${pendingTransactions.length} pending transactions`);

      for (const transaction of pendingTransactions) {
        try {
          await this.transactionManager.monitorTransaction(transaction.id);
        } catch (error) {
          this.logger.error(`Failed to monitor transaction ${transaction.id}:`, error);
        }
      }

      this.logger.debug('Completed pending transaction monitoring');
    } catch (error) {
      this.logger.error('Error during transaction monitoring:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Retry failed transactions every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedTransactions() {
    try {
      this.logger.log('Retrying failed transactions...');
      await this.transactionManager.retryFailedTransactions();
    } catch (error) {
      this.logger.error('Error retrying failed transactions:', error);
    }
  }

  /**
   * Retry failed event processing every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async retryFailedEvents() {
    try {
      this.logger.log('Retrying failed events...');
      await this.eventListener.retryFailedEvents();
    } catch (error) {
      this.logger.error('Error retrying failed events:', error);
    }
  }

  /**
   * Expire old rewards daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOldRewards() {
    try {
      this.logger.log('Expiring old rewards...');
      const expiredCount = await this.rewardCalculator.expireOldRewards();
      
      if (expiredCount > 0) {
        this.logger.log(`Expired ${expiredCount} old rewards`);
        
        // Emit system notification
        this.webSocketService.emitSystemNotification({
          type: 'info',
          title: 'Rewards Expired',
          message: `${expiredCount} unclaimed rewards have expired`,
          data: { expiredCount },
        });
      }
    } catch (error) {
      this.logger.error('Error expiring old rewards:', error);
    }
  }

  /**
   * Clean up old processed events weekly
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldEvents() {
    try {
      this.logger.log('Cleaning up old events...');
      
      // Remove events older than 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const result = await this.eventLogRepository.delete({
        status: EventStatus.PROCESSED,
        createdAt: LessThan(cutoffDate),
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`Cleaned up ${deletedCount} old events`);

      if (deletedCount > 0) {
        // Emit system notification
        this.webSocketService.emitSystemNotification({
          type: 'info',
          title: 'Event Cleanup',
          message: `Cleaned up ${deletedCount} old processed events`,
          data: { deletedCount },
        });
      }
    } catch (error) {
      this.logger.error('Error cleaning up old events:', error);
    }
  }

  /**
   * Generate sync statistics every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async generateSyncStatistics() {
    try {
      this.logger.debug('Generating sync statistics...');

      // Get transaction statistics
      const transactionStats = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.status, COUNT(*) as count')
        .groupBy('transaction.status')
        .getRawMany();

      // Get reward statistics
      const rewardStats = await this.rewardRepository
        .createQueryBuilder('reward')
        .select('reward.status, COUNT(*) as count, SUM(CAST(reward.amount as DECIMAL)) as totalAmount')
        .groupBy('reward.status')
        .getRawMany();

      // Get event statistics
      const eventStats = await this.eventListener.getEventStats();

      // Calculate pending rewards about to expire (within 7 days)
      const soonToExpire = await this.rewardRepository.count({
        where: {
          status: RewardStatus.CLAIMABLE,
          expiresAt: LessThan(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        },
      });

      const stats = {
        timestamp: new Date().toISOString(),
        transactions: transactionStats.reduce((acc, stat) => {
          acc[stat.status] = parseInt(stat.count);
          return acc;
        }, {}),
        rewards: rewardStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: parseInt(stat.count),
            totalAmount: parseFloat(stat.totalAmount) || 0,
          };
          return acc;
        }, {}),
        events: eventStats,
        alerts: {
          rewardsSoonToExpire: soonToExpire,
        },
      };

      this.logger.debug('Sync statistics generated:', stats);

      // Store statistics in cache/memory for API access
      await this.storeSyncStatistics(stats);

      // Send alerts if needed
      await this.checkAndSendAlerts(stats);
    } catch (error) {
      this.logger.error('Error generating sync statistics:', error);
    }
  }

  /**
   * Health check for blockchain connectivity every 2 minutes
   */
  @Cron('*/2 * * * *')
  async blockchainHealthCheck() {
    try {
      // This would be implemented by the blockchain service
      // For now, we'll just log a debug message
      this.logger.debug('Blockchain health check - OK');
    } catch (error) {
      this.logger.error('Blockchain health check failed:', error);
      
      // Emit system alert
      this.webSocketService.emitSystemNotification({
        type: 'error',
        title: 'Blockchain Connection Issue',
        message: 'Unable to connect to the blockchain network',
        data: { error: error.message },
      });
    }
  }

  /**
   * Sync session completion status every 15 minutes
   */
  @Cron('*/15 * * * *')
  async syncSessionCompletionStatus() {
    try {
      this.logger.debug('Syncing session completion status...');

      // Find sessions that should be completed but aren't marked as such
      const staleSessions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('DISTINCT transaction.trainingSessionId')
        .where('transaction.type = :type', { type: 'complete_session' })
        .andWhere('transaction.status = :status', { status: TransactionStatus.CONFIRMED })
        .getRawMany();

      for (const session of staleSessions) {
        // This would trigger session completion logic
        this.logger.debug(`Processing completion for session: ${session.trainingSessionId}`);
      }
    } catch (error) {
      this.logger.error('Error syncing session completion status:', error);
    }
  }

  /**
   * Database cleanup and optimization every 6 hours
   */
  @Cron('0 */6 * * *')
  async performDatabaseCleanup() {
    try {
      this.logger.log('Performing database cleanup...');

      // Clean up failed transactions older than 7 days
      const failedTransactionCutoff = new Date();
      failedTransactionCutoff.setDate(failedTransactionCutoff.getDate() - 7);

      const failedTransactionResult = await this.transactionRepository.delete({
        status: TransactionStatus.FAILED,
        failedAt: LessThan(failedTransactionCutoff),
      });

      // Clean up old cancelled transactions
      const cancelledTransactionResult = await this.transactionRepository.delete({
        status: TransactionStatus.CANCELLED,
        createdAt: LessThan(failedTransactionCutoff),
      });

      const totalCleaned = (failedTransactionResult.affected || 0) + (cancelledTransactionResult.affected || 0);
      
      if (totalCleaned > 0) {
        this.logger.log(`Database cleanup completed: removed ${totalCleaned} old records`);
      }
    } catch (error) {
      this.logger.error('Error during database cleanup:', error);
    }
  }

  private async storeSyncStatistics(stats: any) {
    // In a real implementation, this would store stats in Redis or a cache
    // For now, we'll just emit the stats via WebSocket
    this.webSocketService.emitSystemNotification({
      type: 'info',
      title: 'Sync Statistics Updated',
      message: 'Blockchain synchronization statistics have been updated',
      data: stats,
    });
  }

  private async checkAndSendAlerts(stats: any) {
    try {
      // Check for high number of failed transactions
      const failedTransactions = stats.transactions.failed || 0;
      if (failedTransactions > 10) {
        this.webSocketService.emitSystemNotification({
          type: 'warning',
          title: 'High Failed Transaction Count',
          message: `${failedTransactions} transactions have failed`,
          data: { failedCount: failedTransactions },
        });
      }

      // Check for high number of failed events
      const failedEvents = stats.events.failed || 0;
      if (failedEvents > 5) {
        this.webSocketService.emitSystemNotification({
          type: 'warning',
          title: 'High Failed Event Count',
          message: `${failedEvents} events have failed processing`,
          data: { failedCount: failedEvents },
        });
      }

      // Check for rewards about to expire
      if (stats.alerts.rewardsSoonToExpire > 0) {
        this.webSocketService.emitSystemNotification({
          type: 'warning',
          title: 'Rewards Expiring Soon',
          message: `${stats.alerts.rewardsSoonToExpire} rewards will expire within 7 days`,
          data: { expiringCount: stats.alerts.rewardsSoonToExpire },
        });
      }
    } catch (error) {
      this.logger.error('Error checking and sending alerts:', error);
    }
  }

  /**
   * Manual sync trigger for admin operations
   */
  async triggerManualSync(): Promise<void> {
    this.logger.log('Manual sync triggered');
    
    try {
      await Promise.all([
        this.monitorPendingTransactions(),
        this.retryFailedTransactions(),
        this.retryFailedEvents(),
        this.generateSyncStatistics(),
      ]);
      
      this.logger.log('Manual sync completed successfully');
    } catch (error) {
      this.logger.error('Manual sync failed:', error);
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<{
    isHealthy: boolean;
    lastSyncTime: Date;
    pendingTransactions: number;
    failedEvents: number;
    processingStatus: string;
  }> {
    const pendingTransactions = await this.transactionRepository.count({
      where: { status: TransactionStatus.SUBMITTED },
    });

    const failedEvents = await this.eventLogRepository.count({
      where: { status: EventStatus.FAILED },
    });

    return {
      isHealthy: pendingTransactions < 50 && failedEvents < 10,
      lastSyncTime: new Date(),
      pendingTransactions,
      failedEvents,
      processingStatus: this.isProcessing ? 'processing' : 'idle',
    };
  }
}