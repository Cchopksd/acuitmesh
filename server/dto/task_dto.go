package dto

import (
	"time"

	"github.com/google/uuid"
)

type AssignTask struct {
    Title       string    `json:"title" validate:"required,max=255"`
    Description string    `json:"description" validate:"max=255"`
    Status      string    `json:"status" validate:"required,oneof=todo in_progress done"`
    Priority    string    `json:"priority" validate:"required,oneof=low medium high"`
    StartDate   time.Time `json:"start_date" validate:"required"`
    EndDate     time.Time `json:"end_date" validate:"required"`
}


type UpdateTaskRequest struct {
    Title       string    `json:"title" validate:"required, max=255"`
    Description string    `json:"description" validate:"max=255"`
    Status      string    `json:"status" validate:"oneof=todo in_progress done"`
    Priority    string    `json:"priority" validate:"oneof=low medium high"`
    StartDate   time.Time `json:"start_date"`
    EndDate     time.Time `json:"end_date"`
}

type TaskBoardRequest struct {
	Title       string    `json:"title" validate:"required,max=255"`
	Description string    `json:"description" validate:"max=255"`
}

type AddCollaborator struct {
	UserID      uuid.UUID `json:"user_id" validate:"required"`
	TaskBoardID 	uuid.UUID `json:"task_board_id" validate:"required"`
	Role        string `json:"role" validate:"required,oneof=owner editor viewer"`
}