// KanbanBoard.tsx
"use client";

import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import TaskFormModal from "./TaskForm";
import { Task, ColumnType } from "./interfaces/types";
import { CustomDragLayer } from "./Card";

const initialTasks: Record<ColumnType, Task[]> = {
  todo: [
    { id: "1", content: "Research market trends", priority: "high" },
    { id: "2", content: "Draft project proposal", priority: "medium" },
  ],
  inProgress: [{ id: "3", content: "Create wireframes", priority: "high" }],
  done: [{ id: "4", content: "Stakeholder review", priority: "low" }],
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Record<ColumnType, Task[]>>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumn, setTargetColumn] = useState<ColumnType | null>(null);

  const moveTask = (task: Task, newColumn: ColumnType) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev };
      // Remove the task from its current column
      for (const col in updatedTasks) {
        updatedTasks[col as ColumnType] = updatedTasks[
          col as ColumnType
        ].filter((t) => t.id !== task.id);
      }
      // Add the task to the new column
      updatedTasks[newColumn].push(task);
      return updatedTasks;
    });
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev };
      for (const col in updatedTasks) {
        updatedTasks[col as ColumnType] = updatedTasks[
          col as ColumnType
        ].filter((t) => t.id !== taskId);
      }
      return updatedTasks;
    });
  };

  const editTask = (taskId: string) => {
    // Find the task and its column
    for (const col in tasks) {
      const task = tasks[col as ColumnType].find((t) => t.id === taskId);
      if (task) {
        setEditingTask(task);
        setIsModalOpen(true);
        return;
      }
    }
  };

  const addNewTask = (column: ColumnType) => {
    setTargetColumn(column);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Task) => {
    if (editingTask) {
      // Update existing task
      setTasks((prev) => {
        const updatedTasks = { ...prev };
        for (const col in updatedTasks) {
          updatedTasks[col as ColumnType] = updatedTasks[col as ColumnType].map(
            (t) => (t.id === taskData.id ? taskData : t)
          );
        }
        return updatedTasks;
      });
    } else if (targetColumn) {
      // Add new task
      setTasks((prev) => ({
        ...prev,
        [targetColumn]: [...prev[targetColumn], taskData],
      }));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {(Object.keys(tasks) as ColumnType[]).map((colId) => (
            <Column
              key={colId}
              title={colId}
              tasks={tasks[colId]}
              onDropTask={moveTask}
              removeTask={removeTask}
              editTask={editTask}
              addNewTask={addNewTask}
            />
          ))}
        </div>

        <TaskFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          initialValues={editingTask}
        />
        <CustomDragLayer />
      </div>
    </DndProvider>
  );
}

