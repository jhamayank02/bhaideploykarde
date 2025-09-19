# BhaiDeployKarDe - Automated Deployment Bot

A sophisticated microservices-based deployment automation system using Telegram as an interface. The system allows users to trigger and monitor deployments through a Telegram bot interface while handling complex deployment workflows behind the scenes.

## 🚀 Features

- **Telegram Bot Interface**: User-friendly deployment commands through Telegram
- **Automated Deployments**: Automated build and deployment pipeline
- **Real-time Logging**: Comprehensive logging system with ClickHouse integration and real-time web UI
- **Live Log Dashboard**: Interactive web interface for real-time log monitoring and analysis
- **Deployment Status Tracking**: Real-time status updates of deployments
- **Reverse Proxy**: Secure handling of external requests
- **Event-Driven Architecture**: Using Kafka for reliable event handling

## 🛠️ Technology Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Container Orchestration**: Docker & Docker Compose
- **Message Broker**: Apache Kafka
- **Service Discovery**: Consul
- **Databases**: 
  - PostgreSQL (Main data store)
  - ClickHouse (Logging and analytics)

### Framework & Libraries
- **API Framework**: Express.js
- **Bot Framework**: Telegraf
- **ORM**: Prisma
- **Event Streaming**: KafkaJS
- **Logging**: Winston
- **AWS SDK**: For S3 and ECS integration
- **Resilience**: Opossum (Circuit Breaker implementation)
- **Monitoring**: Prometheus & Grafana

## 🏗️ Architecture

The project follows a microservices architecture with the following key components:

### Services
1. **Bot Server** (`/bot-server`)
   - Handles Telegram bot interactions
   - Manages user commands and responses
   - Integrates with Postgres for data persistence
   - Communicates with other services via Kafka

2. **Build Server** (`/build-server`)
   - Manages code building process
   - Handles GitHub repository cloning
   - Performs npm installations and builds
   - Uploads artifacts to S3

3. **Log Server** (`/log-server`)
   - Centralized logging service
   - Integrates with ClickHouse for log storage
   - Provides log aggregation and querying
   - Handles real-time log streaming
   - Interactive Web UI for log monitoring
     * Real-time log updates via WebSocket
     * Log filtering and search
     * Deployment status visualization
     * Error highlighting and notifications
     * Custom dashboard views

4. **Reverse Proxy** (`/reverse-proxy`)
   - Manages external request routing
   - Handles SSL termination
   - Provides security layer for services

### Directory Structure
BhaiDeployKarDe/
├── bot-server/ # Telegram Bot Service
│ ├── src/
│ │ ├── bots/ # Bot command handlers
│ │ │ ├── commands/ # Bot command implementations
│ │ │ └── bot.ts # Bot initialization
│ │ ├── config/ # Configuration files
│ │ ├── controllers/ # Business logic
│ │ ├── utils/ # Helper functions
│ │ ├── kafka/ # Kafka producers/consumers
│ │ └── index.ts # Express app setup
│ ├── prisma/ # Database schema and migrations
│ │ ├── schema.prisma # Prisma schema
│ │ └── migrations/ # Database migrations
│ ├── .env # Environment variables
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
│
├── build-server/ # Build & Deploy Service
│ ├── src/
│ │ ├── config/ # Build configurations
│ │ ├── kafka/ # Kafka event handlers
│ │ ├── utils/ # Build utilities
│ │ └── index.ts # Express app setup
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
│
├── log-server/ # Logging Service & UI
│ ├── src/
│ │ ├── config/ # Logging configurations
│ │ ├── controllers/ # Log handling logic
│ │ ├── utils/ # Logging utilities
│ │ ├── migrations/ # ClickHouse migrations
│ │ ├── schema/ # ClickHouse schema
│ │ └── index.ts # Express app setup
│ ├── .env # Environment variables
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
│
├── reverse-proxy/ # Reverse Proxy Service
│ ├── src/
│ │ ├── config/ # Proxy configurations
│ │ └── index.ts # Express app setup
│ ├── .env # Environment variables
│ ├── Dockerfile
│ ├── package.json
│ └── tsconfig.json
│
├── envs/ # Environment Files
│ ├── clickhouse.env # ClickHouse config
│ └── postgres.env # PostgreSQL config
│
├── consul/ # Consul Service Discovery
│ ├── bot-server.json # Bot server configurations
│ └── log-server.json # Log server configurations
│
└── docker-compose.yaml # Service orchestration

## 🔧 Design Patterns

1. **Event-Driven Architecture**
   - Using Kafka for asynchronous communication
   - Decoupled services through event publishing/subscribing

