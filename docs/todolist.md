# CoTrain Aptos 开发任务清单

## 📋 总体进度概览

### 按模块进度统计
- **智能合约**: ✅ 完成 (100%) - 15/15 任务完成
- **后端区块链集成**: ❌ 未开始 (0%) - 0/12 任务完成
  - 区块链服务基础架构: 0/23 子任务
  - 交易管理和状态跟踪: 0/15 子任务
  - 会话状态同步: 0/15 子任务
  - 奖励计算和分发: 0/9 子任务
- **前端钱包功能**: 🔄 部分完成 (30%) - 3/10 任务完成
  - 合约交互 Hooks: 0/15 子任务
  - 余额和奖励查询: 0/5 子任务
  - 训练会话界面: 0/25 子任务
  - 奖励提取界面: 0/18 子任务
- **UI/UX 优化**: 🔄 部分完成 (40%) - 4/10 任务完成
  - 响应式设计和加载状态: 0/25 子任务
  - 错误处理和用户引导: 0/18 子任务
  - 实时功能: 0/20 子任务
  - 通知系统: 0/12 子任务
- **高级功能**: ❌ 未开始 (0%) - 0/18 任务完成
  - 数据分析和仪表板: 0/22 子任务
  - 批量操作和高级查询: 0/22 子任务
  - 性能优化: 0/22 子任务
  - 安全和监控: 0/28 子任务
- **测试**: ❌ 未开始 (0%) - 0/20 任务完成
  - 单元测试: 0/30 子任务
  - 集成测试: 0/23 子任务
- **部署**: ❌ 未开始 (0%) - 0/15 任务完成
  - 环境配置: 0/30 子任务
  - 智能合约部署: 0/17 子任务

### 📊 整体进度统计
- **总任务数**: 65 个主任务 (包含 397 个子任务)
- **已完成**: 22 个主任务 (33.8%)
- **进行中**: 0 个
- **待开始**: 43 个主任务 (66.2%)
- **预计总工时**: 572 小时
- **已投入工时**: 约 120 小时

---

## 🎯 阶段 1: 区块链集成基础 (高优先级)

### 📦 后端区块链模块 (`apps/backend/src/modules/blockchain/`)

#### 1.1 创建区块链服务基础架构 (进度: 0/3)
- [ ] **创建 blockchain 模块结构**
  ```
  apps/backend/src/modules/blockchain/
  ├── blockchain.module.ts
  ├── blockchain.service.ts
  ├── blockchain.controller.ts
  ├── dto/
  │   ├── create-session.dto.ts
  │   ├── register-participant.dto.ts
  │   ├── submit-contribution.dto.ts
  │   └── transaction-response.dto.ts
  ├── interfaces/
  │   ├── aptos-client.interface.ts
  │   └── contract-interaction.interface.ts
  └── constants/
      └── contract-addresses.ts
  ```
  **子任务进度 (0/8):**
  - [ ] 创建 `blockchain.module.ts` 模块定义
  - [ ] 创建 `blockchain.service.ts` 服务基础结构
  - [ ] 创建 `blockchain.controller.ts` 控制器
  - [ ] 创建 DTO 文件夹和相关数据传输对象
  - [ ] 创建 interfaces 文件夹和接口定义
  - [ ] 创建 constants 文件夹和合约地址常量
  - [ ] 配置模块导入导出
  - [ ] 编写基础单元测试
  
  - **估时**: 2小时
  - **负责人**: 后端开发
  - **依赖**: 无

- [ ] **实现 BlockchainService 核心服务**
  ```typescript
  // apps/backend/src/modules/blockchain/blockchain.service.ts
  @Injectable()
  export class BlockchainService {
    private aptosClient: AptosClient;
    private contractAddress: string;
    
    async createTrainingSession(params: CreateSessionParams): Promise<TransactionResponse>
    async registerParticipant(sessionId: string, participant: string): Promise<TransactionResponse>
    async submitContribution(sessionId: string, participant: string, score: number): Promise<TransactionResponse>
    async completeSession(sessionId: string): Promise<TransactionResponse>
    async getSessionDetails(sessionId: string): Promise<SessionDetails>
    async getParticipantScore(sessionId: string, participant: string): Promise<number>
    async getTotalRewardsDistributed(): Promise<number>
  }
  ```
  **子任务进度 (0/10):**
  - [ ] 初始化 Aptos 客户端连接
  - [ ] 实现 `createTrainingSession` 方法
  - [ ] 实现 `registerParticipant` 方法
  - [ ] 实现 `submitContribution` 方法
  - [ ] 实现 `completeSession` 方法
  - [ ] 实现 `getSessionDetails` 查询方法
  - [ ] 实现 `getParticipantScore` 查询方法
  - [ ] 实现 `getTotalRewardsDistributed` 查询方法
  - [ ] 添加错误处理和重试机制
  - [ ] 编写服务单元测试
  
  - **估时**: 8小时
  - **负责人**: 后端开发
  - **依赖**: Aptos SDK 集成

