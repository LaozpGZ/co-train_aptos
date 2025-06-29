// Main module export
export { BlockchainModule } from './blockchain.module';
export { BlockchainService } from './blockchain.service';
export { BlockchainController } from './blockchain.controller';

// DTOs
export { CreateSessionDto } from './dto/create-session.dto';
export { RegisterParticipantDto } from './dto/register-participant.dto';
export { SubmitContributionDto } from './dto/submit-contribution.dto';
export { TransactionResponseDto, TransactionResponse } from './dto/transaction-response.dto';

// Interfaces
export {
  AptosConfig,
  AptosClientInterface,
  NetworkInfo,
  AccountInfo,
  TransactionInfo,
  TransactionPayload,
} from './interfaces/aptos-client.interface';

export {
  SessionDetails,
  ParticipantInfo,
  RewardDistribution,
  ClaimableReward,
  GlobalStats,
  SessionStatus,
  TransactionType,
  TransactionStatus,
  ContractEvent,
  SessionCreatedEvent,
  ParticipantRegisteredEvent,
  ContributionSubmittedEvent,
  SessionCompletedEvent,
  RewardDistributedEvent,
  RewardClaimedEvent,
} from './interfaces/contract-interaction.interface';

// Constants
export {
  CONTRACT_ADDRESSES,
  CONTRACT_FUNCTIONS,
  CONTRACT_RESOURCES,
  CONTRACT_EVENTS,
  NETWORK_CONFIG,
  TRANSACTION_CONFIG,
  VALIDATION_CONSTANTS,
  getContractAddress,
  getNetworkConfig,
} from './constants/contract-addresses';

// Utils
export {
  isValidAptosAddress,
  isValidTransactionHash,
  normalizeAptosAddress,
  isValidSessionId,
  isValidScore,
  isValidRewardAmount,
  isValidParticipantCount,
  isValidSessionName,
  isValidSessionDescription,
  isValidSessionDuration,
} from './utils/address-validator';

export {
  createTransactionResponse,
  createSuccessResponse,
  createFailureResponse,
  waitForTransactionConfirmation,
  executeWithRetry,
  sleep,
  formatTransactionHash,
  aptToOctas,
  octasToApt,
  isValidTransactionPayload,
  estimateGasCost,
} from './utils/transaction-helper';