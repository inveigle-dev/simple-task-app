# Tasks Module

grug make task app. simple. work good.

## What it do

- make task
- get tasks
- update task  
- delete task
- count tasks

## API simple

### Make task
```
POST /tasks
{
  "title": "do thing",
  "description": "do thing good", 
  "priority": "high"
}
```

### Get tasks
```
GET /tasks?status=pending&page=1&limit=10
```

### Get one task
```
GET /tasks/:id
```

### Update task
```
PATCH /tasks/:id
{
  "status": "completed"
}
```

### Delete task
```
DELETE /tasks/:id
```

### Get stats
```
GET /tasks/stats
```
returns: `{ pending: 5, inProgress: 2, completed: 10, total: 17 }`

## Task have

- title (required, max 200 chars)
- description (optional, max 1000 chars)  
- status: `pending` | `in_progress` | `completed` | `cancelled`
- priority: `low` | `medium` | `high` | `urgent`
- dueDate (optional)
- tags (optional array)
- userId (auto set)
- createdAt/updatedAt (auto)

## Auth

need jwt token. all endpoints need auth. user only see own tasks.

## Error

use AppError. return proper http status. simple.

## Test

test important things:
- can make task
- can get tasks
- can update task
- can delete task
- can't see other user tasks
- error when bad id
- error when task not found

grug like simple. code work. test pass. ship it.