- [ ] **配置 Aptos 客户端连接**
  ```typescript
  // apps/backend/src/config/aptos.config.ts
  export const aptosConfig = {
    network: process.env.APTOS_NETWORK || 'testnet',
    nodeUrl: process.env.APTOS_NODE_URL,
    contractAddress: process.env.CONTRACT_ADDRESS,
    privateKey: process.env.ADMIN_PRIVATE_KEY,
  };
  ```
  **子任务进度 (0/5):**
  - [ ] 创建 Aptos 配置文件
  - [ ] 配置环境变量验证
  - [ ] 实现配置加载和验证逻辑
  - [ ] 添加网络切换支持 (testnet/mainnet)
  - [ ] 编写配置测试用例
  
  - **估时**: 2小时
  - **负责人**: 后端开发
  - **依赖**: 环境配置

#### 1.2 实现交易管理和状态跟踪 (进度: 0/2)
- [ ] **创建交易状态管理**
  ```typescript
  // apps/backend/src/modules/blockchain/entities/transaction.entity.ts
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    hash: string;
    
    @Column()
    type: TransactionType;
    
    @Column()
    status: TransactionStatus;
    
    @Column('json')
    payload: any;
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
  }
  ```
  **子任务进度 (0/7):**
  - [ ] 创建 Transaction 实体类
  - [ ] 定义 TransactionType 枚举
  - [ ] 定义 TransactionStatus 枚举
  - [ ] 创建 Transaction Repository
  - [ ] 实现交易状态更新方法
  - [ ] 添加数据库迁移文件
  - [ ] 编写实体测试用例
  
  - **估时**: 4小时
  - **负责人**: 后端开发
  - **依赖**: 数据库配置

- [ ] **实现事件监听服务**
  ```typescript
  // apps/backend/src/modules/blockchain/services/event-listener.service.ts
  @Injectable()
  export class EventListenerService {
    async startListening(): Promise<void>
    async handleSessionCreated(event: SessionCreatedEvent): Promise<void>
    async handleRewardDistributed(event: RewardDistributedEvent): Promise<void>
    async handleSessionCompleted(event: SessionCompletedEvent): Promise<void>
  }
  ```
  **子任务进度 (0/8):**
  - [ ] 实现事件监听器基础架构
  - [ ] 定义事件类型接口
  - [ ] 实现 `startListening` 方法
  - [ ] 实现 `handleSessionCreated` 事件处理
  - [ ] 实现 `handleRewardDistributed` 事件处理
  - [ ] 实现 `handleSessionCompleted` 事件处理
  - [ ] 添加事件重试和错误处理机制
  - [ ] 编写事件监听测试用例
  
  - **估时**: 6小时
  - **负责人**: 后端开发
  - **依赖**: 区块链服务

### 🎨 前端智能合约集成 (`apps/frontend/src/`)

#### 1.3 创建合约交互 Hooks (进度: 0/2)
- [ ] **实现 useAptosContract Hook**
  ```typescript
  // apps/frontend/src/hooks/useAptosContract.ts
  export const useAptosContract = () => {
    const { signAndSubmitTransaction, account } = useWallet();
    
    const createTrainingSession = async (name: string, rewardAmount: number)
    const registerForSession = async (sessionId: string)
    const claimRewards = async (sessionId: string)
    const getSessionDetails = async (sessionId: string)
    const getMyRewards = async ()
    
    return {
      createTrainingSession,
      registerForSession,
      claimRewards,
      getSessionDetails,
      getMyRewards,
      isLoading,
      error
    };
  };
  ```
  **子任务进度 (0/9):**
  - [ ] 创建 Hook 基础结构和状态管理
  - [ ] 实现 `createTrainingSession` 方法
  - [ ] 实现 `registerForSession` 方法
  - [ ] 实现 `claimRewards` 方法
  - [ ] 实现 `getSessionDetails` 查询方法
  - [ ] 实现 `getMyRewards` 查询方法
  - [ ] 添加加载状态和错误处理
  - [ ] 实现交易确认和状态跟踪
  - [ ] 编写 Hook 测试用例
  
  - **估时**: 6小时
  - **负责人**: 前端开发
  - **依赖**: 钱包集成

- [ ] **创建交易状态管理 Hook**
  ```typescript
  // apps/frontend/src/hooks/useTransactionStatus.ts
  export const useTransactionStatus = () => {
    const trackTransaction = async (hash: string)
    const getTransactionStatus = (hash: string)
    const clearTransaction = (hash: string)
    
    return {
      trackTransaction,
      getTransactionStatus,
      clearTransaction,
      pendingTransactions,
      completedTransactions
    };
  };
  ```
  **子任务进度 (0/6):**
  - [ ] 创建交易状态存储和管理
  - [ ] 实现 `trackTransaction` 方法
  - [ ] 实现 `getTransactionStatus` 查询方法
  - [ ] 实现 `clearTransaction` 清理方法
  - [ ] 添加交易状态持久化
  - [ ] 编写状态管理测试用例
  
  - **估时**: 4小时
  - **负责人**: 前端开发
  - **依赖**: 合约交互 Hook

#### 1.4 实现余额和奖励查询 (进度: 0/1)
- [ ] **创建余额查询组件**
  ```typescript
  // apps/frontend/src/components/wallet/WalletBalance.tsx
  export const WalletBalance = () => {
    // 显示 APT 余额
    // 显示可提取奖励
    // 显示总收益
  };
  ```
  **子任务进度 (0/5):**
  - [ ] 创建余额显示组件结构
  - [ ] 实现 APT 余额查询和显示
  - [ ] 实现可提取奖励查询和显示
  - [ ] 实现总收益统计和显示
  - [ ] 添加余额刷新和加载状态
  
  - **估时**: 3小时
  - **负责人**: 前端开发
  - **依赖**: 合约查询功能

