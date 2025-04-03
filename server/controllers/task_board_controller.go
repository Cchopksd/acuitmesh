package controllers

import (
	"fmt"
	"net/http"
	"server/dto"
	"server/helpers"
	"server/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TaskBoardController struct {
	taskBoardService services.TaskBoardService
	logger           *zap.Logger
}

func NewTaskBoardController(taskBoardService services.TaskBoardService, logger *zap.Logger) *TaskBoardController {
	return &TaskBoardController{
		taskBoardService: taskBoardService,
		logger:           logger,
	}
}

func (controller *TaskBoardController) CreateTaskBoard(ctx *gin.Context) {
	var taskBoardDTO dto.TaskBoardRequest

	if err := ctx.ShouldBindJSON(&taskBoardDTO); err != nil {
		validationErrors := helpers.FormatValidationError(err)
		controller.logger.Warn("Validation failed", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Validation failed",
			Details: validationErrors,
		})
		return
	}

	if _, err := uuid.Parse(taskBoardDTO.User); err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format for user",
		})
		return
	}

	taskBoard, err := controller.taskBoardService.CreateTaskBoard(&taskBoardDTO)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to create TaskBoard",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusCreated, helpers.SuccessResponse{
		Code:    http.StatusCreated,
		Message: "TaskBoard created successfully",
		Data:    taskBoard,
	})
}

func (controller *TaskBoardController) GetTaskBoardByID(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	taskBoard, err := controller.taskBoardService.FindTaskBoardByIDExtendTasks(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, helpers.ErrorResponse{
			Code:    http.StatusNotFound,
			Message: "TaskBoard not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "TaskBoard retrieved successfully",
		Data:    taskBoard,
	})
}

func (controller *TaskBoardController) GetTaskBoardsByUserID(ctx *gin.Context) {
	userID, err := uuid.Parse(ctx.Param("user_id"))
	fmt.Println(userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	taskBoards, err := controller.taskBoardService.FindTaskBoardByUserID(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to fetch TaskBoards",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "TaskBoards retrieved successfully",
		Data:    taskBoards,
	})
}

// Update TaskBoard
func (controller *TaskBoardController) UpdateTaskBoard(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	var taskBoardDTO dto.TaskBoardRequest
	if err := ctx.ShouldBindJSON(&taskBoardDTO); err != nil {
		validationErrors := helpers.FormatValidationError(err)

		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Validation failed",
			Details: validationErrors,
		})
		return
	}

	updatedTaskBoard, err := controller.taskBoardService.UpdateTaskBoard(id, &taskBoardDTO)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to update TaskBoard",
			Details: helpers.FormatValidationError(err),
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "TaskBoard updated successfully",
		Data:    updatedTaskBoard,
	})
}

func (controller *TaskBoardController) DeleteTaskBoard(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	if err := controller.taskBoardService.DeleteTaskBoard(id); err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to delete TaskBoard",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "TaskBoard deleted successfully",
	})
}

func (c *TaskBoardController) AddCollaborator(ctx *gin.Context) {
	var addCollaboratorDTO dto.AddCollaborator
	if err := ctx.ShouldBindJSON(&addCollaboratorDTO); err != nil {
		validationErrors := helpers.FormatValidationError(err)
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid input data",
			Details: validationErrors,
		})
		return
	}

	userTaskBoard, err := c.taskBoardService.AddCollaboratorOnTaskBoard(addCollaboratorDTO)
	if err != nil {
		c.logger.Error("Failed to add collaborator", zap.Error(err))
		var statusCode int
		var message string
		if err.Error() == "user not found" {
			statusCode = http.StatusNotFound
			message = "User not found"
		} else if err.Error() == "task board not found" {
			statusCode = http.StatusNotFound
			message = "Task board not found"
		} else if err.Error() == "user already exists on this task board" {
			statusCode = http.StatusConflict
			message = "User already part of this task board"
		} else {
			statusCode = http.StatusInternalServerError
			message = "Failed to add collaborator"
		}

		ctx.JSON(statusCode, helpers.ErrorResponse{
			Code:    statusCode,
			Message: message,
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "Collaborator added successfully",
		Data:    userTaskBoard,
	})
}

func (c *TaskBoardController) CheckUserRole(ctx *gin.Context) {
	taskBoardID, err := uuid.Parse(ctx.Param("id"))
	fmt.Print(taskBoardID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid task board ID",
		})
		return
	}

	userID, err := uuid.Parse(ctx.Param("user_id"))
	fmt.Print(userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid task board ID",
		})
		return
	}

	collaborator, err := c.taskBoardService.CheckUserRole(taskBoardID, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to retrieve collaborator",
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "Collaborator retrieved successfully",
		Data:    collaborator,
	})
}

func (c *TaskBoardController) GetCollaboratorOnTaskBoard(ctx *gin.Context) {
	taskBoardID, err := uuid.Parse(ctx.Param("id"))
	fmt.Print(taskBoardID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid task board ID",
		})
		return
	}

	collaborator, err := c.taskBoardService.GetCollaboratorOnTaskBoard(taskBoardID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to retrieve collaborator",
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "Collaborator retrieved successfully",
		Data:    collaborator,
	})
}
