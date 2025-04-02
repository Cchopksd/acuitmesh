package middlewares

import (
	"net/http"
	"server/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
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