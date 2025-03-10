#!/usr/bin/env python3

"""
Migration tool to help users switch from the Go MCP to the Python MCP.

This script:
1. Checks if the Go MCP configuration exists
2. Copies the configuration to the Python MCP
3. Optionally uninstalls the Go MCP
"""

import os
import json
import argparse
import shutil
import subprocess
import sys
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Migrate from Go MCP to Python MCP')
    parser.add_argument('--skip-uninstall', action='store_true', help='Skip uninstalling the Go MCP')
    args = parser.parse_args()
    
    # Define paths
    home_dir = os.path.expanduser("~")
    go_config_dir = os.path.join(home_dir, ".kitchenai")
    go_config_file = os.path.join(go_config_dir, "config.json")
    py_config_dir = os.path.join(home_dir, ".kitchenai")
    py_config_file = os.path.join(py_config_dir, "config.json")
    
    # Check if Go MCP config exists
    if not os.path.exists(go_config_file):
        print("Go MCP configuration not found. Nothing to migrate.")
        return
    
    # Read Go MCP config
    try:
        with open(go_config_file, 'r') as f:
            go_config = json.load(f)
        print(f"Found Go MCP configuration: {go_config}")
    except Exception as e:
        print(f"Error reading Go MCP configuration: {e}")
        return
    
    # Create Python MCP config
    py_config = {
        "api_url": go_config.get("server_url", "http://localhost:8080"),
        "port": go_config.get("port", 8081),
        "auth_token": None
    }
    
    # Create config directory if it doesn't exist
    os.makedirs(py_config_dir, exist_ok=True)
    
    # Write Python MCP config
    try:
        with open(py_config_file, 'w') as f:
            json.dump(py_config, f, indent=2)
        print(f"Python MCP configuration written to {py_config_file}")
    except Exception as e:
        print(f"Error writing Python MCP configuration: {e}")
        return
    
    # Uninstall Go MCP if requested
    if not args.skip_uninstall:
        try:
            # Find the location of the Go MCP binary
            go_path = subprocess.check_output(["go", "env", "GOPATH"], text=True).strip()
            mcp_binary = os.path.join(go_path, "bin", "mcp")
            
            if os.path.exists(mcp_binary):
                os.remove(mcp_binary)
                print(f"Removed Go MCP binary: {mcp_binary}")
            else:
                print("Go MCP binary not found.")
            
            print("Go MCP uninstalled.")
        except Exception as e:
            print(f"Error uninstalling Go MCP: {e}")
    
    print("\nMigration completed!")
    print("\nTo install the Python MCP, run:")
    print("  cd python_mcp")
    print("  pip install -e .")
    print("\nTo start the Python MCP, run:")
    print("  kitchenai-mcp")
    print("  or")
    print("  python python_mcp/mcp_server.py")

if __name__ == "__main__":
    main() 