package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/epuerta9/prompts.kitchenai/db"
	"github.com/epuerta9/prompts.kitchenai/internal/api/handler"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// Run starts the server and blocks until it's shut down
func Run() error {
	// Initialize database
	sqlDB, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		return err
	}

	// Run migrations
	if err := db.RunMigrations(sqlDB); err != nil {
		sqlDB.Close()
		return err
	}

	// Create store
	store := db.NewStore(sqlDB)
	defer store.Close()

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Setup routes
	h := handler.NewHandler(store)

	// Register routes
	api := e.Group("/api")
	api.GET("/prompts", h.GetPrompts)
	api.POST("/prompts", h.CreatePrompt)
	api.GET("/prompts/:id", h.GetPrompt)
	api.PUT("/prompts/:id", h.UpdatePrompt)
	api.DELETE("/prompts/:id", h.DeletePrompt)
	api.GET("/prompts/:id/versions", h.GetVersions)
	api.POST("/prompts/:id/versions", h.CreateVersion)
	api.GET("/prompts/:id/versions/:version", h.GetVersion)
	api.GET("/prompts/:id/comments", h.GetComments)
	api.POST("/prompts/:id/comments", h.AddComment)
	api.GET("/prompts/:id/versions/:version/evals", h.GetEvaluations)
	api.POST("/prompts/:id/versions/:version/eval", h.CreateEvaluation)
	api.POST("/run", h.RunPrompt)

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
	return nil
}
