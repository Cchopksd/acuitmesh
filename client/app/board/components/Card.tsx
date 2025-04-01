"use client";

import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDrag, useDragLayer } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { TaskCardProps } from "./interfaces/types";

// Separate component for the custom drag layer
const CustomDragLayer = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 100,
        insetInlineStart: currentOffset.x,
        insetBlockStart: currentOffset.y,
      }}
      className="w-[200px] md:w-[350px] lg:w-[450px]">
      <div
        className={`bg-white p-3 rounded-md shadow border-l-4 
        ${
          item.task.priority === "high"
            ? "border-red-500"
            : item.task.priority === "medium"
            ? "border-yellow-500"
            : "border-blue-500"
        }`}>
        <div className="flex justify-between items-start">
          <p className="font-medium text-gray-800">{item.task.content}</p>
        </div>

        <div className="mt-2 flex items-center">
          <span
            className={`text-xs px-2 py-1 rounded-full 
            ${
              item.task.priority === "high"
                ? "bg-red-100 text-red-800"
                : item.task.priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}>
            {item.task.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function TaskCard({
  task,
  index,
  removeTask,
  editTask,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "TASK",
    item: { task, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(cardRef);

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div
      ref={cardRef}
      className={`bg-white p-3 mb-3 rounded-md shadow border-l-4 ${
        task.priority === "high"
          ? "border-red-500"
          : task.priority === "medium"
          ? "border-yellow-500"
          : "border-blue-500"
      } ${isDragging ? "opacity-0" : "opacity-100"} relative`}>
      <div className="flex justify-between items-start">
        <p className="font-medium text-gray-800">{task.content}</p>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Task options">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="mt-2 flex items-center">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            priorityColors[task.priority as keyof typeof priorityColors]
          }`}>
          {task.priority}
        </span>
      </div>

      {isMenuOpen && (
        <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md p-2 z-10 border border-gray-200">
          <button
            onClick={() => {
              editTask(task.id);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 text-sm py-1 px-2 text-gray-700 hover:bg-gray-100 rounded w-full text-left">
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={() => {
              removeTask(task.id);
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 text-sm py-1 px-2 text-red-600 hover:bg-gray-100 rounded w-full text-left">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Export the CustomDragLayer component to use at a higher level
export { CustomDragLayer };

