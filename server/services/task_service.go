package services

import (
	"fmt"
	"server/dto"
	"server/gateway"
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
	taskRepo      repositories.TaskRepository
	taskBoardRepo repositories.TaskBoardRepository
	wsService     *gateway.WebSocketService
	logger        *zap.Logger
}

func (service *TaskServiceImpl) FindTaskByID(taskID uuid.UUID) (*models.Task, error) {
	task, err := service.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}
	return task, nil
}


func NewTaskService(
	taskRepo repositories.TaskRepository,
	taskBoardRepo repositories.TaskBoardRepository,
	wsService *gateway.WebSocketService,
	logger *zap.Logger,
) *TaskServiceImpl {
	return &TaskServiceImpl{
		taskRepo:      taskRepo,
		taskBoardRepo: taskBoardRepo,
		wsService:     wsService,
		logger:        logger,
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

	service.wsService.Broadcast("create", taskResponse)

	return taskResponse, nil
}

func (service *TaskServiceImpl) UpdateTask(taskID uuid.UUID, taskDTO *dto.UpdateTaskRequest) (*models.Task, error) {
	task, err := service.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}

		task.TaskBoardID = taskDTO.TaskBoardID
		task.Title =       taskDTO.Title
		task.Description= taskDTO.Description
		task.Status =      taskDTO.Status
		task.Priority =  taskDTO.Priority
		task.StartDate =   taskDTO.StartDate
		task.EndDate =     taskDTO.EndDate

	updatedTask, err := service.taskRepo.Update(taskID, task)
	if err != nil {
		return nil, err
	}

	service.wsService.Broadcast("update", updatedTask)

	return updatedTask, nil
}

func (service *TaskServiceImpl) DeleteTask(taskID uuid.UUID) error {
	if err := service.taskRepo.Delete(taskID); err != nil {
		return fmt.Errorf("failed to delete task with ID %s: %w", taskID, err)
	}

	service.wsService.Broadcast("delete", taskID)

	return nil
}
