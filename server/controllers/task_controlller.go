package controllers

import (
	"net/http"
	"server/dto"
	"server/helpers"
	"server/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TaskController struct {
	taskService services.TaskService
	logger      *zap.Logger
}

func NewTaskController(taskService services.TaskService, logger *zap.Logger) *TaskController {
	return &TaskController{
		taskService: taskService,
		logger:      logger,
	}
}

func (c *TaskController) CreateTask(ctx *gin.Context) {
	var taskDTO dto.AssignTask

	if err := ctx.ShouldBindJSON(&taskDTO); err != nil {
		validationErrors := helpers.FormatValidationError(err)

		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Validation failed",
			Details: validationErrors,
		})
		return
	}

	task, err := c.taskService.CreateTask(&taskDTO)
	if err != nil {
		c.logger.Error("Failed to create task", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create task",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusCreated, helpers.SuccessResponse{
		Code:    http.StatusCreated,
		Message: "Task created successfully",
		Data:    task,
	})
}

func (c *TaskController) GetTaskByID(ctx *gin.Context) {
	taskIDStr := ctx.Param("id")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		c.logger.Error("Invalid task ID", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid task ID",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	task, err := c.taskService.FindTaskByID(taskID)
	if err != nil {
		c.logger.Error("Failed to get task", zap.Error(err))
		ctx.JSON(http.StatusNotFound, helpers.ErrorResponse{
			Code:    http.StatusNotFound,
			Message: "Failed to get task",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "Task retrieved successfully",
		Data:    task,
	})
}

func (c *TaskController) UpdateTask(ctx *gin.Context) {
	taskIDStr := ctx.Param("id")
	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		c.logger.Error("Invalid task ID", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid task ID",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	var taskDTO dto.UpdateTaskRequest
	if err := ctx.ShouldBindJSON(&taskDTO); err != nil {
		validationErrors := helpers.FormatValidationError(err)
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Validation failed",
			Details: validationErrors,
		})
		return
	}

	updatedTask, err := c.taskService.UpdateTask(taskID, &taskDTO)
	if err != nil {
		c.logger.Error("Failed to update task", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to update task",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "Task updated successfully",
		Data:    updatedTask,
	})
}

func (c *TaskController) DeleteTask(ctx *gin.Context) {
	taskIDStr := ctx.Param("id")
	userIDStr := ctx.Param("user_id")

	taskID, err := uuid.Parse(taskIDStr)
	if err != nil {
		c.logger.Error("Invalid task ID", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid task ID",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.logger.Error("Invalid user ID", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid user ID",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	err = c.taskService.DeleteTask(taskID, userID)
	if err != nil {
		c.logger.Error("Failed to delete task", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to delete task",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "Task deleted successfully",
	})
}
