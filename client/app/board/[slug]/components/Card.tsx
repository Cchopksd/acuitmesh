"use client";
import React, { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Task } from "./interfaces/types";
import { hasPermission, ROLES } from "@/app/utils/checkPermission";
import Swal from "sweetalert2";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  userRole: ROLES;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  userRole,
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: {
      type: "TASK",
      id: task.id,
      status: task.status,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  drag(ref);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-md shadow-sm p-3 mb-2 transition-opacity duration-200 relative 
        ${isDragging ? "opacity-50" : "opacity-100"} 
        ${
          !hasPermission(userRole, [ROLES.OWNER, ROLES.EDITOR])
            ? "opacity-50 pointer-events-none"
            : ""
        }
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-white text-xs ${getPriorityColor()}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-gray-600 text-xs mb-2 line-clamp-2">
        {task.description}
      </p>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {formatDate(task.start_date)} - {formatDate(task.end_date)}
        </span>
      </div>

      {showActions && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!",
              }).then((result) => {
                if (result.isConfirmed) {
                  onDelete();
                }
              });
            }}
            className="p-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
