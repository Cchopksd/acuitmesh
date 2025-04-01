// Column.tsx
"use client";

import { useDrop, ConnectDropTarget } from "react-dnd";
import { useRef } from "react";

import TaskCard from "./Card";
import { Task, ColumnProps } from "./interfaces/types";

export default function Column({
  title,
  tasks,
  onDropTask,
  removeTask,
  editTask,
}: ColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item: { task: Task }) => onDropTask(item.task, title),
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    // Call the drop ref function
    (drop as ConnectDropTarget)(node);
    // Update our regular ref
    columnRef.current = node;
  };

  const columnTitles = {
    todo: "To Do",
    inProgress: "In Progress",
    done: "Done",
  };

  const columnColors = {
    todo: "bg-gray-100",
    inProgress: "bg-blue-50",
    done: "bg-green-50",
  };

  return (
    <div
      ref={combinedRef}
      className={`w-full lg:w-1/3 ${columnColors[title]} p-4 rounded-lg shadow-md flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold capitalize">{columnTitles[title]}</h2>
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
          {tasks.length}
        </span>
      </div>

      <div className="flex-grow overflow-y-auto max-h-96">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            moveTask={onDropTask}
            removeTask={removeTask}
            editTask={editTask}
          />
        ))}
      </div>
    </div>
  );
}

