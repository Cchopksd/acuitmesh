package routes

import (
	"server/controllers"
	"server/gateway"
	"server/middlewares"
	"server/repositories"
	"server/services"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func TaskRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger, wsService *gateway.WebSocketService) {
	taskRepo := repositories.NewTaskRepository(db)
	taskBoardRepo := repositories.NewTaskBoardRepository(db)
	taskService := services.NewTaskService(taskRepo, taskBoardRepo, wsService, logger)
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
			taskGroup.DELETE("/:id", taskController.DeleteTask)
		}
	}

	router.GET("/ws", func(c *gin.Context) {
		wsService.HandleConnections(c.Writer, c.Request)
	})
}
