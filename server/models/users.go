package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"id"`
	Name      string       `gorm:"size:255;not null" json:"name" validate:"required,max=255"`
	Email     string       `gorm:"size:255;unique;not null" json:"email" validate:"required,email"`
	Password  string       `gorm:"size:255;not null" json:"-" validate:"required,min=6"`
	CreatedAt time.Time    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time    `gorm:"autoUpdateTime" json:"updated_at"`
	
	TaskBoards []TaskBoard `gorm:"many2many:user_task_boards;" json:"task_boards,omitempty"`
}
