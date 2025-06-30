# ProcessVenue Assessment API

A RESTful API for managing books and reviews with caching support using Express.js, Prisma, PostgreSQL, and Redis.

> 🚀 **Want to get started quickly?** Check out [QUICK_START.md](QUICK_START.md) for a 2-minute setup!

## Features

- **Books Management**: Create and retrieve books
- **Reviews Management**: Add and retrieve reviews for books
- **Caching**: Redis-based caching for improved performance
- **Database**: PostgreSQL with Prisma ORM
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit and integration tests

## Prerequisites

**Choose one setup method:**

### Option A: Docker Setup (Recommended for beginners)

- Docker and Docker Compose

### Option B: Cloud Database Setup (No Docker required)

- Node.js 18+
- Internet connection for cloud databases

### Option C: Hybrid Setup (Most flexible)

- Node.js 18+ and Docker

## Quick Start with Docker

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd processvenue-assessment
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

The default values in `env.example` work perfectly with Docker Compose setup.

### 3. Run with Docker Compose

**Option A: Full Application Stack**

```bash
# Build and start all services (PostgreSQL, Redis, and the API)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**Option B: Development Mode (External Dependencies Only)**

```bash
# Start only PostgreSQL and Redis for local development
docker-compose -f docker-compose.dev.yml up -d

# Then run the application locally
npm install
npm run db:migrate
npm run dev
```

### 4. Initialize Database

After the services are running, initialize the database:

```bash
# If using full Docker setup
docker-compose exec app npm run db:migrate

# If running locally
npm run db:migrate
```

### 5. Access the Application

- **API Base URL**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/

## Quick Start with Cloud Databases (No Docker)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd processvenue-assessment
```

### 2. Run Cloud Setup

```bash
# Option A: Use the automated cloud setup script
./setup-cloud.sh

# Option B: Manual cloud setup
cp env.example .env
# Edit .env file with your cloud database URLs
npm install
npm run db:migrate
npm start
```

### 3. Cloud Database Options

**Free Cloud Databases:**

- **Supabase** (PostgreSQL): https://supabase.com - 500MB free
- **Redis Cloud**: https://redis.com/try-free - 30MB free
- **Railway**: https://railway.app - PostgreSQL hosting
- **PlanetScale**: https://planetscale.com - MySQL (requires schema modification)

**Shared Demo Databases:**

- Use our pre-configured demo databases (included in setup script)
- No registration required - perfect for testing

### 4. Access the Application

Same as Docker setup - your API will be available at http://localhost:3000

## Setup Method Comparison

| Feature               | Docker Setup      | Cloud Databases   | Hybrid Setup     |
| --------------------- | ----------------- | ----------------- | ---------------- |
| **Prerequisites**     | Docker only       | Node.js only      | Docker + Node.js |
| **Setup Time**        | ~2 minutes        | ~1 minute         | ~2 minutes       |
| **Internet Required** | No (after images) | Yes (always)      | Partial          |
| **Data Persistence**  | Local volumes     | Cloud storage     | Flexible         |
| **Performance**       | Fastest           | Network dependent | Mixed            |
| **Best For**          | Local development | Quick testing     | Production       |
| **Scalability**       | Single machine    | Cloud scalable    | Hybrid approach  |

### Recommendations:

- **🐳 Docker Setup**: Best for development, offline work, full control
- **☁️ Cloud Databases**: Best for quick testing, demos, sharing
- **🔧 Hybrid Setup**: Best for production, team development

## API Endpoints

### Books

- `GET /api/books` - Get all books
- `POST /api/books` - Create a new book

### Reviews

- `GET /api/reviews/:bookId` - Get reviews for a specific book
- `POST /api/reviews` - Create a new review

## Database Schema

### Books Table

- `id` (UUID, Primary Key)
- `title` (String)
- `author` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Reviews Table

- `id` (UUID, Primary Key)
- `bookId` (String, Foreign Key)
- `name` (String, Reviewer Name)
- `rating` (Integer, 1-5)
- `comment` (String, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Environment Variables

| Variable       | Description                    | Local Docker Default                                         | Cloud Example                                                  |
| -------------- | ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string   | `postgresql://admin:password123@localhost:5432/processvenue` | `postgresql://postgres:pass@project.supabase.co:5432/postgres` |
| `REDIS_URL`    | Redis connection string        | `redis://localhost:6379`                                     | `redis://default:pass@host.redis.com:12345`                    |
| `PORT`         | Server port                    | `3000`                                                       | `3000`                                                         |
| `API_BASE_URL` | Base URL for API documentation | `http://localhost:3000`                                      | `http://localhost:3000`                                        |

### Setup Examples:

**Local Docker:**

```bash
DATABASE_URL=postgresql://admin:password123@localhost:5432/processvenue
REDIS_URL=redis://localhost:6379
```

**Cloud Databases:**

```bash
DATABASE_URL=postgresql://postgres:your_password@abc123.supabase.co:5432/postgres
REDIS_URL=redis://default:your_password@your-redis.redis.com:12345
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Database Operations

```bash
# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Reset database (careful in production!)
npx prisma migrate reset
```

### Docker Commands

```bash
# Build and start services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs app

# Restart a service
docker-compose restart app

# Execute commands in containers
docker-compose exec app npm test
docker-compose exec postgres psql -U admin -d processvenue
```

## Caching Strategy

The application implements intelligent caching:

- **Books**: Cached for 5 minutes (300 seconds)
- **Cache Invalidation**: Automatically clears when new books are created
- **Fallback**: Gracefully falls back to database when Redis is unavailable
- **Cache Miss Handling**: Seamlessly serves from database and populates cache

## Data Persistence

- **PostgreSQL Data**: Stored in Docker volume `postgres_data`
- **Redis Data**: Stored in Docker volume `redis_data`
- **Data Survival**: Data persists between container restarts

## Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Use proper PostgreSQL and Redis credentials
3. Consider using managed database services
4. Set up proper logging and monitoring
5. Use container orchestration (Kubernetes, Docker Swarm)

## Troubleshooting

### Common Issues

**Docker Compose fails to start:**

```bash
# Check if ports are already in use
docker-compose down
docker system prune -f
docker-compose up --build
```

**Database connection issues:**

```bash
# Check if PostgreSQL is ready
docker-compose logs postgres

# Manually test connection
docker-compose exec postgres psql -U admin -d processvenue
```

**Redis connection issues:**

```bash
# Check Redis status
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Viewing Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f app
```

## Project Structure

```
processvenue-assessment/
├── src/
│   ├── routes/           # API route handlers
│   ├── lib/              # Shared utilities (Prisma, Redis, Swagger)
│   ├── __tests__/        # Test files
│   └── index.ts          # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── docs/
│   └── swagger.yaml      # API documentation
├── docker-compose.yml    # Full application stack
├── docker-compose.dev.yml # Development dependencies only
├── Dockerfile            # Application container
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

ISC
