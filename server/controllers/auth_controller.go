package controllers

import (
	"net/http"
	"server/dto"
	"server/helpers"
	"server/services"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AuthController struct {
	authService services.AuthService
	logger      *zap.Logger
}

func NewAuthController(authService services.AuthService, logger *zap.Logger) *AuthController {
	return &AuthController{
		authService: authService,
		logger:      logger,
	}
}

// Login handles user authentication
func (c *AuthController) Login(ctx *gin.Context) {
    var loginDTO dto.LoginRequest

    if err := ctx.ShouldBindJSON(&loginDTO); err != nil {
        c.logger.Warn("Invalid login request", zap.Error(err))
        ctx.JSON(http.StatusBadRequest, helpers.ErrorResponse{
            Message: "Invalid request format",
            Details:  helpers.FormatValidationError(err),
        })
        return
    }

    token, err := c.authService.Login(loginDTO.Email, loginDTO.Password)
    if err != nil {
        c.logger.Info("Login failed", 
            zap.String("email", loginDTO.Email),
            zap.Error(err))
        ctx.JSON(http.StatusUnauthorized, helpers.ErrorResponse{
            Message: "Authentication failed",
        })
        return
    }

    ctx.JSON(http.StatusOK, helpers.SuccessResponse{
		Code:    http.StatusOK,
        Message: "Login successful",
        Data:    gin.H{"token": token},
    })
}
