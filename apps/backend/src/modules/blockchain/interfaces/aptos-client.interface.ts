export interface AptosConfig {
  network: 'testnet' | 'mainnet' | 'devnet';
  nodeUrl: string;
  contractAddress: string;
  privateKey?: string;
}

export interface AptosClientInterface {
  /**
   * Initialize the Aptos client with configuration
   */
  initialize(config: AptosConfig): Promise<void>;

  /**
   * Check if the client is properly initialized and connected
   */
  isConnected(): Promise<boolean>;

  /**
   * Get the current network information
   */
  getNetworkInfo(): Promise<NetworkInfo>;

  /**
   * Get account information by address
   */
  getAccountInfo(address: string): Promise<AccountInfo>;

  /**
   * Get transaction details by hash
   */
  getTransaction(hash: string): Promise<TransactionInfo>;

  /**
   * Submit a transaction to the blockchain
   */
  submitTransaction(payload: TransactionPayload): Promise<string>;

  /**
   * Wait for transaction confirmation
   */
  waitForTransaction(hash: string, timeoutMs?: number): Promise<TransactionInfo>;
}

export interface NetworkInfo {
  chainId: number;
  epoch: string;
  ledgerVersion: string;
  oldestLedgerVersion: string;
  ledgerTimestamp: string;
  nodeRole: string;
  oldestBlockHeight: string;
  blockHeight: string;
  gitHash: string;
}

export interface AccountInfo {
  sequenceNumber: string;
  authenticationKey: string;
}

export interface TransactionInfo {
  version: string;
  hash: string;
  stateChangeHash: string;
  eventRootHash: string;
  stateCheckpointHash?: string;
  gasUsed: string;
  success: boolean;
  vmStatus: string;
  accumulatorRootHash: string;
  changes: any[];
  events: any[];
  timestamp: string;
  type: string;
}

export interface TransactionPayload {
  type: string;
  function: string;
  arguments: any[];
  type_arguments: string[];
}