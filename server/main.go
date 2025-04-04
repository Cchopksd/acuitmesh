package main

import (
	"net/http"
	"os"
	"os/signal"
	config "server/configs"
	"server/gateway"
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

	zapLogger, err := zap.NewProduction()
	if err != nil {
		logger.Fatal("Failed to initialize zap logger: ", err)
	}
	defer zapLogger.Sync()

	config.Connect()
	config.AutoMigrate()

	r := gin.Default()
	r.Use(gin.Recovery())
	r.SetTrustedProxies(nil)

	wsService := gateway.NewWebSocketService()

	apiGroup := r.Group("/api")
	{
		routes.UserRoutes(apiGroup, config.DB, zapLogger)
		routes.AuthRoutes(apiGroup, config.DB, zapLogger)
		routes.TaskBoardRoutes(apiGroup, config.DB, zapLogger)
		routes.TaskRoutes(apiGroup, config.DB, zapLogger, wsService)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":"+port,
		Handler: r,
	}

	go func() {
		logger.Info("Starting server on port " + port + "...")		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Error running the server: ", err)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("Shutting down server...")

	logger.Info("Server stopped.")
}