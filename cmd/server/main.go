package main

import (
	"log"
	"os"

	"github.com/epuerta9/prompts.kitchenai/internal/api/server"
)

func main() {
	// Check required environment variables
	if os.Getenv("DATABASE_URL") == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Run the server
	if err := server.Run(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