---

## 🔄 阶段 2: 核心业务流程 (高优先级)

### 🏋️ 训练会话管理

#### 2.1 前端训练会话界面 (进度: 0/3)
- [ ] **创建训练会话创建页面**
  ```
  apps/frontend/src/app/training/create/
  ├── page.tsx
  └── components/
      ├── CreateSessionForm.tsx
      ├── RewardPoolInput.tsx
      └── SessionPreview.tsx
  ```
  **子任务进度 (0/8):**
  - [ ] 创建页面路由和基础布局
  - [ ] 实现 `CreateSessionForm` 表单组件
  - [ ] 实现 `RewardPoolInput` 奖励池输入组件
  - [ ] 实现 `SessionPreview` 预览组件
  - [ ] 添加表单验证和错误处理
  - [ ] 集成合约创建会话功能
  - [ ] 添加创建成功/失败反馈
  - [ ] 编写页面组件测试
  
  - **功能**: 会话名称、奖励池设置、参与条件
  - **估时**: 8小时
  - **负责人**: 前端开发
  - **依赖**: 合约交互 Hook

- [ ] **实现训练会话列表页面**
  ```typescript
  // apps/frontend/src/app/training/sessions/page.tsx
  export default function TrainingSessions() {
    // 显示活跃会话
    // 显示已完成会话
    // 搜索和过滤功能
    // 分页功能
  }
  ```
  **子任务进度 (0/7):**
  - [ ] 创建会话列表页面布局
  - [ ] 实现活跃会话列表显示
  - [ ] 实现已完成会话列表显示
  - [ ] 添加搜索功能
  - [ ] 添加状态过滤功能
  - [ ] 实现分页功能
  - [ ] 添加列表刷新和加载状态
  
  - **估时**: 6小时
  - **负责人**: 前端开发
  - **依赖**: API 集成

- [ ] **创建会话详情页面**
  ```
  apps/frontend/src/app/training/sessions/[id]/
  ├── page.tsx
  └── components/
      ├── SessionInfo.tsx
      ├── ParticipantsList.tsx
      ├── RewardDistribution.tsx
      └── JoinSessionButton.tsx
  ```
  **子任务进度 (0/10):**
  - [ ] 创建动态路由页面结构
  - [ ] 实现 `SessionInfo` 会话信息组件
  - [ ] 实现 `ParticipantsList` 参与者列表组件
  - [ ] 实现 `RewardDistribution` 奖励分配组件
  - [ ] 实现 `JoinSessionButton` 加入会话按钮
  - [ ] 添加会话状态管理和更新
  - [ ] 集成实时数据刷新
  - [ ] 添加参与/退出会话功能
  - [ ] 实现数据导出功能
  - [ ] 编写详情页面测试
  
  - **估时**: 10小时
  - **负责人**: 前端开发
  - **依赖**: 会话查询 API

#### 2.2 后端会话状态同步 (进度: 0/2)
- [ ] **扩展训练服务集成区块链**
  ```typescript
  // apps/backend/src/modules/training/training.service.ts
  export class TrainingService {
    async createSessionOnChain(sessionData: CreateSessionDto): Promise<TrainingSession>
    async syncSessionFromChain(sessionId: string): Promise<void>
    async registerParticipantOnChain(sessionId: string, userId: string): Promise<void>
    async completeSessionOnChain(sessionId: string): Promise<void>
  }
  ```
  **子任务进度 (0/8):**
  - [ ] 实现 `createSessionOnChain` 链上会话创建方法
  - [ ] 实现 `syncSessionFromChain` 链上数据同步方法
  - [ ] 实现 `registerParticipantOnChain` 参与者注册方法
  - [ ] 实现 `completeSessionOnChain` 会话完成方法
  - [ ] 添加区块链事件监听集成
  - [ ] 实现数据一致性检查和修复
  - [ ] 添加错误处理和重试机制
  - [ ] 编写服务扩展测试
  
  - **估时**: 8小时
  - **负责人**: 后端开发
  - **依赖**: 区块链服务

- [ ] **实现定时同步任务**
  ```typescript
  // apps/backend/src/modules/training/tasks/sync.task.ts
  @Injectable()
  export class SyncTask {
    @Cron('*/30 * * * * *') // 每30秒
    async syncActiveSessions(): Promise<void>
    
    @Cron('0 */5 * * * *') // 每5分钟
    async syncCompletedSessions(): Promise<void>
  }
  ```
  **子任务进度 (0/7):**
  - [ ] 创建 `SyncTask` 定时任务基础结构
  - [ ] 实现 `syncActiveSessions` 活跃会话同步任务
  - [ ] 实现 `syncCompletedSessions` 完成会话同步任务
  - [ ] 添加同步状态跟踪和日志记录
  - [ ] 实现同步错误处理和重试机制
  - [ ] 配置任务调度和监控
  - [ ] 编写定时任务测试
  
  - **估时**: 4小时
  - **负责人**: 后端开发
  - **依赖**: 调度模块

