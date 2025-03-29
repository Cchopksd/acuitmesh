package services

import (
	"fmt"
	"server/dto"
	"server/models"
	"server/repositories"
	"server/utils"

	"go.uber.org/zap"
)

type ConflictError struct {
	message string
}

func (e *ConflictError) Error() string {
	return e.message
}

type UserService interface {
	CreateUser(userDTO *dto.CreateUserRequest) (*models.User, error)
	FindAllUsers() ([]models.User, error)
}

type UserServiceImpl struct {
	userRepo repositories.UserRepository
	logger   *zap.Logger
}

func NewUserService(userRepo repositories.UserRepository, logger *zap.Logger) UserService {
	return &UserServiceImpl{
		userRepo: userRepo,
		logger:   logger,
	}
}

func (service *UserServiceImpl) CreateUser(userDTO *dto.CreateUserRequest) (*models.User, error) {	
	// ==== Validate email format ====
	existingUser, err := service.userRepo.FindByEmail(userDTO.Email)
	if err != nil {
		service.logger.Error("Database error checking email", zap.Error(err))
		return nil, fmt.Errorf("database error")
	}
	
	if existingUser != nil {
		return nil, &ConflictError{message: fmt.Sprintf("email %s already registered", userDTO.Email)}
	}
	
	// ==== Hash password ====
	hashedPassword, err := utils.HashPassword(userDTO.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password")
	}

	user := models.User{
		Name:     userDTO.Name,
		Email:    userDTO.Email,
		Password: hashedPassword,
	}

	if err := service.userRepo.Create(&user); err != nil {
		service.logger.Error("Failed to create user", zap.Error(err))
		return nil, fmt.Errorf("failed to create user")
	}

	return &user, nil
}

func (service *UserServiceImpl) FindAllUsers() ([]models.User, error) {
	users, err := service.userRepo.FindAll()
	if err != nil {
		service.logger.Error("Error fetching users", zap.Error(err))
		return nil, fmt.Errorf("error fetching users")
	}

	return users, nil
}