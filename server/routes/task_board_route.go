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

func TaskBoardRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger) {
	taskBoardRepository := repositories.NewTaskBoardRepository(db)
	userRepository := repositories.NewUserRepository(db)
	taskBoardService := services.NewTaskBoardService(taskBoardRepository, logger, userRepository)
	taskBoardController := controllers.NewTaskBoardController(taskBoardService, logger)

	taskBoardGroup := router.Group("/task-boards")
	{
		protected := taskBoardGroup.Group("")
		protected.Use(
			middlewares.AuthMiddleware(logger),       
			middlewares.RequestLogger(logger),        
			middlewares.RateLimiter(100, time.Minute),
		)
		{
			protected.POST("", taskBoardController.CreateTaskBoard)           
			protected.GET("/:id", taskBoardController.GetTaskBoardByID)        
			protected.GET("/user/:user_id", taskBoardController.GetTaskBoardsByUserID)       
			protected.PUT("/:id", taskBoardController.UpdateTaskBoard)         
			protected.DELETE("/:id", taskBoardController.DeleteTaskBoard)      
			protected.POST("/:id/collaborators", taskBoardController.AddCollaborator) 
			protected.GET("/:id/collaborators", taskBoardController.GetCollaboratorOnTaskBoard) 
		}
	}
}
