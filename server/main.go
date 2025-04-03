package main

import (
	"net/http"
	"os"
	"os/signal"
	config "server/configs"
	"server/routes"
	"server/websocket"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"
)

func main() {
	// Initialize loggers
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.InfoLevel)

	zapLogger, err := zap.NewProduction()
	if err != nil {
		logger.Fatal("Failed to initialize zap logger: ", err)
	}
	defer zapLogger.Sync()

	// Initialize database
	config.Connect()
	config.AutoMigrate()

	// Create Gin router
	r := gin.Default()
	r.Use(gin.Recovery())
	r.SetTrustedProxies(nil)


	// ✅ สร้าง WebSocket Service
	wsService := websocket.NewWebSocketService()

	// Setup routes
	apiGroup := r.Group("/api")
	{
		routes.UserRoutes(apiGroup, config.DB, zapLogger)
		routes.AuthRoutes(apiGroup, config.DB, zapLogger)
		routes.TaskBoardRoutes(apiGroup, config.DB, zapLogger)
		routes.TaskRoutes(apiGroup, config.DB, zapLogger, wsService)
	}

	// Start HTTP server
	server := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		logger.Info("Starting server on port 8080...")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Error running the server: ", err)
		}
	}()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("Shutting down server...")

	logger.Info("Server stopped.")
}