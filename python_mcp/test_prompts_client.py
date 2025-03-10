#!/usr/bin/env python3

import unittest
import os
from unittest.mock import patch, MagicMock
import tempfile
import json
import shutil

from prompts_client import PromptClient

class TestPromptClient(unittest.TestCase):
    """Test cases for the Prompt Client."""
    
    def setUp(self):
        """Set up test case."""
        self.client = PromptClient("http://test-api.example.com")
        self.mock_response = MagicMock()
        self.mock_response.json.return_value = {"success": True}
        self.mock_response.raise_for_status.return_value = None
    
    @patch('requests.get')
    def test_list_prompts(self, mock_get):
        """Test listing prompts."""
        # Configure mock
        self.mock_response.json.return_value = [
            {"id": "1", "title": "Test Prompt 1"},
            {"id": "2", "title": "Test Prompt 2"},
        ]
        mock_get.return_value = self.mock_response
        
        # Call method
        result = self.client.list_prompts()
        
        # Assert
        mock_get.assert_called_once_with(
            "http://test-api.example.com/api/prompts",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["title"], "Test Prompt 1")
        self.assertEqual(result[1]["title"], "Test Prompt 2")
    
    @patch('requests.get')
    def test_get_prompt(self, mock_get):
        """Test getting a specific prompt."""
        # Configure mock
        self.mock_response.json.return_value = {
            "id": "prompt-123",
            "title": "Test Prompt",
            "description": "Test Description"
        }
        mock_get.return_value = self.mock_response
        
        # Call method
        result = self.client.get_prompt("prompt-123")
        
        # Assert
        mock_get.assert_called_once_with(
            "http://test-api.example.com/api/prompts/prompt-123",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(result["id"], "prompt-123")
        self.assertEqual(result["title"], "Test Prompt")
    
    @patch('requests.post')
    def test_create_prompt(self, mock_post):
        """Test creating a prompt."""
        # Configure mock
        self.mock_response.json.return_value = {
            "id": "new-prompt-123",
            "title": "New Prompt",
            "description": "New Description"
        }
        mock_post.return_value = self.mock_response
        
        # Call method
        result = self.client.create_prompt("New Prompt", "New Description")
        
        # Assert
        mock_post.assert_called_once_with(
            "http://test-api.example.com/api/prompts",
            headers={"Content-Type": "application/json"},
            json={"title": "New Prompt", "description": "New Description"}
        )
        self.assertEqual(result["id"], "new-prompt-123")
        self.assertEqual(result["title"], "New Prompt")
    
    @patch('requests.get')
    def test_list_versions(self, mock_get):
        """Test listing versions of a prompt."""
        # Configure mock
        self.mock_response.json.return_value = [
            {"id": "v1", "prompt_id": "prompt-123", "version": 1},
            {"id": "v2", "prompt_id": "prompt-123", "version": 2},
        ]
        mock_get.return_value = self.mock_response
        
        # Call method
        result = self.client.list_versions("prompt-123")
        
        # Assert
        mock_get.assert_called_once_with(
            "http://test-api.example.com/api/prompts/prompt-123/versions",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["version"], 1)
        self.assertEqual(result[1]["version"], 2)
    
    @patch('requests.get')
    def test_get_version(self, mock_get):
        """Test getting a specific version of a prompt."""
        # Configure mock
        self.mock_response.json.return_value = {
            "id": "v2",
            "prompt_id": "prompt-123",
            "version": 2,
            "content": "This is version 2 content"
        }
        mock_get.return_value = self.mock_response
        
        # Call method
        result = self.client.get_version("prompt-123", 2)
        
        # Assert
        mock_get.assert_called_once_with(
            "http://test-api.example.com/api/prompts/prompt-123/versions/2",
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(result["id"], "v2")
        self.assertEqual(result["version"], 2)
        self.assertEqual(result["content"], "This is version 2 content")
    
    def test_integrate_prompt_locally(self):
        """Test integrating a prompt locally."""
        # Create a temporary file
        temp_dir = tempfile.mkdtemp()
        try:
            test_file_path = os.path.join(temp_dir, "test_file.txt")
            with open(test_file_path, "w") as f:
                f.write("// PROMPT:test-123\nOld content\n// PROMPT:END\nOther content")
            
            # Mock the client's get_version method
            self.client.get_version = MagicMock()
            self.client.get_version.return_value = {
                "id": "v1",
                "prompt_id": "test-123",
                "version": 1,
                "content": "New content"
            }
            
            # Call method
            result = self.client.integrate_prompt_locally("test-123", 1, test_file_path)
            
            # Assert
            self.assertTrue(result["success"])
            self.assertEqual(result["prompt_id"], "test-123")
            self.assertEqual(result["version"], 1)
            
            # Check that the file was updated correctly
            with open(test_file_path, "r") as f:
                content = f.read()
                self.assertEqual(content, "// PROMPT:test-123\nNew content\n// PROMPT:END\nOther content")
                
            # Verify backup file exists
            backup_file_path = test_file_path + ".bak"
            self.assertTrue(os.path.exists(backup_file_path))
            with open(backup_file_path, "r") as f:
                content = f.read()
                self.assertEqual(content, "// PROMPT:test-123\nOld content\n// PROMPT:END\nOther content")
        finally:
            # Clean up
            shutil.rmtree(temp_dir)
    
    @patch('requests.post')
    def test_add_comment(self, mock_post):
        """Test adding a comment to a prompt."""
        # Configure mock
        self.mock_response.json.return_value = {
            "id": "comment-123",
            "prompt_id": "prompt-123",
            "content": "Test comment",
            "created_at": "2023-06-15T12:00:00Z"
        }
        mock_post.return_value = self.mock_response
        
        # Call method
        result = self.client.add_comment("prompt-123", "Test comment")
        
        # Assert
        mock_post.assert_called_once_with(
            "http://test-api.example.com/api/prompts/prompt-123/comments",
            headers={"Content-Type": "application/json"},
            json={"content": "Test comment"}
        )
        self.assertEqual(result["id"], "comment-123")
        self.assertEqual(result["content"], "Test comment")
    
    @patch('requests.post')
    def test_create_evaluation(self, mock_post):
        """Test creating an evaluation for a prompt version."""
        # Configure mock
        self.mock_response.json.return_value = {
            "id": "eval-123",
            "version_id": "v1",
            "score": 0.85,
            "notes": "Good prompt"
        }
        mock_post.return_value = self.mock_response
        
        # Call method
        result = self.client.create_evaluation("prompt-123", 1, 0.85, "Good prompt")
        
        # Assert
        mock_post.assert_called_once_with(
            "http://test-api.example.com/api/prompts/prompt-123/versions/1/eval",
            headers={"Content-Type": "application/json"},
            json={"score": 0.85, "notes": "Good prompt"}
        )
        self.assertEqual(result["id"], "eval-123")
        self.assertEqual(result["score"], 0.85)
        self.assertEqual(result["notes"], "Good prompt")
    
    def test_auth_token(self):
        """Test setting and using an auth token."""
        # Set auth token
        self.client.set_auth_token("test-token")
        
        # Check that the headers include the token
        headers = self.client._get_headers()
        self.assertEqual(headers["Authorization"], "Bearer test-token")

if __name__ == "__main__":
    unittest.main() 