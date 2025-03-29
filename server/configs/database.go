package config

import (
	"fmt"
	"log"
	"os"
	"server/models"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"
)

// Global DB variable
var DB *gorm.DB
var Err error

func Connect() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Get database URL from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Open connection to the database
	DB, Err = gorm.Open("postgres", databaseURL)
	if Err != nil {
		log.Fatal("Failed to connect to the database:", Err)
	} else {
		fmt.Println("Database connection successful")
	}
}

func AutoMigrate() {
	fmt.Println("Running AutoMigrate...")
	DB.AutoMigrate(&models.User{})
	fmt.Println("AutoMigrate completed")
}