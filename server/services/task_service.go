package services

import (
	"server/dto"
	"server/models"
	"server/repositories"

	"github.com/google/uuid"
)

type TaskServiceImpl struct {
	taskRepo repositories.TaskRepository
}

func NewTaskService(taskRepo repositories.TaskRepository) *TaskServiceImpl {
	return &TaskServiceImpl{taskRepo: taskRepo}
}

func (service *TaskServiceImpl) CreateTask(taskDTO *dto.AssignTask) (*models.Task, error) {
	task := &models.Task{
		Title:       taskDTO.Title,
		Description: taskDTO.Description,
		Status:      taskDTO.Status,
		Priority:    taskDTO.Priority,
		StartDate:   taskDTO.StartDate,
		EndDate:     taskDTO.EndDate,
	}

	err := service.taskRepo.Create(task)
	if err != nil {
		return nil, err
	}
	return task, nil
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
	_, err := service.taskRepo.FindByID(taskID)
	if err != nil {
		return err
	}

	err = service.taskRepo.Delete(taskID)
	if err != nil {
		return err
	}

	return nil
}
