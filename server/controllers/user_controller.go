package controllers

import (
	"net/http"
	"server/dto"
	"server/helpers"
	"server/services"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserController struct {
	userService services.UserService
	logger      *zap.Logger
}

func NewUserController(userService services.UserService, logger *zap.Logger) *UserController {
	return &UserController{
		userService: userService,
		logger:      logger,
	}
}

func (controller *UserController) CreateUser(c *gin.Context) {
	var userDTO dto.CreateUserRequest

	if err := c.ShouldBindJSON(&userDTO); err != nil {
		validationErrors := helpers.FormatValidationError(err)
		controller.logger.Warn("Validation failed", zap.Error(err))
		
		c.JSON(http.StatusBadRequest, helpers.ErrorResponse{
			Code:    http.StatusBadRequest,
			Message: "Validation failed",
			Details: validationErrors,
		})
		return
	}

	user, err := controller.userService.CreateUser(&userDTO)
	if err != nil {
		controller.logger.Error("Error creating user", zap.Error(err))
		
		statusCode := http.StatusBadRequest
		if _, ok := err.(*services.ConflictError); ok {
			statusCode = http.StatusConflict
		}
		
		c.JSON(statusCode, helpers.ErrorResponse{
			Code:    statusCode,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, helpers.SuccessResponse{
		Code:    http.StatusCreated,
		Message: "User created successfully",
		Data:    user,
	})
}

func (controller *UserController) GetAllUsers(c *gin.Context) {
	users, err := controller.userService.FindAllUsers()
	if err != nil {
		controller.logger.Error("Error fetching users", zap.Error(err))
		
		c.JSON(http.StatusInternalServerError, helpers.ErrorResponse{
			Code:    http.StatusInternalServerError,
			Message: "Failed to fetch users",
			Details: map[string]string{"error": err.Error()},
		})
		return
	}

	if len(users) == 0 {
		c.JSON(http.StatusOK, helpers.SuccessResponse{
			Message: "No users found",
			Data:    []interface{}{},
		})
		return
	}

	c.JSON(http.StatusOK, helpers.SuccessResponse{
		Message: "Users fetched successfully",
		Data:    users,
	})
}