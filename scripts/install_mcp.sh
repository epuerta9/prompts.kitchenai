#!/bin/bash

# KitchenAI Prompts MCP Installer
# This script installs the MCP (Master Control Program) server for KitchenAI Prompts

set -e

echo "KitchenAI Prompts MCP Installer"
echo "==============================="
echo

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "Error: Go is not installed. Please install Go before continuing."
    echo "Visit https://golang.org/doc/install for installation instructions."
    exit 1
fi

# Create config directory
CONFIG_DIR="$HOME/.kitchenai"
mkdir -p "$CONFIG_DIR"

# Check if the MCP is already installed
if command -v kitchenai-mcp &> /dev/null; then
    echo "KitchenAI MCP is already installed. Updating to the latest version..."
else
    echo "Installing KitchenAI MCP..."
fi

# Get the latest code
echo "Downloading and installing the latest version..."
go install github.com/kitchenai/prompts/cmd/mcp@latest

# Create a config file if it doesn't exist
CONFIG_FILE="$CONFIG_DIR/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating default configuration file..."
    cat > "$CONFIG_FILE" << EOF
{
    "server_url": "https://api.kitchenai.com",
    "port": 8081
}
EOF
    echo "Default configuration created at $CONFIG_FILE"
fi

# Add to PATH if not already there
INSTALL_DIR="$(go env GOPATH)/bin"
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo "Adding $INSTALL_DIR to PATH..."
    
    # Detect shell
    if [ -n "$BASH_VERSION" ]; then
        SHELL_RC="$HOME/.bashrc"
    elif [ -n "$ZSH_VERSION" ]; then
        SHELL_RC="$HOME/.zshrc"
    else
        SHELL_RC="$HOME/.profile"
    fi
    
    echo "export PATH=\$PATH:$INSTALL_DIR" >> "$SHELL_RC"
    echo "Please restart your shell or run 'source $SHELL_RC' to update your PATH."
fi

# Final instructions
echo
echo "Installation complete!"
echo "You can now run the MCP server with: kitchenai-mcp"
echo
echo "The server will be available at http://localhost:8081"
echo "Configure your server URL and other settings in $CONFIG_FILE" 