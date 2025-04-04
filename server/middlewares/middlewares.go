package middlewares

import (
	"fmt"
	"net/http"
	"server/services"
	"server/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Middleware = gin.HandlerFunc

func RequestLogger(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// Process request
		c.Next()
		
		duration := time.Since(start)
		
		logger.Info("request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("duration", duration),
			zap.String("client_ip", c.ClientIP()),
		)
	}
}

func AuthMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			logger.Warn("Missing authorization token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			return
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		claims, err := utils.ValidateJWTToken(tokenString)
		if err != nil {
			logger.Warn("Invalid token", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		c.Set("userID", claims.ID)
		c.Next()
	}
}

func HasPermission(permission string, taskBoardService services.TaskBoardService, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		taskBoardID := c.Param("id")
		userID := c.GetString("userID") 
		fmt.Println("userID", userID)
		taskBoardUUID, err := uuid.Parse(taskBoardID)
		if err != nil {
			logger.Error("Invalid task board ID", zap.Error(err))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task board ID"})
			c.Abort()
			return
		}

		userUUID, err := uuid.Parse(userID)
		if err != nil {
			logger.Error("Invalid user ID", zap.Error(err))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			c.Abort()
			return
		}

		userTaskBoard, err := taskBoardService.CheckUserRole(taskBoardUUID, userUUID)
		if err != nil {
			logger.Error("Error fetching user role", zap.Error(err))
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		if !hasRequiredPermission(userTaskBoard.Role, permission) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func hasRequiredPermission(userRole, requiredRole string) bool {
	roleHierarchy := map[string]int{
		"viewer": 1,
		"editor": 2,
		"owner":  3,
	}

	return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

func RateLimiter(limit int, window time.Duration) gin.HandlerFunc {
	limiter := make(map[string]struct {
		count    int
		lastSeen time.Time
	})
	
	return func(c *gin.Context) {
		ip := c.ClientIP()
		
		// Clean up old entries
		for k, v := range limiter {
			if time.Since(v.lastSeen) > window {
				delete(limiter, k)
			}
		}
		
		if entry, exists := limiter[ip]; exists {
			if entry.count >= limit {
				c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
					"error": "Too many requests",
				})
				return
			}
			entry.count++
			entry.lastSeen = time.Now()
			limiter[ip] = entry
		} else {
			limiter[ip] = struct {
				count    int
				lastSeen time.Time
			}{count: 1, lastSeen: time.Now()}
		}
		
		c.Next()
	}
}