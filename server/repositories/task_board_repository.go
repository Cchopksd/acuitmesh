package repositories

import (
	"fmt"
	"log"
	"server/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	Owner       Role = "owner"
	Collaborator Role = "collaborator"
	Viewer      Role = "viewer"
)

// TaskBoardRepository defines the interface for task board operations
type TaskBoardRepository interface {
	Create(taskBoard *models.TaskBoard) (*models.TaskBoard, error)
	CreateUserBoard(userTaskBoard *models.UserTaskBoard) (*models.UserTaskBoard, error)
	FindByUserID(userID uuid.UUID) ([]models.TaskBoard, error)
	FindByID(taskBoardID uuid.UUID) (*models.TaskBoard, error)
	FindByIDWithFilter(taskBoardID uuid.UUID, status *string, priority *string) (*models.TaskBoard, error)
	Update(taskBoardID uuid.UUID, taskBoard *models.TaskBoard) (*models.TaskBoard, error)
	Delete(taskBoardID uuid.UUID) error
	AddCollaborator(UserID uuid.UUID, TaskBoardID uuid.UUID, role Role) (*models.UserTaskBoard, error)
	RemoveCollaborator(taskBoardID uuid.UUID, userID uuid.UUID) error
	CheckUserRole(taskBoardID uuid.UUID, userID uuid.UUID) (*models.UserTaskBoard, error)
	GetUsersOnTaskBoard(taskBoardID uuid.UUID) ([]models.UserTaskBoard, error)
}

// TaskBoardRepositoryImpl is the concrete implementation of TaskBoardRepository
type TaskBoardRepositoryImpl struct {
	db *gorm.DB
}

func NewTaskBoardRepository(db *gorm.DB) *TaskBoardRepositoryImpl {
	return &TaskBoardRepositoryImpl{db: db}
}

func (repo *TaskBoardRepositoryImpl) Create(taskBoard *models.TaskBoard) (*models.TaskBoard, error) {
    if err := repo.db.Create(taskBoard).Error; err != nil {
        log.Printf("Error creating task board in database: %v", err)
        return nil, fmt.Errorf("error creating task board in database: %w", err)
    }
    repo.db.First(taskBoard, taskBoard.ID)
    return taskBoard, nil
}


func (repo *TaskBoardRepositoryImpl) CreateUserBoard(userTaskBoard *models.UserTaskBoard) (*models.UserTaskBoard, error) {
    if err := repo.db.Create(userTaskBoard).Error; err != nil {
        log.Printf("Error creating user task board in database: %v", err)
        return nil, fmt.Errorf("error creating user task board in database: %w", err)
    }
    repo.db.Preload("User").Preload("TaskBoard").
    Where("user_id = ? AND task_board_id = ?", userTaskBoard.UserID, userTaskBoard.TaskBoardID).
    First(&userTaskBoard)

    return userTaskBoard, nil
}


func (repo *TaskBoardRepositoryImpl) FindByID(taskBoardID uuid.UUID) (*models.TaskBoard, error) {
	var taskBoard models.TaskBoard
	err := repo.db.
		Preload("Tasks").
		Preload("Tasks.TaskBoard").
		Where("id = ?", taskBoardID).
		First(&taskBoard).Error

	if err != nil {
		return nil, err
	}
	return &taskBoard, nil
}

func (repo *TaskBoardRepositoryImpl) FindByIDWithFilter(taskBoardID uuid.UUID, status *string, priority *string) (*models.TaskBoard, error) {
	var taskBoard models.TaskBoard
	if err := repo.db.First(&taskBoard, "id = ?", taskBoardID).Error; err != nil {
		return nil, err
	}

	tasksQuery := repo.db.Model(&models.Task{}).Where("task_board_id = ?", taskBoardID)
	
	if status != nil && *status != "" {
		tasksQuery = tasksQuery.Where("status = ?", *status)
	}
	
	if priority != nil && *priority != "" {
		tasksQuery = tasksQuery.Where("priority = ?", *priority)
	}

	var filteredTasks []models.Task
	if err := tasksQuery.Find(&filteredTasks).Error; err != nil {
		return nil, err
	}

	taskBoard.Tasks = filteredTasks

	return &taskBoard, nil
}


func (repo *TaskBoardRepositoryImpl) FindByUserID(userID uuid.UUID) ([]models.TaskBoard, error) {
	var taskBoards []models.TaskBoard
	err := repo.db.Preload("Users").
		Joins("JOIN user_task_boards ON task_boards.id = user_task_boards.task_board_id").
		Where("user_task_boards.user_id = ?", userID).
		Find(&taskBoards).Error

	if err != nil {
		return nil, err
	}
	return taskBoards, nil
}



func (repo *TaskBoardRepositoryImpl) Update(taskBoardID uuid.UUID, taskBoard *models.TaskBoard) (*models.TaskBoard, error) {
	err := repo.db.Model(&models.TaskBoard{}).Where("id = ?", taskBoardID).Updates(taskBoard).Error
	if err != nil {
		return nil, err
	}

	var updatedTaskBoard models.TaskBoard
	err = repo.db.Where("id = ?", taskBoardID).First(&updatedTaskBoard).Error
	if err != nil {
		return nil, err 
	}

	return &updatedTaskBoard, nil 
}


func (repo *TaskBoardRepositoryImpl) Delete(taskBoardID uuid.UUID) error {
	return repo.db.Delete(&models.TaskBoard{}, "id = ?", taskBoardID).Error
}

func (repo *TaskBoardRepositoryImpl) AddCollaborator(UserID uuid.UUID, TaskBoardID uuid.UUID, role Role) (*models.UserTaskBoard, error) {
	userTaskBoard := models.UserTaskBoard{
		UserID:      UserID,
		TaskBoardID: TaskBoardID,
		Role:        string(role),
	}

	if err := repo.db.Create(&userTaskBoard).Error; err != nil {
		return nil, err
	}

	if err := repo.db.Preload("User").Preload("TaskBoard").
		First(&userTaskBoard, "user_id = ? AND task_board_id = ?", userTaskBoard.UserID, userTaskBoard.TaskBoardID).Error; err != nil {
		return nil, err
	}

	return &userTaskBoard, nil
}

func (repo *TaskBoardRepositoryImpl) RemoveCollaborator(taskBoardID uuid.UUID, userID uuid.UUID) error {
	return repo.db.Delete(&models.UserTaskBoard{}, "task_board_id = ? AND user_id = ?", taskBoardID, userID).Error
}

func (repo *TaskBoardRepositoryImpl) CheckUserRole(taskBoardID uuid.UUID, userID uuid.UUID) (*models.UserTaskBoard, error) {
	var userTaskBoard *models.UserTaskBoard
	err := repo.db.Where("task_board_id = ? AND user_id = ?", taskBoardID, userID).Preload("User").First(&userTaskBoard).Error
	if err != nil {
		return userTaskBoard, err
	}
	
	return userTaskBoard, nil
}

func (repo *TaskBoardRepositoryImpl) GetUsersOnTaskBoard(taskBoardID uuid.UUID) ([]models.UserTaskBoard, error) {
	var userTaskBoards []models.UserTaskBoard 

	err := repo.db.
		Where("task_board_id = ?", taskBoardID).
		Preload("User").
		Preload("TaskBoard").
		Find(&userTaskBoards).Error 

	if err != nil {
		return nil, err
	}

	return userTaskBoards, nil
}


