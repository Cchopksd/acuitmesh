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
	taskBoardService := services.NewTaskBoardService(taskBoardRepository, logger)
	taskBoardController := controllers.NewTaskBoardController(taskBoardService, logger)

	taskBoardGroup := router.Group("/task-boards")
	{
		protected := taskBoardGroup.Group("")
		protected.Use(
			middlewares.AuthMiddleware(logger),       
			middlewares.RequestLogger(logger),        
			middlewares.RateLimiter(100, time.Minute),
		)

		protected.GET("", taskBoardController.GetTaskBoardsByUserID)       
		protected.POST("", taskBoardController.CreateTaskBoard)           
		protected.GET("/:id", taskBoardController.GetTaskBoardByID)        
		protected.PUT("/:id", taskBoardController.UpdateTaskBoard)         
		protected.DELETE("/:id", taskBoardController.DeleteTaskBoard)      
		protected.POST("/:id/collaborators", taskBoardController.AddCollaborator) 
	}
}
