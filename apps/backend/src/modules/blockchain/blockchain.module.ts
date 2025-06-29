import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { EventListenerService } from './services/event-listener.service';
import { TransactionManagerService } from './services/transaction-manager.service';
import { RewardCalculatorService } from './services/reward-calculator.service';
import { RewardDistributorService } from './services/reward-distributor.service';
import { SyncSchedulerService } from './services/sync-scheduler.service';
import { Transaction } from './entities/transaction.entity';
import { Reward } from './entities/reward.entity';
import { EventLog } from './entities/event-log.entity';
import { TrainingSession } from '../training/entities/training-session.entity';
import { User } from '../users/entities/user.entity';
import { Contributor } from '../contributors/entities/contributor.entity';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Transaction,
      Reward,
      EventLog,
      TrainingSession,
      User,
      Contributor,
    ]),
    WebSocketModule,
  ],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    EventListenerService,
    TransactionManagerService,
    RewardCalculatorService,
    RewardDistributorService,
    SyncSchedulerService,
  ],
  exports: [
    BlockchainService,
    EventListenerService,
    TransactionManagerService,
    RewardCalculatorService,
    RewardDistributorService,
    SyncSchedulerService,
  ],
})
export class BlockchainModule {}