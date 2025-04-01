import React, { useState, useEffect } from "react";
import { Task } from "./interfaces/types";
import { CreateTask, UpdateTask } from "../action";
import { format, addDays, parseISO } from "date-fns";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editTask?: Task;
  taskBoardID: string;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTask,
  taskBoardID,
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    task_board_id: taskBoardID,
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    end_date: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
  });

  useEffect(() => {
    if (editTask) {
      setTask({
        ...editTask,
      });
    } else {
      setTask({
        task_board_id: taskBoardID,
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        start_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        end_date: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      });
    }
  }, [editTask, isOpen, taskBoardID]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle date fields specifically
    if (name === "start_date" || name === "end_date") {
      // Convert the date input value to an ISO string with time
      const dateValue = value
        ? format(parseISO(`${value}T00:00:00`), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        : "";
      setTask((prev) => ({ ...prev, [name]: dateValue }));
    } else {
      setTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editTask) {
      const response = await UpdateTask({
        task: task as Task,
        taskBoardID,
      });
      if (response.code == 200) {
        window.location.reload();
      }
      return;
    }

    const response = await CreateTask({ task: task as Task, taskBoardID });
    if (response.code == 201) {
      window.location.reload();
    }

    onSave(task);
    onClose();
  };

  if (!isOpen) return null;

  const formattedStartDate = task.start_date
    ? format(parseISO(task.start_date), "yyyy-MM-dd")
    : "";

  const formattedEndDate = task.end_date
    ? format(parseISO(task.end_date), "yyyy-MM-dd")
    : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={task.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={task.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={task.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={task.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formattedStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formattedEndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {editTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;

