import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Contributor } from '../../contributors/entities/contributor.entity';

export enum TrainingStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TrainingType {
  LANGUAGE_MODEL = 'language_model',
  COMPUTER_VISION = 'computer_vision',
  REINFORCEMENT_LEARNING = 'reinforcement_learning',
  FEDERATED_LEARNING = 'federated_learning',
  CUSTOM = 'custom',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('training_sessions')
@Index(['userId'])
@Index(['status'])
@Index(['type'])
export class TrainingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TrainingType,
    default: TrainingType.CUSTOM,
  })
  type: TrainingType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.BEGINNER,
  })
  difficulty: DifficultyLevel;

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.PENDING,
  })
  status: TrainingStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ type: 'int', default: 0 })
  estimatedDurationMinutes: number;

  @Column({ type: 'int', default: 0 })
  actualDurationMinutes: number;

  @Column({ type: 'int', default: 1 })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    minGPU?: string;
    minRAM?: string;
    bandwidth?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  rewards: {
    tokens: number;
    reputation: number;
    nfts?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metrics: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  logs: Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'warn' | 'error';
  }>;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.trainingSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Contributor, (contributor) => contributor.currentTrainingSession)
  participants: Contributor[];

  // Virtual fields
  get isActive(): boolean {
    return [TrainingStatus.PENDING, TrainingStatus.RUNNING, TrainingStatus.PAUSED].includes(this.status);
  }

  get isCompleted(): boolean {
    return this.status === TrainingStatus.COMPLETED;
  }

  get duration(): number {
    if (this.startedAt && this.completedAt) {
      return Math.floor((this.completedAt.getTime() - this.startedAt.getTime()) / (1000 * 60));
    }
    return 0;
  }
}