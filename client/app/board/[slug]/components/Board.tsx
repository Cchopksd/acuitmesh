"use client";
import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import TaskFormModal from "./TaskForm";
import { Task, Column as ColumnType } from "./interfaces/types";
import { MoreHorizontal, Search } from "lucide-react";
import { DeleteTask, UpdateTask } from "../action";
import { hasPermission, ROLES } from "@/app/utils/checkPermission";
import Filter from "./Filter";
import Swal from "sweetalert2";

interface BoardProps {
  boardDetail: Task[];
  taskBoardID: string;
  userRole: ROLES;
}

export default function Board({
  boardDetail,
  taskBoardID,
  userRole,
}: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(boardDetail || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [dropdownFilter, setDropdownFilter] = useState(false);

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
      if (message.type === "create") {
        // Add the new task to the state
        setTasks((prev) => [...prev, message.data]);
      } else if (message.type === "update") {
        // Find the task in the state and update it
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
    DeleteTask({ task: taskId, taskBoardID });
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Board</h1>
        <div className="flex gap-4 items-center">
          {hasPermission(userRole, [ROLES.OWNER, ROLES.EDITOR]) && (
            <button
              onClick={() => openModal()}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors">
              Release
            </button>
          )}
          <button className="text-gray-600 hover:bg-gray-200 p-2 rounded-md">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex mb-4 gap-4">
        <div className="flex relative items-center ">
          <input
            type="text"
            name=""
            id=""
            onClick={() => {
              return Swal.fire({
                title: "Please let me to join your team!!!",
                text: "u didnt tell me to query with text",
                imageUrl:
                  "https://preview.redd.it/c6ysm6olojm71.jpg?auto=webp&s=c479feeac177309c5894b78720dec8025d6c818c",
                imageWidth: 400,
                imageHeight: 300,
                imageAlt: "Custom image",
              });
            }}
            className="bg-gray-200 rounded-md py-2 pl-3 w-full"
          />
          <Search className="absolute right-3" />
        </div>

        <button
          onClick={() => {
            setDropdownFilter((prev) => {
              return !prev;
            });
          }}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors">
          Quick Filter
        </button>

        <a
          href={`${taskBoardID}/schedule`}
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors text-center items-center flex">
          Schedule
        </a>
      </div>
      {dropdownFilter && (
        <div className="flex mb-4 gap-4">
          <Filter />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            moveTask={moveTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            userRole={userRole}
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
