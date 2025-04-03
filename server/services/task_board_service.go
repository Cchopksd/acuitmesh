package services

import (
	"fmt"
	"server/dto"
	"server/models"
	"server/repositories"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TaskBoardService interface {
	CreateTaskBoard(taskBoardDTO *dto.TaskBoardRequest) (*models.UserTaskBoard, error)
	FindTaskBoardByIDExtendTasks(taskBoardID uuid.UUID) (*models.TaskBoard, error)
	FindTaskBoardByUserID(userID uuid.UUID) ([]models.TaskBoard, error)
	UpdateTaskBoard(taskID uuid.UUID, taskDTO *dto.TaskBoardRequest) (*models.TaskBoard, error)
	DeleteTaskBoard(taskBoardID uuid.UUID) error
	AddCollaboratorOnTaskBoard(addCollaboratorDTO dto.AddCollaborator) (*models.UserTaskBoard, error)
	GetCollaboratorOnTaskBoard(taskBoardID uuid.UUID) ([]models.UserTaskBoard, error)
	CheckUserRole(taskBoardID uuid.UUID, userID uuid.UUID) (*models.UserTaskBoard, error)
}

type TaskBoardServiceImpl struct {
	taskBoardRepo repositories.TaskBoardRepository
	userRepo      repositories.UserRepository
	logger   *zap.Logger
}

func NewTaskBoardService(taskBoardRepo repositories.TaskBoardRepository, logger *zap.Logger, userRepo repositories.UserRepository) *TaskBoardServiceImpl {
	return &TaskBoardServiceImpl{
		taskBoardRepo: taskBoardRepo,
		userRepo:      userRepo,
		logger:   logger,
	}
}

func (service *TaskBoardServiceImpl) CreateTaskBoard(taskBoardDTO *dto.TaskBoardRequest) (*models.UserTaskBoard, error) {
	userID, err := uuid.Parse(taskBoardDTO.User)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID format")
	}
	
	if _, err := service.userRepo.GetUserByID(userID); err != nil {
		service.logger.Error("User not found", zap.Error(err))
		return nil, fmt.Errorf("user does not exist")
	}
	
	taskBoard := &models.TaskBoard{
		Title:       taskBoardDTO.Title,
		Description: taskBoardDTO.Description,
	}

	taskBoardResponse, err := service.taskBoardRepo.Create(taskBoard)
	if err != nil {
		service.logger.Error("Error creating task board", zap.Error(err))
		return nil, err
	}
	service.logger.Info("Task board created successfully", zap.String("taskBoardID", taskBoardResponse.ID.String()))

	userTaskBoard := &models.UserTaskBoard{
		UserID:      uuid.MustParse(taskBoardDTO.User),
		TaskBoardID: taskBoardResponse.ID,
		Role:        "owner", 
	}

	// Create the user-task board association
	userTaskBoardResponse, err := service.taskBoardRepo.CreateUserBoard(userTaskBoard)
	if err != nil {
		return nil, err
	}

	return userTaskBoardResponse, nil
}


func (service *TaskBoardServiceImpl) FindTaskBoardByIDExtendTasks(taskBoardID uuid.UUID) (*models.TaskBoard ,error){
	taskBoard, err := service.taskBoardRepo.FindByID(taskBoardID)

	if err != nil {
		return nil, err
	}
	return taskBoard, nil
}

func (service *TaskBoardServiceImpl) FindTaskBoardByUserID(userID uuid.UUID) ([]models.TaskBoard, error) {
	taskBoards, err := service.taskBoardRepo.FindByUserID(userID)

	if err != nil {
		return nil, err
	}
	return taskBoards, nil
}

func (service *TaskBoardServiceImpl) UpdateTaskBoard(taskID uuid.UUID, taskDTO *dto.TaskBoardRequest) (*models.TaskBoard, error) {
	taskBoards, err := service.taskBoardRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}

	taskBoards.Title = taskDTO.Title
	taskBoards.Description = taskDTO.Description

	updatedTaskBoard, err := service.taskBoardRepo.Update(taskID, taskBoards)
	if err != nil {
		return nil, err
	}
	return updatedTaskBoard, nil
}

func (service *TaskBoardServiceImpl) DeleteTaskBoard(taskBoardID uuid.UUID) error {
	return service.taskBoardRepo.Delete(taskBoardID)
}

func (service *TaskBoardServiceImpl) AddCollaboratorOnTaskBoard(addCollaboratorDTO dto.AddCollaborator) (*models.UserTaskBoard, error) {
	user, err := service.userRepo.FindByEmail(addCollaboratorDTO.Email)
	if err != nil {
		return nil, fmt.Errorf("error finding user: %v", err)
	}
	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	if _, err := service.taskBoardRepo.FindByID(addCollaboratorDTO.TaskBoardID); err != nil {
		return nil, fmt.Errorf("task board not found")
	}

	if _, err := service.taskBoardRepo.CheckUserRole(addCollaboratorDTO.TaskBoardID, user.ID); err == nil {
		return nil, fmt.Errorf("user already exists on this task board")
	}

	return service.taskBoardRepo.AddCollaborator(user.ID, addCollaboratorDTO.TaskBoardID, repositories.Role(addCollaboratorDTO.Role))
}

func (service *TaskBoardServiceImpl) CheckUserRole(taskBoardID uuid.UUID, userID uuid.UUID) (*models.UserTaskBoard, error) {
	userTaskBoard, err := service.taskBoardRepo.CheckUserRole(taskBoardID, userID)
	if err != nil {
		return nil, err
	}
	return userTaskBoard, nil
}

func (service *TaskBoardServiceImpl) GetCollaboratorOnTaskBoard(taskBoardID uuid.UUID) ([]models.UserTaskBoard, error) {
	users, err := service.taskBoardRepo.GetUsersOnTaskBoard(taskBoardID)
	if err != nil {
		return nil, err 
	}
	return users, nil 
}
