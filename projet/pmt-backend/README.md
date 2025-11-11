# PMT Backend

Spring Boot REST API for Project Management Tool.

## Technologies

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- PostgreSQL
- Lombok
- Maven
- JaCoCo (Code Coverage)

## Prerequisites

- JDK 17+
- Maven 3.8+
- PostgreSQL 15+

## Setup

### 1. Database Setup

Create PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE pmt;
CREATE USER admin WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE pmt TO admin;
```

Run init script:

```bash
psql -U admin -d pmt -f ../init-db.sql
```

### 2. Build

```bash
./mvnw clean install
```

### 3. Run

```bash
./mvnw spring-boot:run
```

API will be available at `http://localhost:8080`

## Docker

Build and run with Docker:

```bash
docker build -t pmt-backend .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/pmt \
  -e SPRING_DATASOURCE_USERNAME=admin \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  pmt-backend
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user?email={email}` - Get user by email

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all user projects
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/{id}/dashboard` - Get dashboard stats
- `PUT /api/projects/{id}/members/{memberId}/role` - Update member role
- `DELETE /api/projects/{id}/members/{memberId}` - Remove member

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task by ID
- `GET /api/tasks/project/{projectId}` - Get all project tasks
- `GET /api/tasks/project/{projectId}/status/{status}` - Get tasks by status
- `GET /api/tasks/assigned` - Get assigned tasks
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/{id}/history` - Get task history

### Invitations
- `POST /api/invitations/project/{projectId}` - Send invitation
- `POST /api/invitations/{token}/accept` - Accept invitation
- `POST /api/invitations/{token}/reject` - Reject invitation
- `GET /api/invitations/project/{projectId}` - Get project invitations
- `GET /api/invitations/pending?email={email}` - Get pending invitations
- `DELETE /api/invitations/{id}` - Cancel invitation

## Testing

Run tests with coverage:

```bash
./mvnw clean verify
```

View coverage report:

```bash
open target/site/jacoco/index.html
```

## Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pmt
spring.datasource.username=admin
spring.datasource.password=secret
server.port=8080
```