### 💰 奖励系统实现

#### 2.3 奖励提取界面 (进度: 0/2)
- [ ] **创建奖励仪表板**
  ```
  apps/frontend/src/app/rewards/
  ├── page.tsx
  └── components/
      ├── RewardsSummary.tsx
      ├── ClaimableRewards.tsx
      ├── RewardsHistory.tsx
      └── ClaimRewardsModal.tsx
  ```
  **子任务进度 (0/12):**
  - [ ] 创建奖励页面路由和基础布局
  - [ ] 实现 `RewardsSummary` 奖励汇总组件
  - [ ] 实现 `ClaimableRewards` 可提取奖励列表组件
  - [ ] 实现 `RewardsHistory` 奖励历史记录组件
  - [ ] 实现 `ClaimRewardsModal` 提取确认弹窗
  - [ ] 集成奖励查询和统计功能
  - [ ] 添加奖励提取操作和状态跟踪
  - [ ] 实现奖励数据筛选和排序
  - [ ] 添加奖励图表和可视化
  - [ ] 实现批量奖励提取功能
  - [ ] 添加奖励通知和提醒
  - [ ] 编写奖励仪表板测试
  
  - **功能**: 总收益、可提取奖励、历史记录、一键提取
  - **估时**: 12小时
  - **负责人**: 前端开发
  - **依赖**: 奖励查询 API

- [ ] **实现批量奖励提取**
  ```typescript
  // apps/frontend/src/components/rewards/BatchClaimRewards.tsx
  export const BatchClaimRewards = () => {
    // 选择多个会话
    // 批量提取奖励
    // 进度显示
    // 错误处理
  };
  ```
  - **估时**: 6小时
  - **负责人**: 前端开发
  - **依赖**: 批量交易功能

#### 2.4 奖励计算和分发 (进度: 0/1)
- [ ] **实现奖励计算服务**
  ```typescript
  // apps/backend/src/modules/rewards/rewards.service.ts
  @Injectable()
  export class RewardsService {
    async calculateRewards(sessionId: string): Promise<RewardDistribution[]>
    async distributeRewards(sessionId: string): Promise<void>
    async getClaimableRewards(userId: string): Promise<ClaimableReward[]>
    async processRewardClaim(userId: string, sessionIds: string[]): Promise<void>
  }
  ```
  **子任务进度 (0/9):**
  - [ ] 创建 `RewardsService` 基础结构
  - [ ] 实现 `calculateRewards` 奖励计算算法
  - [ ] 实现 `distributeRewards` 奖励分发方法
  - [ ] 实现 `getClaimableRewards` 可提取奖励查询
  - [ ] 实现 `processRewardClaim` 奖励提取处理
  - [ ] 添加奖励计算规则配置
  - [ ] 实现奖励分发状态跟踪
  - [ ] 添加奖励审计和日志记录
  - [ ] 编写奖励服务测试
  
  - **估时**: 8小时
  - **负责人**: 后端开发
  - **依赖**: 区块链服务

---

## 🎨 阶段 3: 用户体验优化 (中优先级)

### 🖥️ UI/UX 改进

#### 3.1 响应式设计和加载状态
- [ ] **优化移动端适配**
  **子任务进度 (0/6):**
  - [ ] 训练会话卡片响应式布局 (320px-768px)
  - [ ] 钱包连接移动端优化
  - [ ] 触摸友好的交互设计
  - [ ] 移动端导航菜单优化
  - [ ] 手势操作支持
  - [ ] 移动端性能优化
  
  - **估时**: 8小时
  - **负责人**: 前端开发

- [ ] **实现加载状态和进度指示**
  ```typescript
  // apps/frontend/src/components/ui/LoadingStates.tsx
  export const TransactionLoading = ({ type, progress })
  export const SessionLoading = ()
  export const RewardsLoading = ()
  ```
  **子任务进度 (0/7):**
  - [ ] 创建通用加载组件基础架构
  - [ ] 实现 `TransactionLoading` 交易加载组件
  - [ ] 实现 `SessionLoading` 会话加载组件
  - [ ] 实现 `RewardsLoading` 奖励加载组件
  - [ ] 添加进度条和百分比显示
  - [ ] 实现骨架屏加载效果
  - [ ] 编写加载组件测试
  
  - **估时**: 6小时
  - **负责人**: 前端开发

- [ ] **创建交易确认流程**
  ```
  apps/frontend/src/components/transactions/
  ├── TransactionConfirmModal.tsx
  ├── TransactionProgress.tsx
  ├── TransactionSuccess.tsx
  └── TransactionError.tsx
  ```
  **子任务进度 (0/12):**
  - [ ] 创建交易组件文件夹结构
  - [ ] 实现 `TransactionConfirmModal` 确认弹窗
  - [ ] 实现 `TransactionProgress` 进度跟踪组件
  - [ ] 实现 `TransactionSuccess` 成功反馈组件
  - [ ] 实现 `TransactionError` 错误处理组件
  - [ ] 添加交易详情预览功能
  - [ ] 实现交易状态实时更新
  - [ ] 添加交易历史记录
  - [ ] 实现交易重试机制
  - [ ] 添加交易取消功能
  - [ ] 集成钱包签名流程
  - [ ] 编写交易流程测试
  
  - **估时**: 10小时
  - **负责人**: 前端开发

