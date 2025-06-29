# CoTrain Aptos Move Smart Contracts

这个目录包含了CoTrain项目的Aptos Move智能合约，用于管理AI训练任务的token奖励分配系统。

## 项目结构

```
move/
├── Move.toml                 # Move项目配置文件
├── sources/                  # 智能合约源代码
│   └── training_rewards.move # 训练奖励分配合约
├── scripts/                  # 部署和管理脚本
│   ├── script.move          # 基础脚本模板
│   └── deploy.move          # 部署和管理脚本
├── tests/                    # 测试文件
│   └── training_rewards_test.move # 合约测试
└── README.md                # 项目文档
```

## 功能特性

### 训练奖励合约 (training_rewards.move)

主要功能包括：

1. **训练会话管理**
   - 创建训练会话
   - 设置奖励池
   - 管理参与者注册
   - 跟踪会话状态

2. **参与者管理**
   - 参与者注册
   - 贡献度评分
   - 奖励计算和分配

3. **奖励分配**
   - 基于贡献度的比例分配
   - 自动化token转账
   - 分配记录和事件日志

4. **查询功能**
   - 查看训练会话详情
   - 查询参与者贡献度
   - 统计总奖励分配

## 合约接口

### 公共入口函数

#### `create_training_session`
创建新的训练会话
```move
public entry fun create_training_session(
    creator: &signer,
    name: String,
    reward_amount: u64,
)
```

#### `register_participant`
注册参与训练会话
```move
public entry fun register_participant(
    participant: &signer,
    session_id: u64,
)
```

#### `submit_contribution`
提交参与者贡献度（仅管理员）
```move
public entry fun submit_contribution(
    admin: &signer,
    session_id: u64,
    participant: address,
    contribution_score: u64,
)
```

#### `complete_training_session`
完成训练会话并分配奖励（仅管理员）
```move
public entry fun complete_training_session(
    admin: &signer,
    session_id: u64,
)
```

### 查询函数

#### `get_training_session`
获取训练会话详情
```move
#[view]
public fun get_training_session(session_id: u64): (
    u64,           // session_id
    String,        // name
    address,       // creator
    u64,           // total_reward_pool
    u64,           // remaining_rewards
    vector<address>, // participants
    u8,            // status
    u64            // created_at
)
```

#### `get_participant_score`
获取参与者贡献度
```move
#[view]
public fun get_participant_score(session_id: u64, participant: address): u64
```

#### `get_total_rewards_distributed`
获取总奖励分配数量
```move
#[view]
public fun get_total_rewards_distributed(): u64
```

## 事件

合约会发出以下事件：

1. **SessionCreatedEvent** - 训练会话创建时
2. **RewardDistributedEvent** - 奖励分配时
3. **SessionCompletedEvent** - 训练会话完成时

## 状态码

- `STATUS_ACTIVE = 1` - 活跃状态
- `STATUS_COMPLETED = 2` - 已完成
- `STATUS_CANCELLED = 3` - 已取消

## 错误码

- `E_NOT_AUTHORIZED = 1` - 未授权操作
- `E_TRAINING_SESSION_NOT_FOUND = 2` - 训练会话不存在
- `E_TRAINING_SESSION_ALREADY_EXISTS = 3` - 训练会话已存在
- `E_INSUFFICIENT_REWARDS = 4` - 奖励不足
- `E_TRAINING_SESSION_NOT_ACTIVE = 5` - 训练会话未激活
- `E_PARTICIPANT_ALREADY_REGISTERED = 6` - 参与者已注册
- `E_PARTICIPANT_NOT_FOUND = 7` - 参与者未找到
- `E_INVALID_CONTRIBUTION_SCORE = 8` - 无效贡献度分数

## 开发和测试

### 环境要求

- Aptos CLI
- Move编译器

### 编译合约

```bash
cd move
aptos move compile
```

### 运行测试

```bash
aptos move test
```

### 部署合约

1. 配置Aptos CLI账户
```bash
aptos init
```

2. 发布合约
```bash
aptos move publish
```

## 使用示例

### 1. 创建训练会话

```bash
aptos move run \
  --function-id 'cotrain::training_rewards::create_training_session' \
  --args 'string:AI Model Training Session #1' 'u64:1000000'
```

### 2. 注册参与者

```bash
aptos move run \
  --function-id 'cotrain::training_rewards::register_participant' \
  --args 'u64:1'
```

### 3. 提交贡献度

```bash
aptos move run \
  --function-id 'cotrain::training_rewards::submit_contribution' \
  --args 'u64:1' 'address:0x123' 'u64:100'
```

### 4. 完成会话

```bash
aptos move run \
  --function-id 'cotrain::training_rewards::complete_training_session' \
  --args 'u64:1'
```

### 5. 查询会话信息

```bash
aptos move view \
  --function-id 'cotrain::training_rewards::get_training_session' \
  --args 'u64:1'
```

## 安全考虑

1. **权限控制**: 只有管理员可以提交贡献度和完成会话
2. **状态验证**: 严格验证会话状态和参与者状态
3. **数值安全**: 防止整数溢出和除零错误
4. **重入保护**: 使用Move的资源模型防止重入攻击

## 集成指南

### 前端集成

前端可以通过Aptos TypeScript SDK与合约交互：

```typescript
import { AptosClient, AptosAccount, FaucetClient } from "aptos";

// 创建训练会话
const payload = {
  type: "entry_function_payload",
  function: "cotrain::training_rewards::create_training_session",
  arguments: ["AI Training Session", "1000000"],
  type_arguments: [],
};

const txnRequest = await client.generateTransaction(account.address(), payload);
const signedTxn = await client.signTransaction(account, txnRequest);
const transactionRes = await client.submitTransaction(signedTxn);
```

### 后端集成

后端服务可以监听合约事件并更新数据库：

```typescript
// 监听会话创建事件
const events = await client.getEventsByEventHandle(
  contractAddress,
  "cotrain::training_rewards::TrainingRewardsState",
  "session_created_events"
);
```

## 许可证

本项目采用MIT许可证。