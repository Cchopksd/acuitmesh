package services

import (
	"server/dto"
	"server/models"
	"server/repositories"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TaskService interface {
	CreateTask(taskDTO *dto.AssignTask) (*models.Task, error)
	FindTaskByID(taskID uuid.UUID) (*models.Task, error)
	UpdateTask(taskID uuid.UUID, taskDTO *dto.UpdateTaskRequest) (*models.Task, error)
	DeleteTask(taskID uuid.UUID) error
}

type TaskServiceImpl struct {
	taskRepo repositories.TaskRepository
	logger   *zap.Logger
}

func NewTaskService(taskRepo repositories.TaskRepository, logger *zap.Logger) *TaskServiceImpl {
	return &TaskServiceImpl{
		taskRepo: taskRepo,
		logger:   logger,
	}
}

func (service *TaskServiceImpl) CreateTask(taskDTO *dto.AssignTask) (*models.Task, error) {
	task := &models.Task{
		TaskBoardID: taskDTO.TaskBoardID,
		Title:       taskDTO.Title,
		Description: taskDTO.Description,
		Status:      taskDTO.Status,
		Priority:    taskDTO.Priority,
		StartDate:   taskDTO.StartDate,
		EndDate:     taskDTO.EndDate,
	}

	taskResponse, err := service.taskRepo.Create(task)
	if err != nil {
		return nil, err
	}
	return taskResponse, nil
}

func (service *TaskServiceImpl) FindTaskByID(taskID uuid.UUID) (*models.Task, error) {
	task, err := service.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (service *TaskServiceImpl) UpdateTask(taskID uuid.UUID, taskDTO *dto.UpdateTaskRequest) (*models.Task, error) {
	task, err := service.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}

	task.Title = taskDTO.Title
	task.Description = taskDTO.Description
	task.Status = taskDTO.Status
	task.Priority = taskDTO.Priority
	task.StartDate = taskDTO.StartDate
	task.EndDate = taskDTO.EndDate

	updatedTask, err := service.taskRepo.Update(taskID, task)
	if err != nil {
		return nil, err
	}
	return updatedTask, nil
}

func (service *TaskServiceImpl) DeleteTask(taskID uuid.UUID) error {
	return service.taskRepo.Delete(taskID)
}
