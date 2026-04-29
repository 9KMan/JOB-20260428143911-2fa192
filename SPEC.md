# Specification: B2B SaaS Platform - Multi-Tenant Enterprise Management System

## 1. Project Overview

**Project Name:** EnterpriseHub - Multi-Tenant B2B SaaS Platform
**Project Type:** Full-stack web application
**Core Functionality:** A multi-tenant SaaS platform for managing enterprise clients, subscriptions, and analytics with role-based access control.
**Target Users:** B2B companies requiring scalable SaaS infrastructure with large systems architecture.

---

## 2. Technical Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js + Express.js |
| **Database** | PostgreSQL with Prisma ORM |
| **Frontend** | React 18 + TypeScript + Vite |
| **Auth** | JWT with refresh tokens |
| **Containerization** | Docker + Docker Compose |
| **State Management** | React Context + React Query |
| **Styling** | Tailwind CSS |

---

## 3. Architecture

### 3.1 Multi-Tenant Architecture
- Tenant isolation via `tenant_id` in all data tables
- Middleware for tenant context injection
- Tenant-specific configuration support

### 3.2 System Design
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Load      │────▶│   API       │
│   (React)   │◀────│   Balancer  │◀────│   Gateway   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
            │  Auth Svc   │           │  Core API   │           │  Analytics  │
            │  (JWT)      │           │  (REST)     │           │  Service    │
            └─────────────┘           └─────────────┘           └─────────────┘
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
            │  PostgreSQL │           │  PostgreSQL │           │  Redis      │
            │  (Auth DB)  │           │  (App DB)   │           │  (Cache)    │
            └─────────────┘           └─────────────┘           └─────────────┘
```

### 3.3 Backend Structure
```
backend/
├── src/
│   ├── config/           # Environment, database config
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, tenant, validation
│   ├── models/           # Prisma schema
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   └── utils/            # Helpers
├── tests/
└── Dockerfile
```

### 3.4 Frontend Structure
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client
│   ├── context/          # React context providers
│   └── types/            # TypeScript types
├── Dockerfile
└── docker-compose.yml
```

---

## 4. Key Components

### 4.1 Authentication & Authorization
- **JWT Access Tokens:** 15-minute expiry, stored in memory
- **Refresh Tokens:** 7-day expiry, stored in httpOnly cookie
- **Role-Based Access Control (RBAC):**
  - `SUPER_ADMIN`: Full system access
  - `TENANT_ADMIN`: Tenant-level admin access
  - `USER`: Standard user access

### 4.2 Tenant Management
- Tenant registration and onboarding
- Tenant settings and configuration
- Usage tracking per tenant

### 4.3 User Management
- User registration/login
- Profile management
- Password reset via email
- Session management

### 4.4 Dashboard & Analytics
- Real-time metrics display
- Usage statistics
- Activity logs

---

## 5. Database Models

### 5.1 Tenant
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Tenant company name |
| slug | String | Unique identifier slug |
| status | Enum | ACTIVE, SUSPENDED, PENDING |
| plan | Enum | STARTER, PROFESSIONAL, ENTERPRISE |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update |

### 5.2 User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Foreign key to Tenant |
| email | String | Unique email per tenant |
| password_hash | String | Bcrypt hash |
| role | Enum | SUPER_ADMIN, TENANT_ADMIN, USER |
| status | Enum | ACTIVE, INACTIVE, PENDING |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update |

### 5.3 AuditLog
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Foreign key to Tenant |
| user_id | UUID | Foreign key to User |
| action | String | Action description |
| resource | String | Resource type |
| metadata | JSON | Additional data |
| created_at | DateTime | Timestamp |

---

## 6. API Endpoints

### 6.1 Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### 6.2 Tenant Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | List all tenants (super admin) |
| POST | `/api/tenants` | Create new tenant |
| GET | `/api/tenants/:id` | Get tenant details |
| PATCH | `/api/tenants/:id` | Update tenant |
| DELETE | `/api/tenants/:id` | Delete tenant |

### 6.3 User Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users in tenant |
| POST | `/api/users` | Create user |
| GET | `/api/users/:id` | Get user details |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### 6.4 Analytics Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard metrics |
| GET | `/api/analytics/usage` | Usage statistics |
| GET | `/api/analytics/activity` | Activity logs |

---

## 7. Frontend Pages

### 7.1 Public Pages
- **Login Page:** User authentication
- **Register Page:** New user registration
- **Forgot Password:** Password reset flow

### 7.2 Protected Pages (Authenticated)
- **Dashboard:** Overview with key metrics
- **Tenant Management:** Admin tenant controls
- **User Management:** CRUD operations for users
- **Analytics:** Detailed usage analytics
- **Profile Settings:** User preferences

---

## 8. Docker Deployment

### 8.1 Services
- **api:** Express.js backend (Node.js 20-alpine)
- **frontend:** React SPA (Nginx alpine)
- **postgres:** PostgreSQL 15
- **redis:** Redis 7 for caching

### 8.2 Docker Compose Structure
- Network: `app-network`
- Volumes: persistent data for postgres and redis
- Health checks on all services

---

## 9. Deliverables

- [x] Core backend API with Express.js
- [x] Frontend application with React + TypeScript
- [x] Database models with Prisma ORM
- [x] Comprehensive test suite (unit + integration)
- [x] README documentation
- [x] Docker deployment with docker-compose
- [x] Multi-tenant architecture
- [x] JWT authentication with RBAC
- [x] Analytics dashboard

---

## 10. Milestones

| Phase | Description | Duration |
|-------|-------------|----------|
| 1 | Core implementation (API, DB, Auth) | Week 1 |
| 2 | Frontend development | Week 2 |
| 3 | Testing & Docker deployment | Week 3 |

---

## 11. Acceptance Criteria

1. **Authentication:** Users can register, login, logout with JWT tokens
2. **Multi-tenancy:** Complete tenant isolation with role-based access
3. **API:** All endpoints return proper HTTP status codes and JSON responses
4. **Frontend:** All pages render correctly with proper navigation
5. **Tests:** Unit tests pass with >70% coverage on core modules
6. **Docker:** Application starts with `docker-compose up`
7. **Documentation:** README includes setup and deployment instructions