#### 3.2 错误处理和用户引导
- [ ] **实现全局错误处理**
  ```typescript
  // apps/frontend/src/components/ErrorBoundary.tsx
  export class ErrorBoundary extends Component {
    // 钱包连接错误
    // 交易失败错误
    // 网络错误
    // 合约调用错误
  }
  ```
  **子任务进度 (0/8):**
  - [ ] 创建 `ErrorBoundary` 基础组件
  - [ ] 实现钱包连接错误处理
  - [ ] 实现交易失败错误处理
  - [ ] 实现网络错误处理
  - [ ] 实现合约调用错误处理
  - [ ] 添加错误恢复建议和操作
  - [ ] 实现错误日志收集和上报
  - [ ] 编写错误处理测试
  
  - **估时**: 6小时
  - **负责人**: 前端开发

- [ ] **创建用户引导系统**
  ```typescript
  // apps/frontend/src/components/onboarding/
  export const WalletOnboarding = () // 钱包连接引导
  export const TrainingOnboarding = () // 训练流程引导
  export const RewardsOnboarding = () // 奖励系统引导
  ```
  **子任务进度 (0/10):**
  - [ ] 创建引导组件基础架构
  - [ ] 实现 `WalletOnboarding` 钱包连接引导
  - [ ] 实现 `TrainingOnboarding` 训练流程引导
  - [ ] 实现 `RewardsOnboarding` 奖励系统引导
  - [ ] 添加分步引导流程控制
  - [ ] 实现引导进度跟踪和保存
  - [ ] 添加引导跳过和重置功能
  - [ ] 集成帮助文档和FAQ
  - [ ] 实现引导动画和过渡效果
  - [ ] 编写引导系统测试
  
  - **估时**: 8小时
  - **负责人**: 前端开发

### 🔄 实时功能

#### 3.3 WebSocket 集成
- [ ] **后端 WebSocket 网关**
  ```typescript
  // apps/backend/src/modules/websocket/websocket.gateway.ts
  @WebSocketGateway()
  export class WebSocketGateway {
    @SubscribeMessage('joinSession')
    handleJoinSession(client: Socket, sessionId: string)
    
    @SubscribeMessage('leaveSession')
    handleLeaveSession(client: Socket, sessionId: string)
    
    // 广播会话状态更新
    // 广播奖励分发事件
    // 广播新参与者加入
  }
  ```
  **子任务进度 (0/12):**
  - [ ] 创建 WebSocket 网关基础结构
  - [ ] 实现客户端连接和认证
  - [ ] 实现 `handleJoinSession` 加入会话处理
  - [ ] 实现 `handleLeaveSession` 离开会话处理
  - [ ] 实现会话房间管理
  - [ ] 添加会话状态更新广播
  - [ ] 添加奖励分发事件广播
  - [ ] 添加新参与者加入广播
  - [ ] 实现连接状态管理和心跳检测
  - [ ] 添加消息队列和缓存机制
  - [ ] 实现错误处理和重连机制
  - [ ] 编写 WebSocket 网关测试
  
  - **估时**: 8小时
  - **负责人**: 后端开发

- [ ] **前端实时状态更新**
  ```typescript
  // apps/frontend/src/hooks/useRealtimeSession.ts
  export const useRealtimeSession = (sessionId: string) => {
    // 连接 WebSocket
    // 监听状态更新
    // 自动刷新数据
  };
  ```
  **子任务进度 (0/8):**
  - [ ] 创建 `useRealtimeSession` Hook 基础结构
  - [ ] 实现 WebSocket 连接管理
  - [ ] 添加会话状态监听和更新
  - [ ] 实现自动数据刷新机制
  - [ ] 添加连接状态指示器
  - [ ] 实现重连和错误处理
  - [ ] 添加消息缓存和离线支持
  - [ ] 编写实时更新测试
  
  - **估时**: 6小时
  - **负责人**: 前端开发

#### 3.4 通知系统
- [ ] **实现通知管理**
  ```
  apps/frontend/src/components/notifications/
  ├── NotificationCenter.tsx
  ├── NotificationItem.tsx
  ├── NotificationSettings.tsx
  └── hooks/
      └── useNotifications.ts
  ```
  **子任务进度 (0/12):**
  - [ ] 创建通知组件文件夹结构
  - [ ] 实现 `NotificationCenter` 通知中心组件
  - [ ] 实现 `NotificationItem` 单个通知组件
  - [ ] 实现 `NotificationSettings` 通知设置组件
  - [ ] 创建 `useNotifications` Hook
  - [ ] 添加交易通知功能
  - [ ] 添加奖励通知功能
  - [ ] 添加会话状态通知功能
  - [ ] 实现通知持久化和历史记录
  - [ ] 添加通知分类和过滤
  - [ ] 实现通知声音和振动
  - [ ] 编写通知系统测试
  
  - **功能**: 交易通知、奖励通知、会话状态通知
  - **估时**: 10小时
  - **负责人**: 前端开发

---

## 🚀 阶段 4: 高级功能 (低优先级)

### 📊 高级功能

