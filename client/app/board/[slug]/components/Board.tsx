"use client";
import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import TaskFormModal from "./TaskForm";
import { Task, Column as ColumnType } from "./interfaces/types";
import { MoreHorizontal } from "lucide-react";
import { UpdateTask } from "../action";

interface KanbanBoardProps {
  boardDetail: Task[];
  taskBoardID: string;
}

export default function KanbanBoard({
  boardDetail,
  taskBoardID,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(boardDetail || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const [columns, setColumns] = useState<ColumnType[]>([
    { id: "1", title: "To Do", status: "todo", tasks: [] },
    { id: "2", title: "In Progress", status: "in_progress", tasks: [] },
    { id: "3", title: "Done", status: "done", tasks: [] },
  ]);

  useEffect(() => {
    const newColumns = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.status === column.status),
    }));
    setColumns(newColumns);
  }, [tasks]);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message.type);
      if (message.type === "create") {
        setTasks((prev) => [...prev, message.data]);
      } else if (message.type === "update") {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === message.data.id ? message.data : task
          )
        );
      } else if (message.type === "delete") {
        setTasks((prev) => prev.filter((task) => task.id !== message.data));
      }
    };
  }, []);

  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      )
    );

    const movedTask = tasks.find((task) => task.id === taskId);
    if (movedTask) {
      try {
        const updatedTask = { ...movedTask, status: newStatus };
        await UpdateTask({ task: updatedTask, taskBoardID });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  const openModal = (task?: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...taskData,
                task_board_id: taskBoardID,
                updated_at: new Date().toISOString(),
              }
            : task
        )
      );
    }
  };

  const handleEditTask = (task: Task) => {
    openModal(task);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-3xl font-bold'>Board</h1>
        <div className='flex gap-4 items-center'>
          <button
            onClick={() => openModal()}
            className='bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors'>
            Release
          </button>
          <button className='text-gray-600 hover:bg-gray-200 p-2 rounded-md'>
            <MoreHorizontal className='h-5 w-5' />
          </button>
        </div>
      </div>

      <div className='flex flex-row space-x-4 overflow-x-auto pb-4'>
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            moveTask={moveTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTask}
        editTask={editingTask}
        taskBoardID={taskBoardID}
      />
    </DndProvider>
  );
}
