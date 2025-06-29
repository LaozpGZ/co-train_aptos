export interface SessionDetails {
  id: string;
  name: string;
  rewardAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  status: SessionStatus;
  createdAt: Date;
  completedAt?: Date;
  participants: ParticipantInfo[];
  description?: string;
  duration?: number;
  creator?: string;
}

export interface ParticipantInfo {
  address: string;
  score: number;
  joinedAt: Date;
  contributionSubmittedAt?: Date;
  rewardClaimed: boolean;
  rewardAmount?: number;
}

export interface RewardDistribution {
  participantAddress: string;
  score: number;
  rewardAmount: number;
  percentage: number;
}

export interface ClaimableReward {
  sessionId: string;
  sessionName: string;
  amount: number;
  claimableAt: Date;
  expiresAt?: Date;
}

export interface GlobalStats {
  totalSessions: number;
  totalParticipants: number;
  totalRewardsDistributed: number;
  averageSessionReward: number;
  averageParticipantsPerSession: number;
}

export enum SessionStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  CREATE_SESSION = 'create_session',
  REGISTER_PARTICIPANT = 'register_participant',
  SUBMIT_CONTRIBUTION = 'submit_contribution',
  COMPLETE_SESSION = 'complete_session',
  CLAIM_REWARD = 'claim_reward',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ContractEvent {
  type: string;
  data: any;
  sequenceNumber: string;
  creationNumber: string;
  accountAddress: string;
}

export interface SessionCreatedEvent {
  sessionId: string;
  name: string;
  rewardAmount: number;
  maxParticipants: number;
  creator: string;
  timestamp: number;
}

export interface ParticipantRegisteredEvent {
  sessionId: string;
  participantAddress: string;
  timestamp: number;
}

export interface ContributionSubmittedEvent {
  sessionId: string;
  participantAddress: string;
  score: number;
  timestamp: number;
}

export interface SessionCompletedEvent {
  sessionId: string;
  totalParticipants: number;
  totalRewardsDistributed: number;
  timestamp: number;
}

export interface RewardDistributedEvent {
  sessionId: string;
  participantAddress: string;
  rewardAmount: number;
  timestamp: number;
}

export interface RewardClaimedEvent {
  sessionId: string;
  participantAddress: string;
  rewardAmount: number;
  timestamp: number;
}