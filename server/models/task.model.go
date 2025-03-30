package models

import (
	"time"

	"github.com/google/uuid"
)

type UserTaskBoard struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user"`
	TaskBoardID uuid.UUID `gorm:"type:uuid;not null;index" json:"task_board"`
	Role        string    `gorm:"size:50;not null" json:"role" validate:"required,oneof=owner editor viewer"`
	CreatedAt 	time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt 	time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User      	User      `gorm:"foreignKey:UserID"`
	TaskBoard 	TaskBoard `gorm:"foreignKey:TaskBoardID"`
}

type TaskBoard struct {
    ID          uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
    Title       string         `gorm:"size:255;not null" json:"title" validate:"required,max=255"`
    Description string         `gorm:"size:255" json:"description" validate:"max=255"`
    CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updated_at"`

    Users       []UserTaskBoard `gorm:"foreignKey:TaskBoardID" json:"users"`
    Tasks       []Task          `gorm:"foreignKey:TaskBoardID" json:"tasks"`
}

type Task struct {
    ID          uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
    TaskBoardID uuid.UUID   `gorm:"type:uuid;not null;index" json:"task_board"`
    Title       string      `gorm:"size:255;not null" json:"title" validate:"required,max=255"`
    Description string      `gorm:"size:255" json:"description" validate:"max=255"`
    Status      string      `gorm:"size:50;not null" json:"status" validate:"required,oneof=todo in_progress done,max=50"`
    Priority    string      `gorm:"size:50;not null" json:"priority" validate:"required,oneof=low medium high, max=50"`
    StartDate   time.Time   `gorm:"not null" json:"start_date"`
    EndDate     time.Time   `gorm:"not null" json:"end_date"`
    CreatedAt   time.Time   `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt   time.Time   `gorm:"autoUpdateTime" json:"updated_at"`

    TaskBoard   TaskBoard   `gorm:"foreignKey:TaskBoardID"`
}