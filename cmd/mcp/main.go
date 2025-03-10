package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"time"

	"github.com/epuerta9/prompts.kitchenai/internal/prompt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Get user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatalf("Failed to get user home directory: %v", err)
	}

	// Setup config directory
	configDir := filepath.Join(homeDir, ".kitchenai")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		log.Fatalf("Failed to create config directory: %v", err)
	}

	// Initialize prompt client
	client := prompt.NewClient("https://api.kitchenai.com")

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Routes
	e.GET("/prompts", func(c echo.Context) error {
		prompts, err := client.ListPrompts()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, prompts)
	})

	e.GET("/prompts/:id", func(c echo.Context) error {
		id := c.Param("id")
		prompt, err := client.GetPrompt(id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, prompt)
	})

	e.GET("/prompts/:id/versions", func(c echo.Context) error {
		id := c.Param("id")
		versions, err := client.ListPromptVersions(id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, versions)
	})

	e.GET("/prompts/:id/versions/:version", func(c echo.Context) error {
		id := c.Param("id")
		version := c.Param("version")
		prompt, err := client.GetPromptVersion(id, version)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, prompt)
	})

	e.POST("/prompts/:id/comments", func(c echo.Context) error {
		id := c.Param("id")
		var comment prompt.Comment
		if err := c.Bind(&comment); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		err := client.AddComment(id, comment)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusCreated, map[string]string{"status": "comment added"})
	})

	e.POST("/prompts/:id/versions/:version/integrate", func(c echo.Context) error {
		id := c.Param("id")
		version := c.Param("version")
		var request prompt.IntegrationRequest
		if err := c.Bind(&request); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		result, err := client.IntegratePrompt(id, version, request.FilePath)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, result)
	})

	// Serve static files for local UI
	e.Static("/", "frontend/build")
	e.GET("/*", func(c echo.Context) error {
		return c.File("frontend/build/index.html")
	})

	// Start server
	go func() {
		if err := e.Start(":8081"); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("shutting down the server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
}
