# Co-Train Aptos Backend

Backend API for Co-Train Aptos - A decentralized AI training platform built on the Aptos blockchain.

## Features

- **User Management**: User registration, authentication, and profile management
- **Training Sessions**: Create and manage AI training sessions
- **Contributors**: Manage contributor profiles and capabilities
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis for performance optimization
- **Documentation**: Swagger/OpenAPI documentation
- **Real-time**: WebSocket support for live updates
- **File Upload**: Support for training data and model files
- **Blockchain Integration**: Aptos blockchain integration for rewards and governance

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **File Upload**: Multer
- **WebSocket**: Socket.io
- **Queue**: Bull (Redis-based)
- **Blockchain**: Aptos SDK

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd co-train_aptos/apps/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   - Database credentials
   - Redis configuration
   - JWT secrets
   - Aptos blockchain settings

4. **Database setup**
   ```bash
   # Create database
   createdb cotrain_aptos
   
   # Run migrations (if any)
   npm run migration:run
   ```

5. **Start Redis**
   ```bash
   redis-server
   ```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **API Base URL**: http://localhost:3001/api/v1

## Project Structure

```
src/
├── common/                 # Shared utilities and DTOs
│   ├── dto/               # Common DTOs (pagination, etc.)
│   ├── guards/            # Custom guards
│   ├── interceptors/      # Custom interceptors
│   └── utils/             # Utility functions
├── config/                # Configuration files
│   ├── database.config.ts # Database configuration
│   └── redis.config.ts    # Redis configuration
├── modules/               # Feature modules
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── training/          # Training sessions
│   ├── contributors/      # Contributor profiles
│   ├── blockchain/        # Blockchain integration
│   ├── compute/           # Distributed computing
│   ├── analytics/         # Analytics and reporting
│   ├── notifications/     # Notification system
│   ├── files/             # File management
│   └── websocket/         # Real-time communication
├── app.module.ts          # Root application module
└── main.ts                # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/wallet-login` - Wallet-based login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/profile` - Get current user profile
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/statistics` - Get user statistics
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/me` - Update current user
- `PATCH /api/v1/users/:id` - Update user by ID (admin)
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/verify-email` - Verify email

### Training Sessions
- `GET /api/v1/training` - Get all training sessions
- `POST /api/v1/training` - Create training session
- `GET /api/v1/training/my-sessions` - Get user's training sessions
- `GET /api/v1/training/statistics` - Get training statistics
- `GET /api/v1/training/:id` - Get training session by ID
- `PATCH /api/v1/training/:id` - Update training session
- `DELETE /api/v1/training/:id` - Delete training session
- `POST /api/v1/training/:id/start` - Start training session
- `POST /api/v1/training/:id/pause` - Pause training session
- `POST /api/v1/training/:id/complete` - Complete training session
- `PATCH /api/v1/training/:id/progress` - Update training progress

### Contributors
- `GET /api/v1/contributors` - Get all contributors
- `POST /api/v1/contributors` - Create contributor profile
- `GET /api/v1/contributors/top` - Get top contributors
- `GET /api/v1/contributors/available` - Get available contributors
- `GET /api/v1/contributors/statistics` - Get contributor statistics
- `GET /api/v1/contributors/my-profile` - Get current user's contributor profile
- `GET /api/v1/contributors/:id` - Get contributor by ID
- `PATCH /api/v1/contributors/:id` - Update contributor profile
- `DELETE /api/v1/contributors/:id` - Delete contributor profile
- `PATCH /api/v1/contributors/:id/status` - Update contributor status (admin)
- `PATCH /api/v1/contributors/:id/reputation` - Update reputation score (admin)
- `POST /api/v1/contributors/:id/earnings` - Add earnings (admin)
- `POST /api/v1/contributors/:id/contribution` - Increment contributions (admin)
- `POST /api/v1/contributors/:id/activity` - Update last active timestamp

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Drop schema
npm run schema:drop
```

## Environment Variables

See `.env.example` for all available environment variables:

- **Application**: PORT, NODE_ENV, FRONTEND_URL
- **Database**: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- **Redis**: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- **JWT**: JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
- **Rate Limiting**: THROTTLE_TTL, THROTTLE_LIMIT
- **Email**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- **File Upload**: UPLOAD_DEST, MAX_FILE_SIZE
- **Aptos**: APTOS_NODE_URL, APTOS_FAUCET_URL, APTOS_PRIVATE_KEY, APTOS_CONTRACT_ADDRESS
- **AWS**: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
- **Monitoring**: SENTRY_DSN
- **WebSocket**: WS_PORT

## Security Features

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Request throttling
- **Validation**: Input validation and sanitization
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Password Hashing**: bcrypt for password security

## Performance Optimizations

- **Caching**: Redis caching for frequently accessed data
- **Database Indexing**: Optimized database queries
- **Pagination**: Efficient data pagination
- **Connection Pooling**: Database connection optimization
- **Compression**: Response compression

## Deployment

### Docker
```bash
# Build image
docker build -t cotrain-aptos-backend .

# Run container
docker run -p 3001:3001 cotrain-aptos-backend
```

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Configure Redis for production
- [ ] Set up SSL/TLS
- [ ] Configure monitoring (Sentry)
- [ ] Set up log aggregation
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.