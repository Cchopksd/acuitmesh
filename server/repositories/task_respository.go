package repositories

import (
	"server/models"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)


type TaskRepository interface {
	Create(task *models.Task) error
	FindByID(taskID uuid.UUID) (*models.Task, error)
	FindByTaskBoardID(taskID uuid.UUID) (*[]models.Task, error)
	Update(taskID uuid.UUID, task *models.Task) (*models.Task, error)
	Delete(taskID uuid.UUID) error
}

// TaskRepositoryImpl is the concrete implementation of TaskRepository
type TaskRepositoryImpl struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepositoryImpl {
	return &TaskRepositoryImpl{db: db}
}

func (repo *TaskRepositoryImpl) Create(task *models.Task) error {
	return repo.db.Create(task).Error
}

func (repo *TaskRepositoryImpl) FindByID(taskID uuid.UUID) (*models.Task, error) {
	var task models.Task
	err := repo.db.First(&task, "id = ?", taskID).Error
	if err != nil {
		return nil, err 
	}
	return &task, nil
}

func (repo *TaskRepositoryImpl) FindByTaskBoardID(taskBoardID uuid.UUID) ([]models.Task, error) {
	var tasks []models.Task
	if err := repo.db.Where("task_board_id = ?", taskBoardID).Find(&tasks).Error; err != nil {
		return nil, err
	}
	return tasks, nil
}


func (repo *TaskRepositoryImpl) Update(taskID uuid.UUID, task *models.Task) (*models.Task, error) {
	err := repo.db.Model(&models.TaskBoard{}).Where("id = ?", taskID).Updates(task).Error
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (repo *TaskRepositoryImpl) Delete(taskID uuid.UUID) error {
	return repo.db.Delete(&models.TaskBoard{}, "id = ?", taskID).Error

}
