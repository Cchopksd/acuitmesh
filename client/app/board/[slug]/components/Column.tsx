// Column.tsx
import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import TaskCard from "./Card";
import { Column as ColumnType, Task, DragItem } from "./interfaces/types";
import { ROLES } from "@/app/utils/checkPermission";

interface ColumnProps {
  column: ColumnType;
  moveTask: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  userRole: ROLES;
}

const Column: React.FC<ColumnProps> = ({
  column,
  moveTask,
  onEditTask,
  onDeleteTask,
  userRole,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: DragItem) => {
      if (item.status !== column.status) {
        moveTask(item.id, column.status);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drop(ref);

  const getBackgroundColor = () => {
    if (isOver) {
      return "bg-blue-50";
    }

    switch (column.status) {
      case "todo":
        return "bg-gray-100";
      case "in_progress":
        return "bg-blue-100";
      case "done":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div
      ref={ref}
      className={`flex-1 flex flex-col rounded-lg ${getBackgroundColor()} transition-colors duration-200`}>
      <div className='p-3 font-bold border-b'>
        <h2 className='text-lg'>{column.title}</h2>
        <span className='text-sm text-gray-500'>
          {column.tasks.length} tasks
        </span>
      </div>
      <div className='p-2 flex-1 overflow-y-auto'>
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
            userRole={userRole}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
