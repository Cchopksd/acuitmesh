package services

import (
	"fmt"
	"server/dto"
	"server/models"
	"server/repositories"
	"server/websocket"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type TaskService interface {
	CreateTask(taskDTO *dto.AssignTask) (*models.Task, error)
	FindTaskByID(taskID uuid.UUID) (*models.Task, error)
	UpdateTask(taskID uuid.UUID, taskDTO *dto.UpdateTaskRequest) (*models.Task, error)
	DeleteTask(taskID uuid.UUID, userID uuid.UUID) error
}

type TaskServiceImpl struct {
	taskRepo      repositories.TaskRepository
	taskBoardRepo repositories.TaskBoardRepository
	wsService     *websocket.WebSocketService
	logger        *zap.Logger
}

// FindTaskByID implements TaskService.
func (service *TaskServiceImpl) FindTaskByID(taskID uuid.UUID) (*models.Task, error) {
	panic("unimplemented")
}

func NewTaskService(
	taskRepo repositories.TaskRepository,
	taskBoardRepo repositories.TaskBoardRepository,
	wsService *websocket.WebSocketService,
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
	}

	taskResponse, err := service.taskRepo.Create(task)
	if err != nil {
		return nil, err
	}

	// ✅ ส่งข้อมูลไปยัง WebSocket เมื่อมีการสร้าง Task ใหม่
	service.wsService.Broadcast("create", taskResponse)

	return taskResponse, nil
}

func (service *TaskServiceImpl) UpdateTask(taskID uuid.UUID, taskDTO *dto.UpdateTaskRequest) (*models.Task, error) {
	task, err := service.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}

	task.Title = taskDTO.Title
	task.Status = taskDTO.Status

	updatedTask, err := service.taskRepo.Update(taskID, task)
	if err != nil {
		return nil, err
	}

	// ✅ บรอดแคสต์ Task ที่อัปเดตให้ทุก Client
	service.wsService.Broadcast("update", updatedTask)

	return updatedTask, nil
}

func (service *TaskServiceImpl) 	DeleteTask(taskID uuid.UUID, userID uuid.UUID) error {
	if err := service.taskRepo.Delete(taskID); err != nil {
		return fmt.Errorf("failed to delete task with ID %s: %w", taskID, err)
	}

	// ✅ บรอดแคสต์การลบ Task ให้ทุก Client
	service.wsService.Broadcast("delete", taskID)

	return nil
}
