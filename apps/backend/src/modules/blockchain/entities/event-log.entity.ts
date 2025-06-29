import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EventType {
  SESSION_CREATED = 'session_created',
  PARTICIPANT_REGISTERED = 'participant_registered',
  CONTRIBUTION_SUBMITTED = 'contribution_submitted',
  SESSION_COMPLETED = 'session_completed',
  REWARD_CALCULATED = 'reward_calculated',
  REWARD_DISTRIBUTED = 'reward_distributed',
  REWARD_CLAIMED = 'reward_claimed',
}

export enum EventStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  IGNORED = 'ignored',
}

@Entity('blockchain_event_logs')
@Index(['eventType'])
@Index(['status'])
@Index(['blockHeight'])
@Index(['transactionHash'])
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  status: EventStatus;

  @Column()
  transactionHash: string;

  @Column({ type: 'bigint' })
  blockHeight: string;

  @Column()
  eventGuid: string;

  @Column({ type: 'bigint' })
  sequenceNumber: string;

  @Column({ type: 'jsonb' })
  eventData: {
    type: string;
    data: any;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  processedData: {
    entities?: any[];
    actions?: string[];
    errors?: string[];
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  lastRetryAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual fields
  get needsProcessing(): boolean {
    return this.status === EventStatus.PENDING;
  }

  get canRetry(): boolean {
    return this.status === EventStatus.FAILED && this.retryCount < 3;
  }

  get isProcessed(): boolean {
    return this.status === EventStatus.PROCESSED;
  }
}