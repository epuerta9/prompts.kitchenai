package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/epuerta9/prompts.kitchenai/api/handlers"
	"github.com/epuerta9/prompts.kitchenai/db"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Initialize database
	database, err := db.Initialize()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Setup routes
	handlers.RegisterRoutes(e, database)

	// Serve static files for React frontend
	e.Static("/", "frontend/build")
	e.GET("/*", func(c echo.Context) error {
		return c.File("frontend/build/index.html")
	})

	// Start server
	go func() {
		log.Printf("Server is running on http://localhost:8080")
		if err := e.Start(":8080"); err != nil {
			if err == http.ErrServerClosed {
				log.Println("Server stopped gracefully")
			} else {
				log.Printf("Server error: %v", err)
			}
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		log.Printf("Error during server shutdown: %v", err)
	}

	log.Println("Server shutdown complete")
}
