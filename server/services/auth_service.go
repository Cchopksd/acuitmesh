package services

import (
	"fmt"
	"server/repositories"
	"server/utils"

	"go.uber.org/zap"
)

type AuthService interface {
	Login(email, password string) (string, error)
}

type AuthServiceImpl struct {
	userRepo repositories.UserRepository
	logger   *zap.Logger
}

func NewAuthService(userRepo repositories.UserRepository, logger *zap.Logger) AuthService {
	return &AuthServiceImpl{
		userRepo: userRepo,
		logger:   logger,
	}
}

func (s *AuthServiceImpl) Login(email, password string) (string, error) {
	// Check if email or password is empty
	if email == "" || password == "" {
		return "", fmt.Errorf("email and password are required")
	}

	// Find user by email
	user, err := s.userRepo.FindByEmail(email)

	if err != nil {
		s.logger.Warn("Failed to find user by email", zap.String("email", email), zap.Error(err))
		return "", fmt.Errorf("authentication failed")
	}

	if user == nil {
		return "", fmt.Errorf("email or password is incorrect")
	}

	// Verify password
	passwordMatch := utils.VerifyPassword(user.Password, password)
	fmt.Println("Password Match:", passwordMatch)
	if !passwordMatch {
		return "", fmt.Errorf("email or password is incorrect")
	}

	// Generate JWT token
	token, err := utils.CreateToken(utils.User{
		ID:    user.UID.String(),
		Name:  user.Name,
		Email: user.Email,
	})
	if err != nil {
		s.logger.Error("Failed to generate token", zap.String("userID", user.UID.String()), zap.Error(err))
		return "", fmt.Errorf("authentication failed")
	}

	// Successfully generated token
	s.logger.Info("User logged in successfully", zap.String("email", email))

	return token, nil
}
