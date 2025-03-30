package services

import (
	"server/dto"
	"server/models"
	"server/repositories"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TaskBoardService interface {
	CreateTaskBoard(taskBoardDTO *dto.TaskBoardRequest) (*models.TaskBoard, error)
	FindTaskBoardByID(taskBoardID uuid.UUID) (*models.TaskBoard, error)
	FindTaskBoardByUserID(userID uuid.UUID) ([]models.TaskBoard, error)
	UpdateTaskBoard(taskID uuid.UUID, taskDTO *dto.TaskBoardRequest) (*models.TaskBoard, error)
	DeleteTaskBoard(taskBoardID uuid.UUID) error
	AddCollaboratorOnTaskBoard(addCollaboratorDTO dto.AddCollaborator) (*models.UserTaskBoard, error)
}

type TaskBoardServiceImpl struct {
	taskBoardRepo repositories.TaskBoardRepository
	logger   *zap.Logger
}

func NewTaskBoardService(taskBoardRepo repositories.TaskBoardRepository, logger *zap.Logger) *TaskBoardServiceImpl {
	return &TaskBoardServiceImpl{
		taskBoardRepo: taskBoardRepo,
		logger:   logger,
	}
}

func (service *TaskBoardServiceImpl) CreateTaskBoard(taskBoardDTO *dto.TaskBoardRequest) (*models.TaskBoard, error){
	taskBoard := &models.TaskBoard{
		Title: taskBoardDTO.Title,
		Description: taskBoardDTO.Description,
	}

	err := service.taskBoardRepo.Create(taskBoard)
	if err != nil {
		return nil, err
	}
	return taskBoard, nil
}

func (service *TaskBoardServiceImpl) FindTaskBoardByID(taskBoardID uuid.UUID) (*models.TaskBoard ,error){
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
	if _, err := service.taskBoardRepo.FindByID(addCollaboratorDTO.TaskBoardID); err != nil {
		return nil, err
	}

	return service.taskBoardRepo.AddCollaborator(addCollaboratorDTO)
}