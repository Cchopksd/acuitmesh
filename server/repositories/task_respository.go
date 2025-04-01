package repositories

import (
	"fmt"
	"log"
	"server/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)


type TaskRepository interface {
	Create(task *models.Task) (*models.Task, error)
	FindByID(taskID uuid.UUID) (*models.Task, error)
	Update(taskID uuid.UUID, task *models.Task) (*models.Task, error)
	Delete(taskID uuid.UUID) error
}

type TaskRepositoryImpl struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepositoryImpl {
	return &TaskRepositoryImpl{db: db}
}

func (repo *TaskRepositoryImpl) Create(task *models.Task) (*models.Task, error) {
	if err := repo.db.Create(task).Error; err != nil {
        log.Printf("Error creating task board in database: %v", err)
		return nil, fmt.Errorf("error creating task board in database: %w", err)
    }
	repo.db.Preload("TaskBoard").
    Where("task_board_id = ?", task.TaskBoardID).
    First(&task)
    return task, nil
}

func (repo *TaskRepositoryImpl) FindByID(taskID uuid.UUID) (*models.Task, error) {
	var task models.Task
	err := repo.db.First(&task, "id = ?", taskID).Error
	if err != nil {
		return nil, err 
	}
	return &task, nil
}


func (repo *TaskRepositoryImpl) Update(taskID uuid.UUID, task *models.Task) (*models.Task, error) {
	err := repo.db.Model(&models.Task{}).Where("id = ?", taskID).Updates(task).Error
	if err != nil {
		return nil, err
	}

	var updatedTask models.Task
	if err := repo.db.Preload("TaskBoard").First(&updatedTask, "id = ?", taskID).Error; err != nil {
		return nil, err
	}
	return &updatedTask, nil
}


func (repo *TaskRepositoryImpl) Delete(taskID uuid.UUID) error {
	result := repo.db.Delete(&models.Task{}, "id = ?", taskID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete task with ID %s: %w", taskID, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("no task found with ID %s", taskID)
	}
	return nil
}
