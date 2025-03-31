package dto

import "github.com/google/uuid"

type CreateUserRequest struct {
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
    ID    uuid.UUID  `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}
