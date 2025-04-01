package models

import (
	"time"

	"github.com/google/uuid"
)

type TaskBoard struct {
	ID          uuid.UUID    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Title       string       `gorm:"size:255;not null" json:"title" validate:"required,max=255"`
	Description string       `gorm:"size:255" json:"description" validate:"max=255"`
	CreatedAt   time.Time    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time    `gorm:"autoUpdateTime" json:"updated_at"`
	
	Users       []User       `gorm:"many2many:user_task_boards;" json:"users,omitempty"`
	Tasks       []Task       `gorm:"foreignKey:TaskBoardID" json:"tasks,omitempty"`
}

type UserTaskBoard struct {
	UserID      uuid.UUID `gorm:"type:uuid;not null;primaryKey" json:"user_id"`
	TaskBoardID uuid.UUID `gorm:"type:uuid;not null;primaryKey" json:"task_board_id"`
	Role        string    `gorm:"size:50;not null;default:'viewer'" json:"role" validate:"required,oneof=owner editor viewer"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	
	User       User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TaskBoard  TaskBoard `gorm:"foreignKey:TaskBoardID" json:"task_board,omitempty"`
}

type Task struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	TaskBoardID uuid.UUID `gorm:"type:uuid;not null;index" json:"task_board_id"`
	Title       string    `gorm:"size:255;not null" json:"title" validate:"required,max=255"`
	Description string    `gorm:"size:255" json:"description" validate:"max=255"`
	Status      string    `gorm:"size:50;not null;default:'todo'" json:"status" validate:"required,oneof=todo in_progress done"`
	Priority    string    `gorm:"size:50;not null;default:'medium'" json:"priority" validate:"required,oneof=low medium high"`
	StartDate   time.Time `gorm:"not null" json:"start_date"`
	EndDate     time.Time `gorm:"not null" json:"end_date"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	
	TaskBoard   TaskBoard `gorm:"foreignKey:TaskBoardID" json:"task_board,omitempty"`
}