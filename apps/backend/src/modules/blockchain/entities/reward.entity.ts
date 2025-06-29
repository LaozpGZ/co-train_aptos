import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TrainingSession } from '../../training/entities/training-session.entity';
import { Transaction } from './transaction.entity';

export enum RewardStatus {
  PENDING = 'pending',
  CLAIMABLE = 'claimable',
  CLAIMED = 'claimed',
  EXPIRED = 'expired',
}

export enum RewardType {
  PARTICIPATION = 'participation',
  PERFORMANCE = 'performance',
  COMPLETION = 'completion',
  BONUS = 'bonus',
}

@Entity('rewards')
@Index(['userId'])
@Index(['status'])
@Index(['type'])
@Index(['trainingSessionId'])
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: RewardType,
  })
  type: RewardType;

  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.PENDING,
  })
  status: RewardStatus;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceScore: number;

  @Column({ type: 'int', nullable: true })
  participationDurationMinutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  contributionWeight: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    calculations?: any;
    metrics?: any;
    bonusReasons?: string[];
    [key: string]: any;
  };

  @Column({ nullable: true })
  calculatedAt: Date;

  @Column({ nullable: true })
  claimedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  trainingSessionId: string;

  @ManyToOne(() => TrainingSession)
  @JoinColumn({ name: 'trainingSessionId' })
  trainingSession: TrainingSession;

  @Column('uuid', { nullable: true })
  claimTransactionId: string;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'claimTransactionId' })
  claimTransaction: Transaction;

  // Virtual fields
  get isClaimable(): boolean {
    return this.status === RewardStatus.CLAIMABLE && 
           (!this.expiresAt || this.expiresAt > new Date());
  }

  get isClaimed(): boolean {
    return this.status === RewardStatus.CLAIMED;
  }

  get isExpired(): boolean {
    return this.status === RewardStatus.EXPIRED || 
           (this.expiresAt && this.expiresAt <= new Date());
  }

  get daysUntilExpiry(): number {
    if (!this.expiresAt) return Infinity;
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}