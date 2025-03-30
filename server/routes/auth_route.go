package routes

import (
	"server/controllers"
	"server/middlewares"
	"server/repositories"
	"server/services"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func AuthRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger) {
    userRepository := repositories.NewUserRepository(db)
    authService := services.NewAuthService(userRepository, logger)
    authController := controllers.NewAuthController(authService, logger)

    authGroup := router.Group("/auth")
    {
        authGroup.Use(
            middlewares.RequestLogger(logger),
            middlewares.RateLimiter(100, time.Minute),
        )
        authGroup.POST("/login", authController.Login)
    }
}