#### 4.1 数据分析和仪表板
- [ ] **创建分析仪表板**
  ```
  apps/frontend/src/app/analytics/
  ├── page.tsx
  └── components/
      ├── TrainingMetrics.tsx
      ├── RevenueChart.tsx
      ├── ParticipationStats.tsx
      └── NetworkOverview.tsx
  ```
  **子任务进度 (0/12):**
  - [ ] 创建分析仪表板页面结构
  - [ ] 实现 `TrainingMetrics` 训练指标组件
  - [ ] 实现 `RevenueChart` 收益图表组件
  - [ ] 实现 `ParticipationStats` 参与度统计
  - [ ] 实现 `NetworkOverview` 网络概览面板
  - [ ] 添加数据筛选和时间范围选择
  - [ ] 实现图表交互和钻取功能
  - [ ] 添加数据导出功能
  - [ ] 实现实时数据更新
  - [ ] 添加自定义仪表板配置
  - [ ] 实现数据缓存和优化
  - [ ] 编写分析仪表板测试
  
  - **估时**: 16小时
  - **负责人**: 前端开发

- [ ] **实现数据导出功能**
  ```typescript
  // apps/backend/src/modules/analytics/export.service.ts
  export class ExportService {
    async exportTrainingData(userId: string, format: 'csv' | 'json')
    async exportRewardsData(userId: string, dateRange: DateRange)
    async exportSessionReport(sessionId: string)
  }
  ```
  **子任务进度 (0/10):**
  - [ ] 创建 `ExportService` 基础结构
  - [ ] 实现 `exportTrainingData` 训练数据导出
  - [ ] 实现 `exportRewardsData` 奖励数据导出
  - [ ] 实现 `exportSessionReport` 会话报告导出
  - [ ] 添加多种导出格式支持 (CSV, JSON, Excel)
  - [ ] 实现大数据量分批导出
  - [ ] 添加导出进度跟踪
  - [ ] 实现导出文件压缩和下载
  - [ ] 添加导出权限控制
  - [ ] 编写导出服务测试
  
  - **估时**: 8小时
  - **负责人**: 后端开发

#### 4.2 批量操作和高级查询
- [ ] **实现批量会话管理**
  **子任务进度 (0/12):**
  - [ ] 设计批量操作UI界面
  - [ ] 实现批量创建训练会话功能
  - [ ] 实现批量参与者导入和管理
  - [ ] 实现批量奖励分发操作
  - [ ] 添加批量操作进度跟踪
  - [ ] 实现批量操作结果反馈
  - [ ] 添加批量操作撤销功能
  - [ ] 实现批量操作权限控制
  - [ ] 添加批量操作日志记录
  - [ ] 实现批量操作模板保存
  - [ ] 添加批量操作预览功能
  - [ ] 编写批量操作测试
  
  - **估时**: 12小时
  - **负责人**: 全栈开发

- [ ] **高级搜索和过滤**
  **子任务进度 (0/10):**
  - [ ] 设计高级搜索界面
  - [ ] 实现多条件组合搜索
  - [ ] 实现自定义过滤器创建
  - [ ] 添加搜索条件保存和管理
  - [ ] 实现搜索历史记录
  - [ ] 添加搜索结果排序功能
  - [ ] 实现搜索结果导出
  - [ ] 添加智能搜索建议
  - [ ] 实现搜索性能优化
  - [ ] 编写查询过滤测试
  
  - **估时**: 10小时
  - **负责人**: 前端开发

### 🔧 性能和安全

#### 4.3 性能优化
- [ ] **实现缓存策略**
  ```typescript
  // apps/backend/src/modules/cache/cache.service.ts
  export class CacheService {
    async cacheSessionData(sessionId: string, data: any)
    async cacheUserRewards(userId: string, rewards: any)
    async invalidateCache(pattern: string)
  }
  ```
  **子任务进度 (0/10):**
  - [ ] 创建 `CacheService` 基础结构
  - [ ] 实现 `cacheSessionData` 会话数据缓存
  - [ ] 实现 `cacheUserRewards` 用户奖励缓存
  - [ ] 实现 `invalidateCache` 缓存失效机制
  - [ ] 添加Redis缓存集成
  - [ ] 实现缓存过期策略
  - [ ] 添加缓存命中率监控
  - [ ] 实现分布式缓存同步
  - [ ] 添加缓存预热机制
  - [ ] 编写缓存服务测试
  
  - **估时**: 8小时
  - **负责人**: 后端开发

- [ ] **前端性能优化**
  **子任务进度 (0/12):**
  - [ ] 实现组件懒加载和动态导入
  - [ ] 优化图片加载和压缩
  - [ ] 实现代码分割和路由懒加载
  - [ ] 添加前端缓存策略
  - [ ] 实现虚拟滚动优化长列表
  - [ ] 优化Bundle大小和依赖
  - [ ] 实现Service Worker缓存
  - [ ] 添加性能监控和分析
  - [ ] 优化首屏加载时间
  - [ ] 实现预加载和预取策略
  - [ ] 添加Web Vitals监控
  - [ ] 编写性能测试基准
  
  - **估时**: 12小时
  - **负责人**: 前端开发

