# 🏢 Digital Approval Metrics System (DAMS)

A production-ready full-stack application for managing and tracking approval requests with real-time metrics.

---

## 📐 Architecture Overview

```
dams/
├── backend/                  # Spring Boot 3 + Java 17
│   ├── src/main/java/com/dams/
│   │   ├── controller/       # REST endpoints
│   │   ├── service/          # Business logic
│   │   ├── repository/       # JPA repositories
│   │   ├── entity/           # JPA entities
│   │   ├── dto/              # Data transfer objects
│   │   ├── security/         # JWT filter, UserDetailsService
│   │   ├── config/           # Spring Security config
│   │   └── exception/        # Global exception handler
│   └── src/main/resources/
│       ├── application.yml
│       └── schema.sql
│
├── frontend/                 # Next.js 14 + TypeScript
│   └── src/
│       ├── app/              # App Router pages
│       │   ├── login/
│       │   ├── register/
│       │   ├── employee/dashboard/
│       │   └── admin/dashboard/
│       ├── components/       # Reusable UI components
│       ├── context/          # Auth Context
│       ├── services/         # API service layer (Axios)
│       ├── types/            # TypeScript interfaces
│       └── lib/              # Axios client
│
├── docker-compose.yml
└── README.md
```

---

## 🔑 Roles & Access

| Feature | Employee | Admin |
|---|---|---|
| Register / Login | ✅ | ✅ |
| Create requests | ✅ | — |
| View own requests | ✅ | — |
| View own stats | ✅ | — |
| View all requests | — | ✅ |
| Approve / Reject | — | ✅ |
| View full metrics | — | ✅ |

---

## 🚀 Quick Start — Docker (Recommended)

### Prerequisites
- Docker Desktop ≥ 24
- Docker Compose ≥ 2.20

### Steps

```bash
# 1. Clone / download the project
cd dams

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. (Optional) Set a strong JWT secret in backend/.env
# JWT_SECRET=<your-base64-encoded-256-bit-secret>

# 4. Start everything
docker compose up --build

# Services:
#   Frontend  →  http://localhost:3000
#   Backend   →  http://localhost:8080
#   Postgres  →  localhost:5432
```

### Demo Credentials (seeded automatically)
| Role | Email | Password |
|---|---|---|
| Admin | admin@dams.com | Admin@123 |
| Employee | employee@dams.com | Employee@123 |

---

## 🛠 Manual Setup (Development)

### 1. PostgreSQL

```sql
-- Create database and user
CREATE DATABASE dams_db;
CREATE USER dams_user WITH ENCRYPTED PASSWORD 'dams_password';
GRANT ALL PRIVILEGES ON DATABASE dams_db TO dams_user;

-- Connect and run schema
\c dams_db
\i backend/src/main/resources/schema.sql
```

### 2. Backend

```bash
cd backend

# Copy and configure env
cp .env.example .env
# Edit .env with your database credentials

# Run (Maven)
./mvnw spring-boot:run

# Or with env vars:
DATABASE_URL=jdbc:postgresql://localhost:5432/dams_db \
DATABASE_USERNAME=dams_user \
DATABASE_PASSWORD=dams_password \
JWT_SECRET=<base64-secret> \
./mvnw spring-boot:run
```

**Backend starts on:** http://localhost:8080

### 3. Frontend

```bash
cd frontend

# Copy and configure env
cp .env.example .env.local
# Edit: NEXT_PUBLIC_API_URL=http://localhost:8080

# Install dependencies
npm install

# Run development server
npm run dev
```

**Frontend starts on:** http://localhost:3000

---

## 🗄 Database Schema

```sql
TABLE users
  id         BIGSERIAL PRIMARY KEY
  name       VARCHAR(100) NOT NULL
  email      VARCHAR(150) UNIQUE NOT NULL
  password   VARCHAR(255) NOT NULL  -- BCrypt hashed
  role       VARCHAR(20)  CHECK IN ('ADMIN', 'EMPLOYEE')
  created_at TIMESTAMP    DEFAULT NOW()

TABLE requests
  id          BIGSERIAL PRIMARY KEY
  title       VARCHAR(200) NOT NULL
  description TEXT
  status      VARCHAR(20)  CHECK IN ('PENDING', 'APPROVED', 'REJECTED')
  created_at  TIMESTAMP    DEFAULT NOW()
  approved_at TIMESTAMP    NULLABLE
  employee_id BIGINT       REFERENCES users(id)
```

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `{name, email, password, role}` | Public |
| POST | `/api/auth/login` | `{email, password}` | Public |

### Employee

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/requests` | JWT (EMPLOYEE) |
| GET | `/api/requests/my` | JWT (EMPLOYEE) |
| GET | `/api/requests/my/stats` | JWT (EMPLOYEE) |

### Admin

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/admin/requests?page=0&size=20` | JWT (ADMIN) |
| PUT | `/api/admin/requests/{id}/approve` | JWT (ADMIN) |
| PUT | `/api/admin/requests/{id}/reject` | JWT (ADMIN) |
| GET | `/api/admin/metrics` | JWT (ADMIN) |

### Metrics Response Shape

```json
{
  "totalRequests": 42,
  "approvedCount": 28,
  "rejectedCount": 8,
  "pendingCount": 6,
  "approvalRate": 66.67,
  "averageApprovalTimeHours": 3.5
}
```

---

## 🔐 Security

- **Passwords** hashed with BCrypt (strength 12)
- **JWT** signed with HMAC-SHA256, 24h expiry
- **JWT stored** in HttpOnly cookie + localStorage fallback
- **CORS** locked to configured frontend origin
- **Role-based** authorization via Spring Security `@PreAuthorize`
- **Input validation** with Jakarta Bean Validation annotations
- **SQL injection** prevention via JPA parameterized queries

---

## 🧪 Running Tests

```bash
# Backend
cd backend && ./mvnw test

# Frontend lint
cd frontend && npm run lint
```

---

## ⚙️ Configuration Reference

### backend/.env

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/dams_db` |
| `DATABASE_USERNAME` | DB user | `dams_user` |
| `DATABASE_PASSWORD` | DB password | `dams_password` |
| `JWT_SECRET` | Base64-encoded 256-bit secret | (required in production) |
| `JWT_EXPIRATION` | Token TTL in milliseconds | `86400000` (24h) |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |

### frontend/.env.local

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

---

## 🏗 Generating a Secure JWT Secret

```bash
# Option 1: OpenSSL
openssl rand -base64 64

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 📦 Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| API Client | Axios |
| Charts | Recharts |
| Auth (FE) | Context API, js-cookie |
| Backend | Spring Boot 3.2, Java 17 |
| Security | Spring Security 6, JWT (JJWT 0.12) |
| ORM | JPA / Hibernate 6 |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Kill processes on required ports
lsof -ti:8080 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

**Backend fails to start (DB connection):**
```bash
# Check postgres is running
docker compose ps
# View backend logs
docker compose logs backend -f
```

**Invalid JWT:**
- Ensure the same `JWT_SECRET` is set in `.env` and consistent across restarts.
- Clear browser cookies/localStorage and log in again.

**CORS errors:**
- Ensure `FRONTEND_URL` in `backend/.env` matches your Next.js URL exactly (no trailing slash).
