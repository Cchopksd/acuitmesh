package main

import (
	"os"
	"os/signal"
	config "server/configs"
	"server/routes"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"go.uber.org/zap"
)

func main() {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.InfoLevel)

	config.Connect()
    config.AutoMigrate()

	r := gin.Default()

    r.Use(gin.Recovery())
    r.SetTrustedProxies(nil)


	zapLogger, err := zap.NewProduction()
	if err != nil {
		logger.Fatal("Failed to initialize zap logger: ", err)
	}
	defer zapLogger.Sync()

	apiGroup := r.Group("/api")
    {
        routes.UserRoutes(apiGroup, config.DB, zapLogger)
        routes.AuthRoutes(apiGroup, config.DB, zapLogger)
    }


	go func() {
		logger.Info("Starting server on port 8080...")
		if err := r.Run(":8080"); err != nil {
			logger.Fatal("Error running the server: ", err)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("Shutting down server...")

	logger.Info("Server stopped.")
}
