# KitchenAI Prompts MCP Server (Python)

A Python implementation of the MCP (Master Control Program) server for KitchenAI Prompts.

## Overview

This Python MCP server communicates with the main Go API server and provides a local interface for managing prompts. It allows users to:

- List, view, and manage prompts from the central server
- Integrate prompts into local code files
- Leave comments and evaluations on prompts
- Configure connection settings

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Install from Source

1. Clone the repository:
   ```
   git clone https://github.com/epuerta9/prompts.kitchenai.git
   cd prompts.kitchenai/python_mcp
   ```

2. Install the package:
   ```
   pip install -e .
   ```

### Install from PyPI (Coming Soon)

```
pip install kitchenai-mcp
```

## Usage

### Command Line

```
kitchenai-mcp [--port PORT] [--api-url API_URL] [--token TOKEN]
```

Options:
- `--port`: The port to listen on (default: 8081)
- `--api-url`: The URL of the API server (default: http://localhost:8080)
- `--token`: Authentication token for the API server

### Configuration

Configuration is stored in `~/.kitchenai/config.json`. You can modify it directly or use the API endpoint:

```
curl -X PUT http://localhost:8081/api/config \
  -H "Content-Type: application/json" \
  -d '{"api_url": "https://api.kitchenai.com", "port": 8081}'
```

## API Endpoints

The MCP server provides the following API endpoints:

- `GET /api/prompts`: List all prompts
- `GET /api/prompts/<id>`: Get a specific prompt
- `POST /api/prompts`: Create a new prompt
- `GET /api/prompts/<id>/versions`: List all versions of a prompt
- `GET /api/prompts/<id>/versions/<version>`: Get a specific version of a prompt
- `POST /api/prompts/<id>/versions`: Create a new version of a prompt
- `GET /api/prompts/<id>/comments`: List all comments for a prompt
- `POST /api/prompts/<id>/comments`: Add a comment to a prompt
- `POST /api/prompts/<id>/versions/<version>/eval`: Create an evaluation for a prompt version
- `GET /api/prompts/<id>/versions/<version>/evals`: List all evaluations for a prompt version
- `POST /api/prompts/<id>/versions/<version>/integrate`: Integrate a prompt version into a file
- `GET /api/config`: Get the current configuration
- `PUT /api/config`: Update the configuration

## Integrating Prompts into Code

To integrate a prompt into your code:

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

## Running Tests

```
cd python_mcp
pytest
```

## Development

### Setup Development Environment

```
cd python_mcp
pip install -r requirements.txt
```

### Run in Development Mode

```
cd python_mcp
python mcp_server.py
```

## License

MIT 