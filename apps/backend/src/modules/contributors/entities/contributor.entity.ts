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

export enum ContributorStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  TRAINING = 'training',
  MAINTENANCE = 'maintenance',
}

export enum ContributorTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

@Entity('contributors')
@Index(['userId'])
@Index(['status'])
@Index(['tier'])
export class Contributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: ContributorStatus,
    default: ContributorStatus.OFFLINE,
  })
  status: ContributorStatus;

  @Column({
    type: 'enum',
    enum: ContributorTier,
    default: ContributorTier.BRONZE,
  })
  tier: ContributorTier;

  @Column({ type: 'int', default: 0 })
  totalContributions: number;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  totalEarnings: number;

  @Column({ type: 'int', default: 0 })
  reputationScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  successRate: number;

  @Column({ type: 'int', default: 0 })
  uptime: number; // in hours

  @Column({ type: 'jsonb', nullable: true })
  hardware: {
    gpu?: {
      model: string;
      memory: string;
      count: number;
    };
    cpu?: {
      model: string;
      cores: number;
      threads: number;
    };
    ram?: {
      total: string;
      available: string;
    };
    storage?: {
      type: 'SSD' | 'HDD';
      capacity: string;
    };
    network?: {
      bandwidth: string;
      latency: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  capabilities: {
    supportedModels: string[];
    maxBatchSize: number;
    specializations: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  performance: {
    averageSpeed: number;
    reliability: number;
    efficiency: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  availability: {
    timezone: string;
    schedule: Record<string, any>;
    maxHoursPerDay: number;
  };

  @Column({ nullable: true })
  lastActiveAt: Date;

  @Column({ nullable: true })
  lastContributionAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.contributorProfiles)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: true })
  currentTrainingSessionId: string;

  @ManyToOne(() => TrainingSession, (session) => session.participants)
  @JoinColumn({ name: 'currentTrainingSessionId' })
  currentTrainingSession: TrainingSession;

  // Virtual fields
  get isOnline(): boolean {
    return this.status === ContributorStatus.ONLINE;
  }

  get isAvailable(): boolean {
    return [ContributorStatus.ONLINE, ContributorStatus.OFFLINE].includes(this.status);
  }

  get hourlyRate(): number {
    // Calculate hourly rate based on tier and performance
    const baseRates = {
      [ContributorTier.BRONZE]: 10,
      [ContributorTier.SILVER]: 25,
      [ContributorTier.GOLD]: 50,
      [ContributorTier.PLATINUM]: 100,
      [ContributorTier.DIAMOND]: 200,
    };
    
    const baseRate = baseRates[this.tier];
    const performanceMultiplier = this.performance?.efficiency || 1;
    
    return Math.round(baseRate * performanceMultiplier);
  }
}