#### 4.4 安全和监控
- [ ] **安全审计和加固**
  **子任务进度 (0/15):**
  - [ ] 实施全面输入验证机制
  - [ ] 添加SQL注入防护
  - [ ] 实现XSS攻击防护
  - [ ] 添加CSRF防护机制
  - [ ] 实现API访问频率限制
  - [ ] 添加敏感数据加密
  - [ ] 实现安全头部配置
  - [ ] 添加身份验证加强
  - [ ] 实现权限控制审计
  - [ ] 添加安全日志记录
  - [ ] 实现漏洞扫描集成
  - [ ] 添加安全配置检查
  - [ ] 实现安全事件监控
  - [ ] 添加安全培训文档
  - [ ] 编写安全测试用例
  
  - **估时**: 16小时
  - **负责人**: 全栈开发

- [ ] **监控和日志系统**
  ```typescript
  // apps/backend/src/modules/monitoring/monitoring.service.ts
  export class MonitoringService {
    async logTransaction(transaction: any)
    async trackUserActivity(userId: string, activity: string)
    async monitorSystemHealth()
  }
  ```
  **子任务进度 (0/12):**
  - [ ] 创建 `MonitoringService` 基础结构
  - [ ] 实现 `logTransaction` 交易日志记录
  - [ ] 实现 `trackUserActivity` 用户活动跟踪
  - [ ] 实现 `monitorSystemHealth` 系统健康监控
  - [ ] 添加应用性能监控(APM)
  - [ ] 实现错误日志收集和分析
  - [ ] 添加实时告警机制
  - [ ] 实现日志聚合和搜索
  - [ ] 添加监控仪表板
  - [ ] 实现自动故障恢复
  - [ ] 添加监控数据导出
  - [ ] 编写监控系统测试
  
  - **估时**: 12小时
  - **负责人**: 后端开发

---

## 🧪 测试任务

### 单元测试
- [ ] **智能合约测试** (Move)
  **子任务进度 (0/8):**
  - [ ] 创建合约测试环境和框架
  - [ ] 编写 `create_training_session` 功能测试
  - [ ] 编写 `register_participant` 功能测试
  - [ ] 编写 `submit_contribution` 功能测试
  - [ ] 编写 `complete_training_session` 功能测试
  - [ ] 编写边界条件和异常测试
  - [ ] 编写安全性和权限测试
  - [ ] 添加测试覆盖率报告
  
  - **估时**: 16小时
  - **负责人**: 区块链开发

- [ ] **后端服务测试** (Jest)
  **子任务进度 (0/12):**
  - [ ] 设置测试数据库和环境
  - [ ] 编写 `BlockchainService` 单元测试
  - [ ] 编写 `TrainingService` 单元测试
  - [ ] 编写 `RewardsService` 单元测试
  - [ ] 编写 `SyncService` 单元测试
  - [ ] 编写 API 端点测试
  - [ ] 编写数据库操作测试
  - [ ] 编写业务逻辑测试
  - [ ] 编写错误处理测试
  - [ ] 编写权限验证测试
  - [ ] 添加测试数据工厂
  - [ ] 生成测试覆盖率报告
  
  - **估时**: 20小时
  - **负责人**: 后端开发

- [ ] **前端组件测试** (Jest + Testing Library)
  **子任务进度 (0/10):**
  - [ ] 设置前端测试环境 (Jest, Testing Library)
  - [ ] 编写钱包连接组件测试
  - [ ] 编写训练会话组件测试
  - [ ] 编写奖励相关组件测试
  - [ ] 编写 `useAptosContract` Hook 测试
  - [ ] 编写 `useTransactionStatus` Hook 测试
  - [ ] 编写用户交互测试
  - [ ] 编写表单验证测试
  - [ ] 编写错误处理测试
  - [ ] 生成组件测试覆盖率报告
  
  - **估时**: 24小时
  - **负责人**: 前端开发

### 集成测试
- [ ] **端到端流程测试** (Playwright)
  **子任务进度 (0/15):**
  - [ ] 设置 E2E 测试环境 (Playwright/Cypress)
  - [ ] 编写钱包连接流程测试
  - [ ] 编写创建训练会话流程测试
  - [ ] 编写参与训练会话流程测试
  - [ ] 编写提交贡献流程测试
  - [ ] 编写完成会话和奖励分发流程测试
  - [ ] 编写奖励提取流程测试
  - [ ] 编写多用户协作测试
  - [ ] 编写错误场景测试
  - [ ] 编写性能和负载测试
  - [ ] 编写移动端适配测试
  - [ ] 编写浏览器兼容性测试
  - [ ] 添加测试数据清理
  - [ ] 实现测试报告生成
  - [ ] 集成CI/CD测试流水线
  
  - **估时**: 16小时
  - **负责人**: 全栈开发

- [ ] **API 集成测试**
  **子任务进度 (0/8):**
  - [ ] 设置API集成测试环境
  - [ ] 编写前后端接口集成测试
  - [ ] 编写区块链集成测试
  - [ ] 编写数据流完整性测试
  - [ ] 编写并发访问测试
  - [ ] 编写错误处理和恢复测试
  - [ ] 编写API性能测试
  - [ ] 生成集成测试报告
  
  - **估时**: 12小时
  - **负责人**: 全栈开发

---

## 📦 部署任务

