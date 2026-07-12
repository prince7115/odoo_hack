# AssetFlow Backend

**Enterprise Asset Management System** — Spring Boot Backend

## Tech Stack

| Technology | Version |
|-----------|---------|
| Java | 21 |
| Spring Boot | 3.4.13 |
| Spring Security | OAuth2 + JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA |
| Build Tool | Maven |
| API Docs | SpringDoc OpenAPI (Swagger) |
| Mapping | MapStruct 1.6.3 |
| Utilities | Lombok 1.18.46 |

## Prerequisites

- Java 21+
- Maven 3.9+
- PostgreSQL 15+

## Quick Start

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE assetflow_db;
```

### 2. Configure Environment Variables

```bash
# Database
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=assetflow_db
export DB_USERNAME=postgres
export DB_PASSWORD=postgres

# Google OAuth2
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT
export JWT_SECRET=your-super-secret-jwt-key-at-least-256-bits

# Admin
export ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Run the Application

```bash
mvn clean spring-boot:run
```

### 4. Access Swagger UI

```
http://localhost:8080/swagger-ui.html
```

## Project Structure

```
src/main/java/com/assetflow/
├── AssetFlowApplication.java
├── auth/              # OAuth2 login, JWT auth
├── config/            # App config, CORS, OpenAPI
├── security/          # JWT service, filters, security config
├── common/            # Shared DTOs, exceptions, enums, base entity
├── employee/          # Employee management
├── department/        # Department management
├── assetcategory/     # Asset categories
├── asset/             # Asset registry
├── allocation/        # Asset allocation
├── transfer/          # Asset transfers
├── booking/           # Resource booking
├── maintenance/       # Maintenance management
├── audit/             # Asset audit
├── dashboard/         # Dashboard & analytics
├── notification/      # Notifications
└── activitylog/       # Activity logs
```

## API Endpoints

Full API documentation available at `/swagger-ui.html` when the application is running.

## Authentication Flow

1. User clicks "Continue with Google"
2. Redirects to Google OAuth2
3. Google authenticates and returns profile
4. Backend creates/finds Employee record
5. Backend generates JWT token
6. Frontend stores JWT and uses it for all API calls

## Roles

| Role | Permissions |
|------|------------|
| ADMIN | Full access — org setup, role promotion, analytics |
| ASSET_MANAGER | Asset CRUD, allocations, transfers, maintenance approval |
| DEPARTMENT_HEAD | Dept assets, approve dept transfers, bookings |
| EMPLOYEE | View assets, book resources, raise requests |

## License

Hackathon Project — Not for production use.
