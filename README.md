# CoTrain - Decentralized AI Training Platform

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Aptos](https://img.shields.io/badge/Aptos-Blockchain-orange.svg)](https://aptos.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)

CoTrain is a revolutionary Web3 AI training platform that enables decentralized collaborative machine learning with blockchain-based token reward distribution. Built on the Aptos blockchain, CoTrain incentivizes users to participate in AI model training and receive proportional token rewards based on their contributions.

## 🌟 Key Features

### 🤖 AI Training Platform
- **Collaborative Training**: Enable multiple participants to contribute to AI model training
- **Training Session Management**: Create, manage, and monitor AI training sessions
- **Contributor Profiles**: Manage participant capabilities and contribution history
- **Real-time Updates**: WebSocket-based live updates for training progress

### 🔗 Blockchain Integration
- **Aptos Move Smart Contracts**: Decentralized reward distribution system
- **Token Rewards**: Automatic token distribution based on contribution scores
- **Wallet Integration**: Seamless Aptos wallet connectivity
- **Transparent Governance**: Blockchain-based session and reward management

### 🏗️ Modern Architecture
- **Monorepo Structure**: Organized codebase with frontend, backend, and smart contracts
- **Type Safety**: Full TypeScript implementation across all components
- **Scalable Backend**: NestJS with PostgreSQL and Redis
- **Modern Frontend**: Next.js with shadcn/ui components

## 🏛️ Architecture

```
co-train_aptos/
├── apps/
│   ├── frontend/          # Next.js React application
│   └── backend/           # NestJS API server
├── move/                  # Aptos Move smart contracts
│   ├── sources/           # Contract source code
│   ├── scripts/           # Deployment scripts
│   └── tests/             # Contract tests
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **PostgreSQL** 13+ and **Redis** 6+
- **Docker** and **Docker Compose**
- **Aptos CLI** (for smart contract deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/co-train_aptos.git
   cd co-train_aptos
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start database services**
   ```bash
   cd apps/backend
   docker-compose up -d
   ```

4. **Configure environment variables**
   ```bash
   # Copy and configure backend environment
   cp apps/backend/.env.example apps/backend/.env
   
   # Copy and configure frontend environment
   cp .env.example .env.local
   ```

5. **Start development servers**
   ```bash
   # Start backend (runs on http://localhost:3001)
   cd apps/backend
   pnpm start:dev
   
   # Start frontend (runs on http://localhost:3000)
   cd apps/frontend
   pnpm dev
   ```

### Smart Contract Deployment

1. **Install Aptos CLI**
   ```bash
   # macOS
   brew install aptos
   
   # Or install from source
   cargo install --git https://github.com/aptos-labs/aptos-core.git aptos
   ```

2. **Deploy contracts**
   ```bash
   cd move
   
   # Compile and test
   ./deploy.sh compile
   ./deploy.sh test
   
   # Deploy to devnet
   ./deploy.sh deploy --profile devnet
   
   # Or full deployment
   ./deploy.sh full --profile devnet
   ```

## 📱 Applications

### Frontend Application

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Aptos Wallet Adapter

**Features**:
- Modern responsive UI with dark/light mode
- Aptos wallet integration with multiple wallet support
- Real-time training session monitoring
- Contributor dashboard and profile management
- Token reward tracking and history

**Development**:
```bash
cd apps/frontend
pnpm dev
```

### Backend API

**Tech Stack**: NestJS, TypeScript, PostgreSQL, Redis, TypeORM, JWT Authentication

**Features**:
- RESTful API with Swagger documentation
- User authentication and authorization
- Training session management
- Real-time WebSocket communication
- File upload for training data
- Blockchain integration with Aptos SDK

**Development**:
```bash
cd apps/backend
pnpm start:dev
```

**API Documentation**: Available at `http://localhost:3001/api/docs`

## 🔗 Smart Contracts

### Training Rewards Contract

The core smart contract (`training_rewards.move`) manages:

- **Training Session Lifecycle**: Creation, participant registration, completion
- **Contribution Tracking**: Score-based contribution measurement
- **Reward Distribution**: Proportional token distribution based on contributions
- **Event Logging**: Transparent on-chain activity tracking

### Key Functions

```move
// Create a new training session
public entry fun create_training_session(
    creator: &signer,
    session_id: u64,
    reward_amount: u64
)

// Register as a participant
public entry fun register_participant(
    participant: &signer,
    session_id: u64
)

// Submit contribution score
public entry fun submit_contribution(
    participant: &signer,
    session_id: u64,
    score: u64
)

// Complete session and distribute rewards
public entry fun complete_session_and_distribute(
    creator: &signer,
    session_id: u64
)
```

## 🛠️ Development

### Project Structure

- **`apps/frontend/`**: Next.js frontend application
- **`apps/backend/`**: NestJS backend API
- **`move/`**: Aptos Move smart contracts
- **`scripts/`**: Deployment and utility scripts

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm build            # Build all applications
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format all code

# Backend specific
cd apps/backend
pnpm start:dev        # Start backend in development mode
pnpm test:e2e         # Run end-to-end tests
pnpm migration:run    # Run database migrations

# Frontend specific
cd apps/frontend
pnpm dev              # Start frontend development server
pnpm build            # Build for production

# Smart contracts
cd move
./deploy.sh compile   # Compile contracts
./deploy.sh test      # Run contract tests
./deploy.sh deploy    # Deploy to network
```

### Environment Variables

#### Backend (`.env`)
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cotrain
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Aptos
APTOS_NETWORK=devnet
APTOS_PRIVATE_KEY=your-private-key
APTOS_CONTRACT_ADDRESS=your-contract-address
```

#### Frontend (`.env.local`)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Aptos
NEXT_PUBLIC_APTOS_NETWORK=devnet
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
```

## 🚀 Deployment

### Production Deployment

1. **Frontend**: Deploy to Vercel (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. **Backend**: Deploy to your preferred cloud provider
3. **Database**: Use managed PostgreSQL and Redis services
4. **Smart Contracts**: Deploy to Aptos mainnet

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📚 Documentation

- **[Integration Guide](./INTEGRATION.md)**: Detailed integration instructions
- **[Deployment Guide](./DEPLOYMENT.md)**: Production deployment guide
- **[API Documentation](http://localhost:3001/api/docs)**: Swagger API docs
- **[Smart Contract Docs](./move/README.md)**: Move contract documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Aptos Labs](https://aptos.dev/) for the blockchain infrastructure
- [NestJS](https://nestjs.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [shadcn/ui](https://ui.shadcn.com/) for the UI components

## 📞 Support

For support and questions:
- Create an [issue](https://github.com/your-org/co-train_aptos/issues)
- Join our [Discord community](https://discord.gg/cotrain)
- Follow us on [Twitter](https://twitter.com/cotrain_ai)

---

**CoTrain** - Democratizing AI through decentralized collaboration 🚀
