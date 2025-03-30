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

// Create TaskBoard
func (c *TaskBoardController) CreateTaskBoard(ctx *gin.Context) {
	var taskBoardDTO dto.TaskBoardRequest
	if err := ctx.ShouldBindJSON(&taskBoardDTO); err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid request data",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	taskBoard, err := c.taskBoardService.CreateTaskBoard(&taskBoardDTO)
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

// Get TaskBoard by ID
func (c *TaskBoardController) GetTaskBoardByID(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	taskBoard, err := c.taskBoardService.FindTaskBoardByID(id)
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

// Get TaskBoards by User ID
func (c *TaskBoardController) GetTaskBoardsByUserID(ctx *gin.Context) {
	userID, err := uuid.Parse(ctx.Param("userID"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	taskBoards, err := c.taskBoardService.FindTaskBoardByUserID(userID)
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
func (c *TaskBoardController) UpdateTaskBoard(ctx *gin.Context) {
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
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid request data",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	updatedTaskBoard, err := c.taskBoardService.UpdateTaskBoard(id, &taskBoardDTO)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to update TaskBoard",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
		Message: "TaskBoard updated successfully",
		Data:    updatedTaskBoard,
	})
}

// Delete TaskBoard
func (c *TaskBoardController) DeleteTaskBoard(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid UUID format",
		})
		return
	}

	if err := c.taskBoardService.DeleteTaskBoard(id); err != nil {
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

// Add Collaborator
func (c *TaskBoardController) AddCollaborator(ctx *gin.Context) {
	var addCollaboratorDTO dto.AddCollaborator
	if err := ctx.ShouldBindJSON(&addCollaboratorDTO); err != nil {
		ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Invalid request data",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	userTaskBoard, err := c.taskBoardService.AddCollaboratorOnTaskBoard(addCollaboratorDTO)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to add collaborator",
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
