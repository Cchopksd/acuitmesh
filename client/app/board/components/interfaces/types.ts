// types.ts
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  content: string;
  priority: Priority;
}

export type ColumnType = "todo" | "inProgress" | "done";

export interface ColumnProps {
  title: ColumnType;
  tasks: Task[];
  onDropTask: (task: Task, newColumn: ColumnType) => void;
  removeTask: (taskId: string) => void;
  editTask: (taskId: string) => void;
  addNewTask: (column: ColumnType) => void;
}

export interface TaskCardProps {
  task: Task;
  index: number;
  moveTask: (task: Task, newColumn: ColumnType) => void;
  removeTask: (taskId: string) => void;
  editTask: (taskId: string) => void;
}

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Task) => void;
  initialValues?: Task | null;
}