2. **Repository Pattern**
   - Prisma-based data access layers
   - Abstracted database operations

3. **Factory Pattern**
   - Bot command handlers
   - Logger configurations

4. **Strategy Pattern**
   - Different deployment strategies
   - Various logging mechanisms

5. **Observer Pattern**
   - Event handling in bot interactions
   - Log streaming and monitoring

6. **Circuit Breaker Pattern**
   - Prevents cascading failures across services
   - Handles external service dependencies gracefully
   - Auto-recovery and fallback mechanisms
   - Configurable thresholds and timeouts

## 🛡️ Resilience

### Circuit Breaker Implementation
- **Service Health Monitoring**:
  * Real-time health checks
  * Failure threshold monitoring
  * Automatic service isolation
  * Graceful degradation strategies

- **Recovery Mechanisms**:
  * Automatic retry with exponential backoff
  * Fallback responses when services are down
  * Cache-based temporary responses
  * Gradual service restoration

- **Configuration**:
  ```typescript
  {
    failureThreshold: 5,        // Number of failures before opening circuit
    resetTimeout: 60000,        // Time before attempting to reset (ms)
    halfOpenRetries: 3,         // Attempts in half-open state
    timeout: 5000,              // Request timeout (ms)
    monitorInterval: 10000      // Health check interval (ms)
  }
  ```

### Implementation Areas
1. **External API Calls**:
   - Telegram API communications
   - AWS S3 operations
   - GitHub repository access

2. **Inter-service Communications**:
   - Database connections
   - Kafka message publishing
   - Service-to-service API calls

3. **Architectural Patterns**:
   - **Service Discovery**: 
     * Consul for dynamic service registration
     * Health check monitoring
     * Service mesh capabilities
   
   - **Circuit Breaking**:
     * Opossum for failure detection
     * Fallback mechanisms
     * Self-healing capabilities

   - **CDN Integration**:
     * CloudFront for static assets
     * Edge caching
     * Global content distribution

   - **Reverse Proxy**:
     * SSL termination
     * Load balancing
     * Request routing

   - **Database Patterns**:
     * PostgreSQL (Row-based) for transactional data
     * ClickHouse (Columnar) for analytics
     * Hybrid data access strategies

## 📦 Infrastructure

### Networking
- Internal Docker network for service communication
- Reverse proxy for external access
- DNS configuration for service discovery

### Storage
- PostgreSQL for transactional data
- ClickHouse for log storage
- S3 for artifact storage

### Message Queue
- Kafka topics for:
  - Deployment events
  - Logging events
  - Status updates

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js v18+
- AWS Account (for S3 and ECS)
- Telegram Bot Token

### Environment Setup
1. Clone the repository
2. Copy example env files and configure:
   ```bash
   cp envs/example.env envs/postgres.env
   cp envs/example.env envs/clickhouse.env
   ```
3. Set up required environment variables in each service's .env file

### Running the Project
```bash
# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f
```

### Development Setup
1. Install dependencies in each service:
   ```bash
   cd bot-server && npm install
   cd ../build-server && npm install
   cd ../log-server && npm install
   cd ../reverse-proxy && npm install
   ```

2. Run database migrations:
   ```bash
   cd bot-server && npx prisma migrate dev
   cd ../log-server && npx prisma migrate dev
   ```

## 📈 Monitoring & Logging

### Real-time Log Dashboard
The Log Server includes an interactive web UI accessible at `http://localhost:9001/logs` with the following features:

#### Dashboard Features
- **Real-time Log Streaming**: Live log updates using WebSocket connections
- **Advanced Filtering**: Filter logs by:
  * Service name
  * Log level
  * Time range
  * Custom search queries
- **Visualization**:
  * Deployment status timelines
  * Error rate graphs
  * Service health indicators
  * Resource usage metrics
- **Interactive Features**:
  * Click-to-expand log details
  * Copy log entries
  * Export logs to CSV
  * Custom alert settings

#### Technical Implementation
- WebSocket for real-time updates
- Server-Sent Events (SSE) fallback
- ClickHouse for efficient log querying
- Redis for real-time metrics
- Responsive UI using modern web technologies

### Logging Levels
- ERROR: Critical failures requiring immediate attention
- WARN: Important events that aren't failures
- INFO: General operational events
- DEBUG: Detailed information for debugging

### Monitoring Points
- Service health checks
- Deployment status
- Build process steps
- API response times
- Kafka queue metrics

## 🔐 Security

### Implementation
- Secure environment variable handling
- Network isolation using Docker networks
- Proxy-based access control
- AWS IAM roles and policies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
