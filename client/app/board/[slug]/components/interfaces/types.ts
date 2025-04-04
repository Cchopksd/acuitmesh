// types.ts
export interface TaskBoard {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_board_id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  task_board?: TaskBoard;
}

export interface Column {
  id: string;
  title: string;
  status: Task["status"];
  tasks: Task[];
}

export interface DragItem {
  type: string;
  id: string;
  status: Task["status"];
}

export enum Statuses {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

export enum Priorities {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

