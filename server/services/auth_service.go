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
	if email == "" || password == "" {
		return "", fmt.Errorf("email and password are required")
	}

	user, err := s.userRepo.FindByEmail(email)

	if err != nil {
		s.logger.Warn("Failed to find user by email", zap.String("email", email), zap.Error(err))
		return "", fmt.Errorf("email or password is incorrect")
	}

	passwordMatch := utils.VerifyPassword(user.Password, password)
	
	if !passwordMatch {
		return "", fmt.Errorf("email or password is incorrect")
	}

	token, err := utils.CreateToken(utils.User{
		ID:    user.ID.String(),
		Name:  user.Name,
		Email: user.Email,
	})
	if err != nil {
		s.logger.Error("Failed to generate token", zap.String("userID", user.ID.String()), zap.Error(err))
		return "", fmt.Errorf("authentication failed")
	}

	s.logger.Info("User logged in successfully", zap.String("email", email))

	return token, nil
}
