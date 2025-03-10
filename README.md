# KitchenAI Prompts Manager

A prompt management system that makes it easy for users to version, view, manage, run evaluations against their prompts, and integrate them into their code.

## Features

- **Prompt Management**: Store, version, and retrieve prompts
- **Versioning**: Track changes to prompts over time
- **Comments**: Leave notes and feedback on prompts
- **Evaluations**: Rate and provide feedback on prompt performance
- **Integration**: Easily integrate prompts into your code
- **MCP Server**: Local server that communicates with the central prompt repository

## Architecture

- Backend: Go with Echo web framework
- Database: SQLite
- Frontend: ReactJS embedded in the Go application
- MCP Client: Python implementation with Flask

## Directory Structure

```
prompts.kitchenai/
├── api/
│   ├── handlers/    # API request handlers
│   └── models/      # Data models
├── cmd/
│   └── server/      # Main API server
├── db/              # Database connection and migrations
├── frontend/        # React frontend application
│   ├── build/       # Built frontend assets (generated)
│   └── src/         # Frontend source code
├── internal/        # Internal packages
├── python_mcp/      # Python implementation of the MCP server
└── go.mod           # Go module file
```

## Prerequisites

- Go 1.16 or higher
- Node.js 14 or higher (for frontend development)
- SQLite (built-in)
- Python 3.7 or higher (for Python MCP)

## Setup

### Server Setup

1. Clone the repository:
   ```
   git clone https://github.com/epuerta9/prompts.kitchenai.git
   cd prompts.kitchenai
   ```

2. Install Go dependencies:
   ```
   go mod tidy
   ```

3. Build the frontend:
   ```
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. Set up environment variables:
   ```
   export SQLITE_URL=file:./prompts.db?_foreign_keys=on  # For local development
   ```

5. Run the server:
   ```
   go run cmd/server/main.go
   ```

### MCP Setup

#### Go MCP (Deprecated)

The Go MCP implementation has been replaced by the Python MCP.

#### Python MCP (Recommended)

1. Install the Python MCP:
   ```
   cd python_mcp
   pip install -e .
   ```

2. Run the Python MCP:
   ```
   kitchenai-mcp
   ```

   Or run it directly:
   ```
   python python_mcp/mcp_server.py
   ```

## Usage

### Using the Web Interface

Access the web interface at http://localhost:8080 to:
- Browse and search prompts
- View prompt details and versions
- Leave comments
- Create new prompts and versions
- Run evaluations

### Integrating Prompts into Your Code

1. Add special comment markers to your code:
   ```go
   // PROMPT:your-prompt-id
   // Your current prompt will be replaced here
   // PROMPT:END
   ```

2. Use the MCP server to fetch and integrate a specific version:
   ```
   curl -X POST http://localhost:8081/api/prompts/your-prompt-id/versions/1/integrate \
     -H "Content-Type: application/json" \
     -d '{"file_path": "/path/to/your/file.go"}'
   ```

3. Or use the web interface to select a prompt version and enter the file path

## Development

### Running in Development Mode

1. Start the API server:
   ```
   go run cmd/server/main.go
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. In a separate terminal, start the Python MCP server:
   ```
   cd python_mcp
   python mcp_server.py
   ```

## Running Tests

### Go Tests
```
go test ./...
```

### Python Tests
```
cd python_mcp
pytest
```

## License

MIT
