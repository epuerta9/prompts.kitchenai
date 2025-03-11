# KitchenAI Backend API Documentation

This document provides detailed information about the KitchenAI Backend API endpoints and their usage.

## Base URL

```
http://localhost:8080/api
```

## Authentication

Authentication details will be added in future versions.

## Endpoints

### Prompts

#### Get All Prompts

```http
GET /prompts
```

Returns a list of all prompts.

**Response**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "created_by": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Versions

#### Get Prompt Versions

```http
GET /prompts/:id/versions
```

Returns all versions for a specific prompt.

**Parameters**
- `id` (path): Prompt ID

**Response**
```json
[
  {
    "id": "string",
    "prompt_id": "string",
    "version": "integer",
    "content": "string",
    "created_by": "string",
    "created_at": "timestamp"
  }
]
```

### Comments

#### Get Prompt Comments

```http
GET /prompts/:id/comments
```

Returns all comments for a specific prompt.

**Parameters**
- `id` (path): Prompt ID

**Response**
```json
[
  {
    "id": "string",
    "prompt_id": "string",
    "content": "string",
    "created_by": "string",
    "created_at": "timestamp"
  }
]
```

### Evaluations

#### Get Version Evaluations

```http
GET /prompts/:id/versions/:version/evals
```

Returns all evaluations for a specific prompt version.

**Parameters**
- `id` (path): Prompt ID
- `version` (path): Version number

**Response**
```json
[
  {
    "id": "string",
    "prompt_version_id": "string",
    "score": "number",
    "notes": "string",
    "created_by": "string",
    "created_at": "timestamp"
  }
]
```

## Data Types

### Prompt
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| title | string | Prompt title |
| description | string | Optional description |
| created_by | string | User who created the prompt |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### Version
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| prompt_id | string | Reference to prompt |
| version | integer | Version number |
| content | string | Version content (JSON) |
| created_by | string | User who created the version |
| created_at | timestamp | Creation timestamp |

### Comment
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| prompt_id | string | Reference to prompt |
| content | string | Comment content |
| created_by | string | User who created the comment |
| created_at | timestamp | Creation timestamp |

### Evaluation
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| prompt_version_id | string | Reference to prompt version |
| score | number | Evaluation score |
| notes | string | Optional evaluation notes |
| created_by | string | User who created the evaluation |
| created_at | timestamp | Creation timestamp |

## Development

### Database Setup

The application uses SQLite as its database. To set up the database:

1. Ensure you have the correct database URL in your environment:
   ```bash
   export DATABASE_URL=file:./data.db?_foreign_keys=on
   ```

2. The database migrations will run automatically when the server starts.

### Running the Server

To run the server:

```bash
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`. 