// TaskFormModal.tsx
"use client";

import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Priority, TaskFormModalProps } from "./interfaces/types";

export default function TaskFormModal({
  isOpen,
  onClose,
  onSave,
  initialValues,
}: TaskFormModalProps) {
  const [taskContent, setTaskContent] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialValues) {
      setTaskContent(initialValues.content);
      setPriority(initialValues.priority);
    } else {
      setTaskContent("");
      setPriority("medium");
    }
  }, [initialValues]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title">
        <div className="flex justify-between items-center mb-4">
          <h3
            id="modal-title"
            className="text-lg font-bold">
            {initialValues ? "Edit Task" : "Add New Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Description
          </label>
          <textarea
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => {
              if (taskContent.trim()) {
                onSave({
                  id: initialValues?.id || Date.now().toString(),
                  content: taskContent,
                  priority: priority,
                });
                onClose();
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!taskContent.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

