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

export enum TransactionType {
  CREATE_SESSION = 'create_session',
  REGISTER_PARTICIPANT = 'register_participant',
  SUBMIT_CONTRIBUTION = 'submit_contribution',
  COMPLETE_SESSION = 'complete_session',
  CLAIM_REWARD = 'claim_reward',
  DISTRIBUTE_REWARDS = 'distribute_rewards',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('blockchain_transactions')
@Index(['userId'])
@Index(['status'])
@Index(['type'])
@Index(['hash'])
@Index(['blockHeight'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  hash: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'bigint', nullable: true })
  blockHeight: string;

  @Column({ type: 'bigint', nullable: true })
  gasUsed: string;

  @Column({ type: 'bigint', nullable: true })
  gasPrice: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  amount: string;

  @Column({ nullable: true })
  fromAddress: string;

  @Column({ nullable: true })
  toAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: {
    function: string;
    arguments: any[];
    type_arguments?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  events: Array<{
    type: string;
    data: any;
    guid: string;
    sequence_number: string;
  }>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  confirmations: number;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  failedAt: Date;

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

  @Column('uuid', { nullable: true })
  trainingSessionId: string;

  @ManyToOne(() => TrainingSession, { nullable: true })
  @JoinColumn({ name: 'trainingSessionId' })
  trainingSession: TrainingSession;

  // Virtual fields
  get isCompleted(): boolean {
    return this.status === TransactionStatus.CONFIRMED;
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  get isPending(): boolean {
    return [TransactionStatus.PENDING, TransactionStatus.SUBMITTED].includes(this.status);
  }

  get duration(): number {
    if (this.submittedAt && this.confirmedAt) {
      return this.confirmedAt.getTime() - this.submittedAt.getTime();
    }
    return 0;
  }

  get explorerUrl(): string {
    if (!this.hash) return '';
    // Aptos mainnet explorer URL
    return `https://explorer.aptoslabs.com/txn/${this.hash}`;
  }
}