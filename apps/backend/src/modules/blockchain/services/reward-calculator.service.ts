import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward, RewardStatus, RewardType } from '../entities/reward.entity';
import { TrainingSession } from '../../training/entities/training-session.entity';
import { User } from '../../users/entities/user.entity';
import { Contributor } from '../../contributors/entities/contributor.entity';
import { WebSocketService } from '../../websocket/websocket.service';

export interface RewardCalculationParams {
  sessionId: string;
  totalRewardPool: number;
  participantContributions: {
    userId: string;
    address: string;
    score: number;
    participationTime: number; // in minutes
    quality: number; // 0-1 scale
  }[];
}

export interface RewardDistribution {
  userId: string;
  address: string;
  type: RewardType;
  amount: number;
  metadata: {
    participationTime: number;
    score: number;
    quality: number;
    baseReward: number;
    performanceBonus: number;
    participationBonus: number;
  };
}

@Injectable()
export class RewardCalculatorService {
  private readonly logger = new Logger(RewardCalculatorService.name);

  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(TrainingSession)
    private trainingSessionRepository: Repository<TrainingSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private webSocketService: WebSocketService,
  ) {}

  async calculateSessionRewards(params: RewardCalculationParams): Promise<RewardDistribution[]> {
    try {
      this.logger.log(`Calculating rewards for session ${params.sessionId}`);

      // Validate session exists
      const session = await this.trainingSessionRepository.findOne({
        where: { id: params.sessionId },
      });

      if (!session) {
        throw new Error(`Session ${params.sessionId} not found`);
      }

      // Calculate base reward allocation
      const baseRewardPerParticipant = params.totalRewardPool * 0.6; // 60% for participation
      const performanceRewardPool = params.totalRewardPool * 0.3; // 30% for performance
      const bonusRewardPool = params.totalRewardPool * 0.1; // 10% for bonuses

      const totalParticipants = params.participantContributions.length;
      const individualBaseReward = baseRewardPerParticipant / totalParticipants;

      // Calculate total weighted score for performance distribution
      const totalWeightedScore = params.participantContributions.reduce(
        (total, contribution) => total + (contribution.score * contribution.quality),
        0
      );

      // Calculate individual rewards
      const distributions: RewardDistribution[] = [];

      for (const contribution of params.participantContributions) {
        const user = await this.userRepository.findOne({
          where: { walletAddress: contribution.address },
        });

        if (!user) {
          this.logger.warn(`User not found for address: ${contribution.address}`);
          continue;
        }

        // Calculate base participation reward
        const baseReward = individualBaseReward;

        // Calculate performance bonus based on weighted score
        const weightedScore = contribution.score * contribution.quality;
        const performanceBonus = totalWeightedScore > 0 
          ? (performanceRewardPool * weightedScore) / totalWeightedScore 
          : 0;

        // Calculate participation time bonus
        const minParticipationTime = Math.min(...params.participantContributions.map(c => c.participationTime));
        const maxParticipationTime = Math.max(...params.participantContributions.map(c => c.participationTime));
        const normalizedParticipationTime = maxParticipationTime > minParticipationTime
          ? (contribution.participationTime - minParticipationTime) / (maxParticipationTime - minParticipationTime)
          : 1;
        
        const participationBonus = bonusRewardPool * normalizedParticipationTime / totalParticipants;

        // Total reward amount
        const totalAmount = baseReward + performanceBonus + participationBonus;

        distributions.push({
          userId: user.id,
          address: contribution.address,
          type: RewardType.PARTICIPATION,
          amount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
          metadata: {
            participationTime: contribution.participationTime,
            score: contribution.score,
            quality: contribution.quality,
            baseReward: Math.round(baseReward * 100) / 100,
            performanceBonus: Math.round(performanceBonus * 100) / 100,
            participationBonus: Math.round(participationBonus * 100) / 100,
          },
        });
      }

      this.logger.log(`Calculated ${distributions.length} reward distributions for session ${params.sessionId}`);
      return distributions;
    } catch (error) {
      this.logger.error(`Failed to calculate rewards for session ${params.sessionId}:`, error);
      throw error;
    }
  }

  async distributeRewards(sessionId: string, distributions: RewardDistribution[]): Promise<Reward[]> {
    try {
      this.logger.log(`Distributing ${distributions.length} rewards for session ${sessionId}`);

      const rewards: Reward[] = [];

      for (const distribution of distributions) {
        // Check if reward already exists
        const existingReward = await this.rewardRepository.findOne({
          where: {
            userId: distribution.userId,
            trainingSessionId: sessionId,
            type: distribution.type,
          },
        });

        if (existingReward) {
          this.logger.warn(`Reward already exists for user ${distribution.userId} in session ${sessionId}`);
          continue;
        }

        // Create reward record
        const reward = this.rewardRepository.create({
          userId: distribution.userId,
          trainingSessionId: sessionId,
          type: distribution.type,
          amount: distribution.amount.toString(),
          status: RewardStatus.CLAIMABLE,
          metadata: {
            calculations: distribution.metadata,
            distributedAt: new Date().toISOString(),
          },
          calculatedAt: new Date(),
          // Set expiry date (30 days from now)
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        const savedReward = await this.rewardRepository.save(reward);
        rewards.push(savedReward);

        // Emit WebSocket notification
        this.webSocketService.emitNotification({
          userId: distribution.userId,
          type: 'success',
          title: 'Reward Available',
          message: `You've earned ${distribution.amount} APT tokens from training session`,
          data: {
            sessionId,
            amount: distribution.amount,
            rewardId: savedReward.id,
            type: distribution.type,
          },
        });
      }

      this.logger.log(`Successfully distributed ${rewards.length} rewards for session ${sessionId}`);
      return rewards;
    } catch (error) {
      this.logger.error(`Failed to distribute rewards for session ${sessionId}:`, error);
      throw error;
    }
  }

  async calculatePerformanceReward(
    sessionId: string,
    userId: string,
    performanceMetrics: {
      accuracy: number;
      efficiency: number;
      consistency: number;
    }
  ): Promise<RewardDistribution> {
    try {
      const session = await this.trainingSessionRepository.findOne({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Calculate performance score (weighted average)
      const performanceScore = (
        performanceMetrics.accuracy * 0.5 +
        performanceMetrics.efficiency * 0.3 +
        performanceMetrics.consistency * 0.2
      );

      // Get base performance reward from session configuration
      const basePerformanceReward = session.rewards?.tokens ? session.rewards.tokens * 0.2 : 10;
      
      // Scale reward based on performance score
      const rewardAmount = basePerformanceReward * performanceScore;

      return {
        userId,
        address: user.walletAddress,
        type: RewardType.PERFORMANCE,
        amount: Math.round(rewardAmount * 100) / 100,
        metadata: {
          participationTime: 0,
          score: Math.round(performanceScore * 100),
          quality: performanceScore,
          baseReward: basePerformanceReward,
          performanceBonus: rewardAmount - basePerformanceReward,
          participationBonus: 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to calculate performance reward:`, error);
      throw error;
    }
  }

  async calculateCompletionBonus(sessionId: string): Promise<RewardDistribution[]> {
    try {
      const session = await this.trainingSessionRepository.findOne({
        where: { id: sessionId },
        relations: ['participants'],
      });

      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Get all participants who completed the session
      const participants = await this.contributorRepository.find({
        where: { currentTrainingSessionId: sessionId },
        relations: ['user'],
      });

      const completionBonusPool = session.rewards?.tokens ? session.rewards.tokens * 0.1 : 5;
      const bonusPerParticipant = completionBonusPool / participants.length;

      const distributions: RewardDistribution[] = [];

      for (const participant of participants) {
        distributions.push({
          userId: participant.user.id,
          address: participant.user.walletAddress,
          type: RewardType.COMPLETION,
          amount: Math.round(bonusPerParticipant * 100) / 100,
          metadata: {
            participationTime: 0,
            score: 100,
            quality: 1,
            baseReward: bonusPerParticipant,
            performanceBonus: 0,
            participationBonus: 0,
          },
        });
      }

      return distributions;
    } catch (error) {
      this.logger.error(`Failed to calculate completion bonus:`, error);
      throw error;
    }
  }

  async getRewardsByUser(
    userId: string,
    options: {
      status?: RewardStatus;
      type?: RewardType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ rewards: Reward[]; total: number }> {
    const query = this.rewardRepository.createQueryBuilder('reward')
      .where('reward.userId = :userId', { userId })
      .leftJoinAndSelect('reward.trainingSession', 'trainingSession')
      .orderBy('reward.createdAt', 'DESC');

    if (options.status) {
      query.andWhere('reward.status = :status', { status: options.status });
    }

    if (options.type) {
      query.andWhere('reward.type = :type', { type: options.type });
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.offset(options.offset);
    }

    const [rewards, total] = await query.getManyAndCount();
    return { rewards, total };
  }

  async getUserRewardStats(userId: string): Promise<{
    totalEarned: number;
    totalClaimed: number;
    totalPending: number;
    rewardsByType: Record<RewardType, number>;
    recentRewards: Reward[];
  }> {
    const allRewards = await this.rewardRepository.find({
      where: { userId },
      relations: ['trainingSession'],
    });

    const totalEarned = allRewards.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);
    const totalClaimed = allRewards
      .filter(r => r.status === RewardStatus.CLAIMED)
      .reduce((sum, reward) => sum + parseFloat(reward.amount), 0);
    const totalPending = allRewards
      .filter(r => r.status === RewardStatus.CLAIMABLE)
      .reduce((sum, reward) => sum + parseFloat(reward.amount), 0);

    const rewardsByType = allRewards.reduce((acc, reward) => {
      acc[reward.type] = (acc[reward.type] || 0) + parseFloat(reward.amount);
      return acc;
    }, {} as Record<RewardType, number>);

    const recentRewards = allRewards
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalEarned: Math.round(totalEarned * 100) / 100,
      totalClaimed: Math.round(totalClaimed * 100) / 100,
      totalPending: Math.round(totalPending * 100) / 100,
      rewardsByType,
      recentRewards,
    };
  }

  async expireOldRewards(): Promise<number> {
    const expiredRewards = await this.rewardRepository.update(
      {
        status: RewardStatus.CLAIMABLE,
        expiresAt: { $lte: new Date() } as any,
      },
      {
        status: RewardStatus.EXPIRED,
      }
    );

    this.logger.log(`Expired ${expiredRewards.affected} old rewards`);
    return expiredRewards.affected || 0;
  }
}