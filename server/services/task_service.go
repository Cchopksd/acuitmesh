package services

import (
	"encoding/json"
	"log"
	"server/dto"
	"server/handlers/websocket"
	"server/models"
	"server/repositories"

	"github.com/google/uuid"
)

// TaskEventType ประเภทของเหตุการณ์ที่เกี่ยวข้องกับ Task
type TaskEventType string

const (
	TaskCreated TaskEventType = "TASK_CREATED"
	TaskUpdated TaskEventType = "TASK_UPDATED"
	TaskDeleted TaskEventType = "TASK_DELETED"
)

// TaskEvent โครงสร้างข้อมูลสำหรับส่งผ่าน WebSocket
type TaskEvent struct {
	Type    TaskEventType `json:"type"`
	Payload interface{}   `json:"payload"`
}

type TaskServiceImpl struct {
	taskRepo repositories.TaskRepository
	wsHub    *websocket.Hub
}

func NewTaskService(taskRepo repositories.TaskRepository, wsHub *websocket.Hub) *TaskServiceImpl {
	return &TaskServiceImpl{
		taskRepo: taskRepo,
		wsHub:    wsHub,
	}
}

func (s *TaskServiceImpl) CreateTask(taskDTO *dto.AssignTask) (*models.Task, error) {
	task := &models.Task{
		ID:          uuid.New(),
		Title:       taskDTO.Title,
		Description: taskDTO.Description,
		Status:      taskDTO.Status,
		Priority:    taskDTO.Priority,
		StartDate:   taskDTO.StartDate,
		EndDate:     taskDTO.EndDate,
	}

	err := s.taskRepo.Create(task)
	if err != nil {
		return nil, err
	}

	// Broadcast task creation event
	s.notifyClients(TaskCreated, task)
	
	return task, nil
}

func (s *TaskServiceImpl) UpdateTask(taskID uuid.UUID, taskDTO *dto.UpdateTaskRequest) (*models.Task, error) {
	task, err := s.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}

	// Keep original creator and assignee


	task.Title = taskDTO.Title
	task.Description = taskDTO.Description
	task.Status = taskDTO.Status
	task.Priority = taskDTO.Priority
	task.StartDate = taskDTO.StartDate
	task.EndDate = taskDTO.EndDate


	updatedTask, err := s.taskRepo.Update(taskID, task)
	if err != nil {
		return nil, err
	}

	// Broadcast task update event
	s.notifyClients(TaskUpdated, updatedTask)
	
	return updatedTask, nil
}

func (s *TaskServiceImpl) FindTaskByID(taskID uuid.UUID) (*models.Task, error) {
	task, err := s.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (s *TaskServiceImpl) DeleteTask(taskID uuid.UUID) error {
	_, err := s.taskRepo.FindByID(taskID)
	if err != nil {
		return err
	}

	err = s.taskRepo.Delete(taskID)
	if err != nil {
		return err
	}

	// Broadcast task deletion event
	s.notifyClients(TaskDeleted, map[string]interface{}{
		"id":         taskID,
	})
	
	return nil
}

// notifyClients ส่งเหตุการณ์ไปยัง clients ทุกคนผ่าน WebSocket
func (s *TaskServiceImpl) notifyClients(eventType TaskEventType, payload interface{}) {
	event := TaskEvent{
		Type:    eventType,
		Payload: payload,
	}

	message, err := json.Marshal(event)
	if err != nil {
		log.Printf("Failed to marshal task event: %v", err)
		return
	}

	// ส่งข้อความไปยัง Hub เพื่อกระจายไปยัง clients ทุกคน
	s.wsHub.Broadcast(message)
}