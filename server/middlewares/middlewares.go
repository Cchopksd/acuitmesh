package middlewares

import (
	"net/http"
	"server/utils"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// Middleware is a type alias for gin.HandlerFunc to make it clearer
type Middleware = gin.HandlerFunc

// RequestLogger logs incoming requests
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

// ErrorHandler handles panics and errors
func ErrorHandler(logger *zap.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                logger.Error("panic recovered",
                    zap.Any("error", err),
                    zap.String("path", c.Request.URL.Path),
                )
                
                c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
                    "error": "Internal Server Error",
                })
            }
        }()
        
        c.Next()
        
        // Check if there were any errors
        if len(c.Errors) > 0 {
            // Convert gin.ErrorMsgs to []error
            errs := make([]error, len(c.Errors))
            for i, e := range c.Errors {
                errs[i] = e.Err
            }
            
            logger.Error("request errors",
                zap.Errors("errors", errs),
            )
            
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
                "errors": c.Errors.Errors(), // Use Errors() method to get string slice
            })
        }
    }
}

func AuthMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the token from the Authorization header (e.g., "Bearer <token>")
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			logger.Warn("Missing authorization token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			return
		}

		// Remove the "Bearer " prefix, if present
		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		// Validate the token
		claims, err := utils.ValidateJWTToken(tokenString)
		if err != nil {
			logger.Warn("Invalid token", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Add the claims to the Gin context (for use in subsequent handlers)
		c.Set("userID", claims.ID)

		// Proceed with the next handler
		c.Next()
	}
}

// RateLimiter limits requests per IP
func RateLimiter(limit int, window time.Duration) gin.HandlerFunc {
	// In production, use something like Redis for distributed systems
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
		
		// Check rate limit
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

// CORS middleware
func CORS(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		allowed := false
		for _, o := range allowedOrigins {
			if o == "*" || o == origin {
				allowed = true
				break
			}
		}
		
		if allowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
			
			if c.Request.Method == "OPTIONS" {
				c.AbortWithStatus(204)
				return
			}
		}
		
		c.Next()
	}
}