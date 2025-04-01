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

func TaskRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger) {
	taskRepository := repositories.NewTaskRepository(db)
	taskBoardRepository := repositories.NewTaskBoardRepository(db)
	taskService := services.NewTaskService(taskRepository, logger, taskBoardRepository)
	taskController := controllers.NewTaskController(taskService, logger)

	taskGroup := router.Group("/tasks")
	{
		protected := taskGroup.Group("")
		protected.Use(
			middlewares.AuthMiddleware(logger),       
			middlewares.RequestLogger(logger),        
			middlewares.RateLimiter(100, time.Minute),
		)
		{
			taskGroup.POST("/", taskController.CreateTask)
			taskGroup.GET("/:id", taskController.GetTaskByID)
			taskGroup.PUT("/:id", taskController.UpdateTask)
			taskGroup.DELETE("/:id/task_board_id/:id/user_id/:id", taskController.DeleteTask)
		}
	}
}
