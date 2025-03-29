package routes

import (
	"server/controllers"
	"server/middlewares"
	"server/repositories"
	"server/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

func UserRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger) {
	// Initialize repositories, services, and controllers
	userRepository := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepository, logger)
	userController := controllers.NewUserController(userService, logger)

	// Define the user group
	userGroup := router.Group("/users")
	{
		// Public routes (for unauthenticated users)
		public := userGroup.Group("")
		public.Use(
			middlewares.RequestLogger(logger),
			middlewares.RateLimiter(100, time.Minute), // Limit the number of requests to 100 per minute
		)
		{
			// Route to create a user (public route)
			public.POST("", userController.CreateUser)
		}

		// Protected routes (requires authentication)
		protected := userGroup.Group("")
		protected.Use(
			middlewares.AuthMiddleware(logger),      // Authentication middleware
			middlewares.RequestLogger(logger),       // Logging middleware
			middlewares.RateLimiter(100, time.Minute), // Rate limiting
		)
		{
			// Route to get all users (protected route)
			protected.GET("", userController.GetAllUsers)

			// Define other protected routes (e.g., get, update, delete for a single user)
			// protected.GET("/:id", userController.GetUserByID)        // Get a specific user by ID
			// protected.PUT("/:id", userController.UpdateUser)         // Update user by ID
			// protected.DELETE("/:id", userController.DeleteUser)      // Delete user by ID
		}
	}
}
