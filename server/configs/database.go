package config

import (
	"fmt"
	"log"
	"os"
	"server/models"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Global DB variable
var DB *gorm.DB

// Connect establishes a connection to the PostgreSQL database
func Connect() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file. Using environment variables instead")
	}

	// Get database URL from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Configure GORM logger for better debugging
	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,  // Slow SQL threshold
			LogLevel:                  logger.Error, // Log level (change to logger.Info for more verbose output)
			IgnoreRecordNotFoundError: true,         // Ignore ErrRecordNotFound error for logger
			Colorful:                  true,         // Enable color
		},
	)

	// Open connection to the database with custom configuration
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: gormLogger,
		NowFunc: func() time.Time {
			return time.Now().UTC() 
		},
	})
	
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	} else {
		fmt.Println("Database connection successful")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get SQL DB object:", err)
	}
	
	sqlDB.SetMaxIdleConns(10)            
	sqlDB.SetMaxOpenConns(100)           
	sqlDB.SetConnMaxLifetime(time.Hour)  
}

func AutoMigrate() {
	fmt.Println("Running AutoMigrate...")

	// Enable uuid-ossp extension for PostgreSQL
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";").Error; err != nil {
		log.Fatalf("Error creating uuid-ossp extension: %v", err)
	}

	// Migrate all models at once
	if err := DB.AutoMigrate(
		&models.User{},
		&models.TaskBoard{},
		&models.UserTaskBoard{},
		&models.Task{},
	); err != nil {
		log.Fatalf("Error migrating models: %v", err)
	}

	fmt.Println("AutoMigrate completed successfully")
}