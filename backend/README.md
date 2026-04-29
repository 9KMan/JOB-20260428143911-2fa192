# Multica Backend

A production-ready Node.js + Express.js + Prisma backend with multi-tenant support.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Authentication**: JWT + Refresh Tokens

## Features

- Multi-tenant architecture
- Role-based access control (SUPER_ADMIN, TENANT_ADMIN, USER)
- JWT authentication with refresh tokens
- RESTful API design
- Input validation with express-validator
- Security middleware (Helmet, CORS)
- Audit logging
- Analytics endpoints

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Docker (optional)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret.

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Or push schema (development)
npx prisma db push
```

### 4. Run

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Docker

```bash
# Build
docker build -t multica-backend .

# Run
docker run -p 3000:3000 --env-file .env multica-backend
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new tenant + user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh tokens |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/auth/forgot-password | Forgot password |
| POST | /api/v1/auth/reset-password | Reset password |

### Tenants (SUPER_ADMIN only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/tenants | Create tenant |
| GET | /api/v1/tenants | List tenants |
| GET | /api/v1/tenants/:id | Get tenant |
| PATCH | /api/v1/tenants/:id | Update tenant |
| DELETE | /api/v1/tenants/:id | Delete tenant |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/users | Create user |
| GET | /api/v1/users | List users |
| GET | /api/v1/users/profile | Get current user |
| GET | /api/v1/users/:id | Get user |
| PATCH | /api/v1/users/:id | Update user |
| DELETE | /api/v1/users/:id | Delete user |
| POST | /api/v1/users/:id/change-password | Change password |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/analytics/dashboard | Dashboard stats |
| GET | /api/v1/analytics/usage | Usage statistics |
| GET | /api/v1/analytics/activity | Activity logs |

## Testing

```bash
npm test
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── index.ts
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── tenantController.ts
│   │   ├── userController.ts
│   │   └── analyticsController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── tenant.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── tenantRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── analyticsRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── tenantService.ts
│   │   ├── userService.ts
│   │   └── analyticsService.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── response.ts
│   └── index.ts
├── tests/
│   ├── auth.test.ts
│   └── tenant.test.ts
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```
