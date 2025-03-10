// Package main provides a utility to get the database path for migrations
package main

import (
	"fmt"
	"strings"

	"github.com/epuerta9/prompts.kitchenai/db"
)

func main() {
	// Get the data source name
	dsn := db.DefaultDataSourceName()

	// If it's a file DSN, extract the file path
	if strings.HasPrefix(dsn, "file:") {
		// Remove the file: prefix
		dsn = strings.TrimPrefix(dsn, "file:")

		// Remove any query parameters
		if idx := strings.IndexByte(dsn, '?'); idx != -1 {
			dsn = dsn[:idx]
		}
	}

	// Print the DSN
	fmt.Print(dsn)
}
