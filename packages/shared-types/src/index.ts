// User related types
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  training: boolean;
  rewards: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showWalletAddress: boolean;
  showTrainingHistory: boolean;
}

// Training related types
export interface TrainingSession {
  id: string;
  title: string;
  description: string;
  modelType: string;
  dataset: string;
  status: TrainingStatus;
  creatorId: string;
  participants: string[];
  maxParticipants: number;
  rewardPool: string; // Amount in tokens
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TrainingStatus = 
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface TrainingContribution {
  id: string;
  sessionId: string;
  contributorId: string;
  dataPoints: number;
  computeTime: number; // in seconds
  qualityScore: number; // 0-100
  rewardAmount: string;
  submittedAt: Date;
  verifiedAt?: Date;
}

// Contributor related types
export interface Contributor {
  id: string;
  userId: string;
  totalContributions: number;
  totalRewards: string;
  reputation: number;
  specializations: string[];
  joinedAt: Date;
}

export interface ContributorStats {
  contributorId: string;
  sessionsParticipated: number;
  totalDataPoints: number;
  totalComputeTime: number;
  averageQualityScore: number;
  totalEarnings: string;
  rank: number;
}

// Blockchain related types
export interface BlockchainTransaction {
  id: string;
  hash: string;
  type: TransactionType;
  from: string;
  to?: string;
  amount?: string;
  status: TransactionStatus;
  blockNumber?: number;
  gasUsed?: string;
  timestamp: Date;
}

export type TransactionType = 
  | 'reward_distribution'
  | 'session_creation'
  | 'participation_fee'
  | 'withdrawal';

export type TransactionStatus = 
  | 'pending'
  | 'confirmed'
  | 'failed';

// API related types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface AuthUser {
  id: string;
  walletAddress: string;
  username?: string;
  roles: string[];
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface TrainingUpdateMessage extends WebSocketMessage {
  type: 'training_update';
  payload: {
    sessionId: string;
    status: TrainingStatus;
    progress?: number;
    message?: string;
  };
}

export interface RewardDistributionMessage extends WebSocketMessage {
  type: 'reward_distribution';
  payload: {
    sessionId: string;
    contributorId: string;
    amount: string;
    transactionHash: string;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class CoTrainError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CoTrainError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;