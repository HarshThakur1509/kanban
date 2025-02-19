package main

import (
	"kanban/internal/initializers"
	"kanban/internal/models"
	"log"
)

func init() {
	initializers.LoadEnv()
	initializers.ConnectDB()
}

func main() {

	log.Println("Starting database migrations...")

	err := initializers.DB.AutoMigrate(models.Column{}, models.Task{})
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Create default columns if they don't exist
	createDefaultColumns()

	log.Println("Database migrations completed successfully!")
}

func createDefaultColumns() {
	defaultColumns := []models.Column{
		{Name: "To Do"},
		{Name: "In Progress"},
		{Name: "Done"},
	}

	for _, column := range defaultColumns {
		result := initializers.DB.FirstOrCreate(&column, models.Column{Name: column.Name})
		if result.Error != nil {
			log.Fatalf("Failed to create default column: %v", result.Error)
		}
	}
}
