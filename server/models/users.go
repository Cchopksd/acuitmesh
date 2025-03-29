package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	UID      uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"uid"`
	Name     string    `gorm:"size:255;not null" json:"name" validate:"required,max=255"`
	Email    string    `gorm:"size:255;unique;not null" json:"email" validate:"required,email"`
	Password string    `gorm:"size:255;not null" json:"password" validate:"required,min=6"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}