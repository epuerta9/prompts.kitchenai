import requests
import json
import os
import shutil
from typing import List, Dict, Optional, Any, Union


class PromptClient:
    def __init__(self, base_url: str = "http://localhost:8080"):
        """Initialize the prompt client.
        
        Args:
            base_url: The base URL of the API server
        """
        self.base_url = base_url
        self.auth_token = None
    
    def set_auth_token(self, token: str) -> None:
        """Set the authentication token for the client.
        
        Args:
            token: The authentication token
        """
        self.auth_token = token
    
    def _get_headers(self) -> Dict[str, str]:
        """Get the headers for the API requests.
        
        Returns:
            A dictionary of headers
        """
        headers = {"Content-Type": "application/json"}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        return headers
    
    def _make_request(self, method: str, path: str, data: Optional[Dict] = None) -> Any:
        """Make a request to the API server.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            path: API endpoint path
            data: Request payload data
            
        Returns:
            JSON response data
            
        Raises:
            requests.exceptions.RequestException: If the request fails
        """
        url = f"{self.base_url}{path}"
        headers = self._get_headers()
        
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()
        return response.json()
    
    def list_prompts(self) -> List[Dict]:
        """List all prompts.
        
        Returns:
            A list of prompt objects
        """
        return self._make_request("GET", "/api/prompts")
    
    def get_prompt(self, prompt_id: str) -> Dict:
        """Get a specific prompt.
        
        Args:
            prompt_id: The ID of the prompt to retrieve
            
        Returns:
            The prompt object
        """
        return self._make_request("GET", f"/api/prompts/{prompt_id}")
    
    def create_prompt(self, title: str, description: str) -> Dict:
        """Create a new prompt.
        
        Args:
            title: The title of the prompt
            description: The description of the prompt
            
        Returns:
            The created prompt object
        """
        data = {
            "title": title,
            "description": description
        }
        return self._make_request("POST", "/api/prompts", data)
    
    def update_prompt(self, prompt_id: str, title: str, description: str) -> Dict:
        """Update an existing prompt.
        
        Args:
            prompt_id: The ID of the prompt to update
            title: The new title of the prompt
            description: The new description of the prompt
            
        Returns:
            The updated prompt object
        """
        data = {
            "title": title,
            "description": description
        }
        return self._make_request("PUT", f"/api/prompts/{prompt_id}", data)
    
    def delete_prompt(self, prompt_id: str) -> Dict:
        """Delete a prompt.
        
        Args:
            prompt_id: The ID of the prompt to delete
            
        Returns:
            A status message
        """
        return self._make_request("DELETE", f"/api/prompts/{prompt_id}")
    
    def list_versions(self, prompt_id: str) -> List[Dict]:
        """List all versions of a prompt.
        
        Args:
            prompt_id: The ID of the prompt
            
        Returns:
            A list of version objects
        """
        return self._make_request("GET", f"/api/prompts/{prompt_id}/versions")
    
    def get_version(self, prompt_id: str, version: Union[int, str]) -> Dict:
        """Get a specific version of a prompt.
        
        Args:
            prompt_id: The ID of the prompt
            version: The version number
            
        Returns:
            The version object
        """
        return self._make_request("GET", f"/api/prompts/{prompt_id}/versions/{version}")
    
    def create_version(self, prompt_id: str, content: str) -> Dict:
        """Create a new version of a prompt.
        
        Args:
            prompt_id: The ID of the prompt
            content: The content of the new version
            
        Returns:
            The created version object
        """
        data = {
            "content": content
        }
        return self._make_request("POST", f"/api/prompts/{prompt_id}/versions", data)
    
    def list_comments(self, prompt_id: str) -> List[Dict]:
        """List all comments for a prompt.
        
        Args:
            prompt_id: The ID of the prompt
            
        Returns:
            A list of comment objects
        """
        return self._make_request("GET", f"/api/prompts/{prompt_id}/comments")
    
    def add_comment(self, prompt_id: str, content: str) -> Dict:
        """Add a comment to a prompt.
        
        Args:
            prompt_id: The ID of the prompt
            content: The content of the comment
            
        Returns:
            The created comment object
        """
        data = {
            "content": content
        }
        return self._make_request("POST", f"/api/prompts/{prompt_id}/comments", data)
    
    def create_evaluation(self, prompt_id: str, version: Union[int, str], score: float, notes: str) -> Dict:
        """Create an evaluation for a prompt version.
        
        Args:
            prompt_id: The ID of the prompt
            version: The version number
            score: The evaluation score (0.0 to 1.0)
            notes: Notes about the evaluation
            
        Returns:
            The created evaluation object
        """
        data = {
            "score": score,
            "notes": notes
        }
        return self._make_request("POST", f"/api/prompts/{prompt_id}/versions/{version}/eval", data)
    
    def list_evaluations(self, prompt_id: str, version: Union[int, str]) -> List[Dict]:
        """List all evaluations for a prompt version.
        
        Args:
            prompt_id: The ID of the prompt
            version: The version number
            
        Returns:
            A list of evaluation objects
        """
        return self._make_request("GET", f"/api/prompts/{prompt_id}/versions/{version}/evals")
    
    def integrate_prompt(self, prompt_id: str, version: Union[int, str], file_path: str) -> Dict:
        """Integrate a prompt version into a file.
        
        Args:
            prompt_id: The ID of the prompt
            version: The version number
            file_path: The path to the file to integrate the prompt into
            
        Returns:
            The integration result
        """
        data = {
            "file_path": file_path
        }
        return self._make_request("POST", f"/api/prompts/{prompt_id}/versions/{version}/integrate", data)
    
    def integrate_prompt_locally(self, prompt_id: str, version: Union[int, str], file_path: str) -> Dict:
        """Integrate a prompt version into a file locally (without server integration).
        
        Args:
            prompt_id: The ID of the prompt
            version: The version number
            file_path: The path to the file to integrate the prompt into
            
        Returns:
            The integration result
        """
        # Get the prompt version content
        version_data = self.get_version(prompt_id, version)
        prompt_content = version_data["content"]
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Create backup
        backup_path = f"{file_path}.bak"
        shutil.copy2(file_path, backup_path)
        
        # Read the file
        with open(file_path, "r", encoding="utf-8") as f:
            file_content = f.read()
        
        # Look for prompt tags
        prompt_tag = f"// PROMPT:{prompt_id}"
        end_tag = "// PROMPT:END"
        
        start_idx = file_content.find(prompt_tag)
        end_idx = file_content.find(end_tag)
        
        if start_idx == -1 or end_idx == -1 or start_idx > end_idx:
            raise ValueError("Couldn't find prompt tags in file")
        
        # Count lines that will be changed
        old_content = file_content[start_idx + len(prompt_tag):end_idx]
        old_lines = old_content.count("\n") + 1
        
        # Replace the content
        new_content = f"{prompt_tag}\n{prompt_content}\n{end_tag}"
        new_file_content = file_content[:start_idx] + new_content + file_content[end_idx + len(end_tag):]
        
        # Write the new content
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_file_content)
        
        # Count the new lines
        new_lines = prompt_content.count("\n") + 1
        lines_changed = new_lines - old_lines
        
        # Return result
        return {
            "success": True,
            "message": "Prompt integrated successfully",
            "file_path": file_path,
            "prompt_id": prompt_id,
            "version": version if isinstance(version, int) else int(version),
            "backup_path": backup_path,
            "lines_changed": lines_changed
        } 