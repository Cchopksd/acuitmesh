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
			middlewares.RateLimiter(50, time.Minute), // ลด rate limit สำหรับ public
		)
		{
			// Route to register a new user
			public.POST("/register", userController.CreateUser)
		}

		// Protected routes (requires authentication)
		protected := userGroup.Group("")
		protected.Use(
			middlewares.AuthMiddleware(logger),      // Authentication middleware
			middlewares.RequestLogger(logger),       // Logging middleware
			middlewares.RateLimiter(100, time.Minute), // Rate limiting (protected route มี limit สูงกว่า)
		)
		{
			// Route to get all users
			protected.GET("", userController.GetAllUsers)

			// Other protected routes
			// protected.GET("/:id", userController.GetUserByID)   // Get a specific user by ID
			// protected.PUT("/:id", userController.UpdateUser)    // Update user by ID
			// protected.DELETE("/:id", userController.DeleteUser) // Delete user by ID
		}
	}
}