### 环境配置
- [ ] **开发环境优化**
  **子任务进度 (0/8):**
  - [ ] 创建 Docker Compose 配置文件
  - [ ] 配置数据库容器 (PostgreSQL)
  - [ ] 配置Redis缓存容器
  - [ ] 设置环境变量模板
  - [ ] 创建数据库初始化脚本
  - [ ] 配置开发服务启动脚本
  - [ ] 添加开发工具集成
  - [ ] 编写开发环境文档
  
  - **估时**: 8小时
  - **负责人**: DevOps

- [ ] **测试环境配置**
  **子任务进度 (0/10):**
  - [ ] 设置 GitHub Actions CI/CD 流水线
  - [ ] 配置自动化测试执行
  - [ ] 创建测试数据库配置
  - [ ] 设置代码质量检查
  - [ ] 配置测试覆盖率报告
  - [ ] 创建部署脚本
  - [ ] 设置测试环境监控
  - [ ] 配置测试结果通知
  - [ ] 添加回滚机制
  - [ ] 编写测试环境文档
  
  - **估时**: 12小时
  - **负责人**: DevOps

- [ ] **生产环境部署**
  **子任务进度 (0/12):**
  - [ ] 配置云服务器 (AWS/GCP/Azure)
  - [ ] 设置负载均衡器
  - [ ] 配置数据库集群
  - [ ] 设置CDN和静态资源服务
  - [ ] 配置SSL证书和HTTPS
  - [ ] 设置监控和告警系统
  - [ ] 配置日志收集和分析
  - [ ] 设置备份和恢复策略
  - [ ] 配置安全防护 (WAF, DDoS)
  - [ ] 设置性能监控
  - [ ] 创建运维手册
  - [ ] 配置灾难恢复计划
  
  - **估时**: 16小时
  - **负责人**: DevOps

### 智能合约部署
- [ ] **测试网部署**
  **子任务进度 (0/7):**
  - [ ] 配置 Aptos 测试网环境
  - [ ] 编译和优化智能合约
  - [ ] 部署合约到测试网
  - [ ] 验证合约功能完整性
  - [ ] 执行合约安全测试
  - [ ] 配置合约监控
  - [ ] 记录部署文档和地址
  
  - **估时**: 4小时
  - **负责人**: 区块链开发

- [ ] **主网部署准备**
  **子任务进度 (0/10):**
  - [ ] 进行全面安全审计
  - [ ] 准备主网部署资金
  - [ ] 配置主网部署环境
  - [ ] 执行主网合约部署
  - [ ] 验证主网合约功能
  - [ ] 设置合约监控和告警
  - [ ] 配置合约升级机制
  - [ ] 创建合约交互文档
  - [ ] 设置应急响应计划
  - [ ] 发布合约地址和ABI
  
  - **估时**: 8小时
  - **负责人**: 区块链开发

---

## 📈 总体时间估算

| 阶段 | 预估工时 | 优先级 | 依赖关系 |
|------|----------|--------|----------|
| 阶段 1: 区块链集成基础 | 80小时 | 高 | 无 |
| 阶段 2: 核心业务流程 | 120小时 | 高 | 阶段 1 |
| 阶段 3: 用户体验优化 | 100小时 | 中 | 阶段 2 |
| 阶段 4: 高级功能 | 160小时 | 低 | 阶段 3 |
| 测试任务 | 76小时 | 高 | 各阶段并行 |
| 部署任务 | 36小时 | 中 | 阶段 2+ |
| **总计** | **572小时** | - | - |

## 🎯 里程碑计划

### 里程碑 1: MVP 版本 (阶段 1 + 阶段 2)
- **目标**: 基本的训练会话创建和奖励提取功能
- **包含**: 区块链集成基础 (53子任务) + 核心业务流程 (68子任务)
- **时间**: 200小时 (约 5-6 周，2人团队)
- **交付物**: 可用的 Beta 版本

### 里程碑 2: 完整版本 (阶段 3)
- **目标**: 完善的用户体验和实时功能
- **包含**: UI/UX 优化 (75子任务)
- **时间**: +100小时 (约 2-3 周)
- **交付物**: 生产就绪版本

### 里程碑 3: 高级版本 (阶段 4)
- **目标**: 高级功能和性能优化
- **包含**: 高级功能 (94子任务) + 测试 (53子任务) + 部署 (47子任务)
- **时间**: +272小时 (约 6-7 周)
- **交付物**: 企业级版本

---

## 📝 注意事项

1. **并行开发**: 前后端可以并行开发，但需要及时同步 API 接口
2. **测试驱动**: 建议采用 TDD 方式，先写测试再实现功能
3. **渐进交付**: 每个阶段完成后都应该有可演示的功能
4. **代码审查**: 所有代码都应该经过 Code Review
5. **文档更新**: 及时更新 API 文档和用户文档
6. **安全优先**: 涉及资金的功能必须经过安全审计

## 🔄 迭代计划

建议采用 2 周一个迭代的敏捷开发模式：

- **迭代 1-2**: 阶段 1 (区块链集成基础)
- **迭代 3-5**: 阶段 2 (核心业务流程)
- **迭代 6-7**: 阶段 3 (用户体验优化)
- **迭代 8-11**: 阶段 4 (高级功能)

每个迭代结束都进行演示和回顾，根据反馈调整后续计划。