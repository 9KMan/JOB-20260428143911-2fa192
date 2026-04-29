# Application Name

A full-stack web application with a Node.js/Express API backend and React frontend, containerized with Docker.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v6, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Containerization** | Docker, Docker Compose |
| **Runtime** | Node.js LTS |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Docker Network                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Frontend  │  │     API     │  │    PostgreSQL   │  │
│  │   (React)   │──│  (Express)  │──│      (DB)       │  │
│  │   :80       │  │   :3000     │  │     :5432       │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────┘  │
│                         │                               │
│                    ┌────┴────┐                          │
│                    │  Redis  │                          │
│                    │  :6379  │                          │
│                    └─────────┘                          │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Git

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:80
- **API**: http://localhost:3000

## Manual Setup

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run in development
npm run dev

# Run in production
npm start
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run in development
npm start

# Build for production
npm run build
```

### Database Setup

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres -d appdb

# Run migrations
npm run migrate
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://postgres:postgrespassword@localhost:5432/appdb` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3000` |

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/status` | Application status |

### Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Deployment

### Production Checklist

1. Update environment variables with production values
2. Enable HTTPS/SSL termination at reverse proxy
3. Configure PostgreSQL for production workload
4. Enable Redis persistence
5. Set up log aggregation
6. Configure backup strategy for PostgreSQL volumes

### Docker Commands

```bash
# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose restart api

# Scale API service
docker-compose up -d --scale api=3

# View resource usage
docker stats

# Clean up unused resources
docker system prune -f
```

### Database Backup

```bash
# Backup PostgreSQL
docker exec app-postgres pg_dump -U postgres appdb > backup.sql

# Restore PostgreSQL
docker exec -i app-postgres psql -U postgres appdb < backup.sql
```

## Development

### Running in Development Mode

```bash
# With hot reload for frontend
docker-compose -f docker-compose.dev.yml up

# Backend with nodemon
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Troubleshooting

### Container fails to start

```bash
# Check container logs
docker-compose logs postgres
docker-compose logs redis

# Verify ports are available
netstat -an | grep 5432
netstat -an | grep 6379
```

### Database connection issues

```bash
# Restart database container
docker-compose restart postgres

# Verify database is ready
docker exec app-postgres psql -U postgres -d appdb -c "SELECT 1"
```

### Clear all data and start fresh

```bash
docker-compose down -v
docker-compose up -d
```

## License

MIT