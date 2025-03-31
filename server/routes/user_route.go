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

func UserRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger) {
	userRepository := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepository, logger)
	userController := controllers.NewUserController(userService, logger)

	userGroup := router.Group("/users")
	{
		
		public := userGroup.Group("")
		public.Use(
			middlewares.RequestLogger(logger),
			middlewares.RateLimiter(50, time.Minute), 
		)
		{
			public.POST("/register", userController.CreateUser)
		}
		protected := userGroup.Group("")
		protected.Use(
			middlewares.AuthMiddleware(logger),      
			middlewares.RequestLogger(logger),       
			middlewares.RateLimiter(100, time.Minute),
		)
		{
			protected.GET("", userController.GetAllUsers)
		}
	}
}
