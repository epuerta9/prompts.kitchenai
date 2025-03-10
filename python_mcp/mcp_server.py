#!/usr/bin/env python3

import os
import sys
import argparse
import json
import logging
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from prompts_client import PromptClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("kitchenai-mcp")

# Initialize Flask app
app = Flask(__name__)

# Initialize the client
client = None

# Config file location
CONFIG_DIR = os.path.expanduser("~/.kitchenai")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")

def load_config():
    """Load configuration from file."""
    if not os.path.exists(CONFIG_FILE):
        # Create default config
        default_config = {
            "api_url": "http://localhost:8080",
            "port": 8081,
            "auth_token": None
        }
        os.makedirs(CONFIG_DIR, exist_ok=True)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(default_config, f, indent=2)
        return default_config
    
    with open(CONFIG_FILE, 'r') as f:
        return json.load(f)

def save_config(config):
    """Save configuration to file."""
    os.makedirs(CONFIG_DIR, exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

# API Routes
@app.route('/api/prompts', methods=['GET'])
def list_prompts():
    """List all prompts."""
    try:
        prompts = client.list_prompts()
        return jsonify(prompts)
    except Exception as e:
        logger.error(f"Error listing prompts: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>', methods=['GET'])
def get_prompt(prompt_id):
    """Get a specific prompt."""
    try:
        prompt = client.get_prompt(prompt_id)
        return jsonify(prompt)
    except Exception as e:
        logger.error(f"Error getting prompt {prompt_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts', methods=['POST'])
def create_prompt():
    """Create a new prompt."""
    try:
        data = request.json
        prompt = client.create_prompt(data.get('title', ''), data.get('description', ''))
        return jsonify(prompt), 201
    except Exception as e:
        logger.error(f"Error creating prompt: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/versions', methods=['GET'])
def list_versions(prompt_id):
    """List all versions of a prompt."""
    try:
        versions = client.list_versions(prompt_id)
        return jsonify(versions)
    except Exception as e:
        logger.error(f"Error listing versions for prompt {prompt_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/versions/<version>', methods=['GET'])
def get_version(prompt_id, version):
    """Get a specific version of a prompt."""
    try:
        version_data = client.get_version(prompt_id, version)
        return jsonify(version_data)
    except Exception as e:
        logger.error(f"Error getting version {version} for prompt {prompt_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/versions', methods=['POST'])
def create_version(prompt_id):
    """Create a new version of a prompt."""
    try:
        data = request.json
        version = client.create_version(prompt_id, data.get('content', ''))
        return jsonify(version), 201
    except Exception as e:
        logger.error(f"Error creating version for prompt {prompt_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/comments', methods=['GET'])
def list_comments(prompt_id):
    """List all comments for a prompt."""
    try:
        comments = client.list_comments(prompt_id)
        return jsonify(comments)
    except Exception as e:
        logger.error(f"Error listing comments for prompt {prompt_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/comments', methods=['POST'])
def add_comment(prompt_id):
    """Add a comment to a prompt."""
    try:
        data = request.json
        comment = client.add_comment(prompt_id, data.get('content', ''))
        return jsonify(comment), 201
    except Exception as e:
        logger.error(f"Error adding comment to prompt {prompt_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/versions/<version>/eval', methods=['POST'])
def create_evaluation(prompt_id, version):
    """Create an evaluation for a prompt version."""
    try:
        data = request.json
        eval_result = client.create_evaluation(
            prompt_id, 
            version, 
            data.get('score', 0.0), 
            data.get('notes', '')
        )
        return jsonify(eval_result), 201
    except Exception as e:
        logger.error(f"Error creating evaluation for prompt {prompt_id} version {version}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/versions/<version>/evals', methods=['GET'])
def list_evaluations(prompt_id, version):
    """List all evaluations for a prompt version."""
    try:
        evals = client.list_evaluations(prompt_id, version)
        return jsonify(evals)
    except Exception as e:
        logger.error(f"Error listing evaluations for prompt {prompt_id} version {version}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/prompts/<prompt_id>/versions/<version>/integrate', methods=['POST'])
def integrate_prompt(prompt_id, version):
    """Integrate a prompt version into a file."""
    try:
        data = request.json
        file_path = data.get('file_path', '')
        
        # Use local integration to avoid an extra network call
        result = client.integrate_prompt_locally(prompt_id, version, file_path)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error integrating prompt {prompt_id} version {version}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get the current configuration."""
    try:
        config = load_config()
        # Remove sensitive data
        if 'auth_token' in config:
            config['auth_token'] = '***' if config['auth_token'] else None
        return jsonify(config)
    except Exception as e:
        logger.error(f"Error getting config: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/config', methods=['PUT'])
def update_config():
    """Update the configuration."""
    try:
        current_config = load_config()
        new_config = request.json
        
        # Update only the specified fields
        for key, value in new_config.items():
            if key in current_config:
                current_config[key] = value
        
        save_config(current_config)
        
        # Reinitialize client if API URL changed
        global client
        client = PromptClient(current_config['api_url'])
        if current_config.get('auth_token'):
            client.set_auth_token(current_config['auth_token'])
        
        # Remove sensitive data from response
        if 'auth_token' in current_config:
            current_config['auth_token'] = '***' if current_config['auth_token'] else None
            
        return jsonify(current_config)
    except Exception as e:
        logger.error(f"Error updating config: {e}")
        return jsonify({"error": str(e)}), 500

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the frontend React app."""
    if path and os.path.exists(os.path.join('frontend', 'build', path)):
        return send_from_directory('frontend/build', path)
    return send_from_directory('frontend/build', 'index.html')

def main():
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(description='KitchenAI Prompts MCP Server')
    parser.add_argument('--port', type=int, help='Port to listen on')
    parser.add_argument('--api-url', help='URL of the API server')
    parser.add_argument('--token', help='Authentication token')
    args = parser.parse_args()
    
    # Load configuration
    config = load_config()
    
    # Override from command line arguments
    if args.port:
        config['port'] = args.port
    if args.api_url:
        config['api_url'] = args.api_url
    if args.token:
        config['auth_token'] = args.token
    
    # Save updated configuration
    save_config(config)
    
    # Initialize client
    global client
    client = PromptClient(config['api_url'])
    if config.get('auth_token'):
        client.set_auth_token(config['auth_token'])
    
    # Print startup message
    logger.info(f"Starting KitchenAI MCP Server on port {config['port']}")
    logger.info(f"API URL: {config['api_url']}")
    logger.info(f"Configuration directory: {CONFIG_DIR}")
    
    # Start the server
    app.run(host='0.0.0.0', port=config['port'])

if __name__ == "__main__":
    main() 