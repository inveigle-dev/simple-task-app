# Task Management API

A robust NestJS-based REST API for managing tasks with authentication, built with MongoDB and designed for scalability.

## 🚀 Features

- **Complete CRUD Operations** for tasks
- **JWT Authentication** with secure user management
- **Advanced Task Filtering** (status, priority, search, date ranges, tags)
- **Pagination** for optimal performance
- **Task Statistics** and analytics
- **MongoDB Integration** with Mongoose ODM
- **Comprehensive Validation** using class-validator
- **Global Exception Handling** and response interceptors
- **Role-based Access Control** (RBAC)

## 📋 Task Properties

Each task includes:
- **Title** (required, max 200 characters)
- **Description** (optional, max 1000 characters)
- **Status**: `pending` | `in_progress` | `completed` | `cancelled`
- **Priority**: `low` | `medium` | `high` | `urgent`
- **Due Date** (optional)
- **Tags** (array of strings for categorization)
- **User Association** (tasks are user-specific)
- **Timestamps** (created/updated automatically)

## 🔒 Authentication

The API uses JWT tokens for authentication. All task endpoints require authentication.

### Auth Endpoints
- `POST /auth/login` - User login
- `POST /auth/create-account` - User registration

## 📚 API Endpoints

### Tasks Management

#### Create Task
```http
POST /tasks
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["documentation", "project"]
}
```

#### Get All Tasks (with filtering)
```http
GET /tasks?status=pending&priority=high&page=1&limit=10&search=project
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` - Filter by task status
- `priority` - Filter by priority level
- `search` - Search in title and description
- `dueBefore` - Tasks due before date (ISO string)
- `dueAfter` - Tasks due after date (ISO string)
- `tags` - Comma-separated tag filters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort direction: `asc` | `desc` (default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "status": "pending",
      "priority": "high",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "userId": "507f1f77bcf86cd799439010",
      "tags": ["documentation", "project"],
      "createdAt": "2024-09-22T10:00:00.000Z",
      "updatedAt": "2024-09-22T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

#### Get Single Task
```http
GET /tasks/:id
Authorization: Bearer <jwt_token>
```

#### Update Task
```http
PATCH /tasks/:id
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "status": "completed",
  "description": "Updated description"
}
```

#### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer <jwt_token>
```

#### Get Task Statistics
```http
GET /tasks/stats
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "statusCounts": {
    "pending": 5,
    "in_progress": 3,
    "completed": 8,
    "cancelled": 1
  },
  "priorityCounts": {
    "low": 2,
    "medium": 8,
    "high": 5,
    "urgent": 2
  },
  "overdueTasks": 3
}
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install argon2
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Required variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   MONGO_PASSWORD=your_mongodb_password
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   PORT=3000
   ```

3. **Build the application:**
   ```bash
   nx build @apps/backend
   ```

4. **Start the server:**
   ```bash
   nx serve @apps/backend
   ```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Unit tests
nx test @apps/backend

# Test coverage
nx test @apps/backend --coverage

# Watch mode
nx test @apps/backend --watch
```

### Test Coverage
- **Service Tests**: Complete CRUD operations, error handling, validation
- **Controller Tests**: Endpoint behavior, authentication, parameter validation
- **Integration Tests**: Database operations, middleware, authentication flows

## 🏗️ Architecture

### Project Structure
```
src/
├── auth/           # Authentication module
├── users/          # User management
├── tasks/          # Task management (main feature)
│   ├── dto/        # Data Transfer Objects
│   ├── task.schema.ts      # MongoDB schema
│   ├── tasks.service.ts    # Business logic
│   ├── tasks.controller.ts # HTTP layer
│   └── tasks.module.ts     # Module definition
├── filters/        # Global exception handling
├── interceptors/   # Response formatting
├── pipes/          # Validation pipes
└── main.ts        # Application bootstrap
```

### Design Patterns
- **Repository Pattern** via Mongoose models
- **DTO Pattern** for data validation and transformation
- **Service Layer** for business logic separation
- **Guard Pattern** for authentication and authorization
- **Interceptor Pattern** for response formatting

## 📈 Performance Features

- **Database Indexing** on frequently queried fields
- **Pagination** to handle large datasets
- **Query Optimization** with MongoDB aggregation
- **Validation at Multiple Layers** (DTO, Schema, Database)

## 🔧 Development Notes

### Adding New Task Fields
1. Update the `Task` schema in `task.schema.ts`
2. Add validation rules in DTOs (`create-task.dto.ts`, `update-task.dto.ts`)
3. Update service logic if needed
4. Add corresponding tests

### Error Handling
- All errors are centrally handled by `GlobalExceptionsFilter`
- Validation errors return detailed field-specific messages
- Authentication errors return appropriate HTTP status codes
- Database errors are properly caught and transformed

### Security Considerations
- Passwords are hashed using Argon2
- JWT tokens have configurable expiration
- All task operations are user-scoped (users can only access their own tasks)
- Input validation prevents injection attacks
- Rate limiting and CORS are configured

## 🚦 HTTP Status Codes

- `200` - Successful GET requests
- `201` - Successful POST (task creation)
- `204` - Successful DELETE
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (task doesn't exist or belongs to another user)
- `500` - Internal Server Error

## 🤝 Contributing

1. Write tests for new features
2. Follow the existing code style and patterns
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License.