package dto

import (
	"time"

	"github.com/google/uuid"
)

type AssignTask struct {
    UserID      uuid.UUID `json:"user_id" binding:"required"`
    TaskBoardID uuid.UUID `json:"task_board_id" binding:"required"`
    Title       string    `json:"title" binding:"required,max=255"`
    Description string    `json:"description" binding:"max=255"`
    Status      string    `json:"status" binding:"required,oneof=todo in_progress done"`
    Priority    string    `json:"priority" binding:"required,oneof=low medium high"`
    StartDate   time.Time `json:"start_date" binding:"required"`
    EndDate     time.Time `json:"end_date" binding:"required"`
}

type TaskBoardFind struct {
    ID       uuid.UUID  `gorm:"type:uuid;primary_key"`
    Status   *string    `gorm:"default:null"`  
    Priority *int       `gorm:"default:null"`  
    BoardID  uuid.UUID  `gorm:"type:uuid;not null"`
}


type UpdateTaskRequest struct {
    UserID      uuid.UUID `json:"user_id" binding:"required"`
    TaskBoardID uuid.UUID `json:"task_board_id" binding:"required"`
    Title       string    `json:"title" binding:"required"`
    Description string    `json:"description"`
    Status      string    `json:"status" binding:"oneof=todo in_progress done"`
    Priority    string    `json:"priority" binding:"oneof=low medium high"`
    StartDate   time.Time `json:"start_date"`
    EndDate     time.Time `json:"end_date"`
}

type TaskBoardRequest struct {
	Title       string     `json:"title" binding:"required,max=255"`
	Description string     `json:"description" binding:"max=255"`
	User        string     `json:"user" binding:"required,uuid"`
    Role        string     `gorm:"size:50;not null" json:"role" binding:"required,oneof=owner editor viewer"`
}

type AddCollaborator struct {
	Email       string `json:"email" binding:"required"`
	TaskBoardID uuid.UUID `json:"task_board_id" binding:"required"`
	Role        string `json:"role" binding:"required,oneof=owner editor viewer"`
}

type SortByPriorityAndStatus struct {
    TaskID      uuid.UUID `json:"task_id" binding:"required"`
    Status      string    `json:"status" binding:"oneof=todo in_progress done"`
    Priority    string    `json:"priority" binding:"oneof=low medium high"`
}