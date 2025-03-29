"use client";
import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types remain the same
interface Issue {
  id: number;
  title: string;
  assignee: string;
  priority: "Low" | "Medium" | "High";
}

interface ProgressColumn {
  name: string;
  count: number;
  color: string;
  items: Issue[];
}

export default function DraggableKanbanBoard() {
  const [columns, setColumns] = useState<ProgressColumn[]>([
    {
      name: "To Do",
      count: 3,
      color: "bg-gray-200",
      items: [
        {
          id: 1,
          title: "Design new feature",
          assignee: "John Doe",
          priority: "Low",
        },
        {
          id: 2,
          title: "Update documentation",
          assignee: "Jane Smith",
          priority: "Medium",
        },
        {
          id: 3,
          title: "Research market trends",
          assignee: "Alex Johnson",
          priority: "High",
        },
      ],
    },
    {
      name: "In Progress",
      count: 2,
      color: "bg-blue-200",
      items: [
        {
          id: 4,
          title: "Implement user authentication",
          assignee: "Mike Brown",
          priority: "High",
        },
        {
          id: 5,
          title: "Performance optimization",
          assignee: "Sarah Lee",
          priority: "Medium",
        },
      ],
    },
    {
      name: "Done",
      count: 5,
      color: "bg-green-200",
      items: [
        {
          id: 6,
          title: "Fix login bug",
          assignee: "Emily Wang",
          priority: "High",
        },
        {
          id: 7,
          title: "Update dependencies",
          assignee: "Chris Taylor",
          priority: "Low",
        },
        {
          id: 8,
          title: "Refactor API endpoints",
          assignee: "David Kim",
          priority: "Medium",
        },
        {
          id: 9,
          title: "Add dark mode",
          assignee: "Rachel Green",
          priority: "Low",
        },
        {
          id: 10,
          title: "Implement error logging",
          assignee: "Tom Harris",
          priority: "Medium",
        },
      ],
    },
  ]);

  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const getPriorityColor = (priority: Issue["priority"]): string => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = findIssue(active.id);
    setActiveIssue(issue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If no destination or dragging to the same position, do nothing
    if (!over || active.id === over.id) {
      setActiveIssue(null);
      return;
    }

    setColumns((prevColumns) => {
      // Create a deep copy of columns to avoid direct mutation
      const newColumns = prevColumns.map((column) => ({
        ...column,
        items: [...column.items],
      }));

      // Find the source column and remove the dragged issue
      const sourceColumnIndex = newColumns.findIndex((column) =>
        column.items.some((item) => item.id === active.id)
      );

      // Find the destination column
      const destColumnIndex = newColumns.findIndex(
        (column) =>
          column.name === over.id ||
          column.items.some((item) => item.id === over.id)
      );

      // Remove the issue from source column
      const sourceIssue = findIssue(active.id);
      newColumns[sourceColumnIndex].items = newColumns[
        sourceColumnIndex
      ].items.filter((item) => item.id !== active.id);

      // Determine the insertion point in the destination column
      const destinationColumn = newColumns[destColumnIndex];
      const destinationIndex = destinationColumn.items.findIndex(
        (item) => item.id === over.id
      );

      // Insert the issue at the correct position
      if (destinationIndex !== -1) {
        destinationColumn.items.splice(destinationIndex, 0, sourceIssue);
      } else {
        // If no specific position, add to the end of the column
        destinationColumn.items.push(sourceIssue);
      }

      // Update column counts
      newColumns.forEach((column) => {
        column.count = column.items.length;
      });

      return newColumns;
    });

    setActiveIssue(null);
  };

  const findIssue = (id: number | string): Issue => {
    for (const column of columns) {
      const issue = column.items.find((item) => item.id === id);
      if (issue) return issue;
    }
    throw new Error(`Issue with id ${id} not found`);
  };

  // When dragging an issue, show a preview of the issue being dragged
  function SortableIssueCard({
    issue,
    getPriorityColor,
  }: {
    issue: Issue;
    getPriorityColor: (priority: Issue["priority"]) => string;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: issue.id });

    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
      setIsDragging(false);
    };

    const handleMouseMove = () => {
      setIsDragging(true);
    };

    const handleClick = (event: React.MouseEvent) => {
      if (isDragging) {
        event.preventDefault();
        return;
      }
    };

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={`bg-white border border-[#f1f2f4] rounded-md p-3 
                     hover:shadow-md transition-shadow 
                     flex justify-between items-start cursor-pointer ${
                       issue.id === activeIssue?.id ? "hidden" : ""
                     }`}>
        <div>
          <h3 className="font-semibold text-sm text-gray-800">{issue.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{issue.assignee}</p>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${getPriorityColor(issue.priority)}`}
          title={`${issue.priority} Priority`}></span>
      </div>
    );
  }

  function DroppableColumn({
    column,
    children,
  }: {
    column: ProgressColumn;
    children: React.ReactNode;
  }) {
    const { setNodeRef } = useDroppable({ id: column.name });

    return (
      <div
        ref={setNodeRef}
        className="flex-1 bg-[#f1f2f4] rounded-sm shadow-md overflow-hidden">
        {/* Column Header */}
        <div className="flex items-center gap-4 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">
            {column.name}
          </h2>
          <span className="text-sm font-semibold text-gray-500">
            {column.count}
          </span>
        </div>

        {/* Column Content */}
        <div className="p-4 space-y-3 min-h-[100px]">{children}</div>
      </div>
    );
  }

  const handleOpenIssue = (issue: Issue) => {
    console.log("Opening issue", issue);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div className="p-6">
        <section className="mb-6">
          <div className="flex justify-between w-full items-center">
            <h1 className="text-3xl font-bold text-gray-800">Board</h1>
            <div className="flex gap-4 items-center">
              <button className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors">
                Release
              </button>
              <button className="text-gray-600 hover:bg-gray-200 p-2 rounded-md">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="flex justify-between w-full gap-4">
          {columns.map((column) => (
            <DroppableColumn
              key={column.name}
              column={column}>
              <SortableContext
                items={column.items.map((item) => item.id)}
                strategy={rectSortingStrategy}>
                {column.items.length > 0 ? (
                  column.items.map((item) => (
                    <SortableIssueCard
                      key={item.id}
                      issue={item}
                      getPriorityColor={getPriorityColor}
                    />
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">No items</div>
                )}
              </SortableContext>
            </DroppableColumn>
          ))}
        </section>

        <DragOverlay>
          {activeIssue ? (
            <div
              onClick={() => handleOpenIssue(activeIssue)}
              className="bg-white border border-[#f1f2f4] rounded-md p-3 
                            shadow-lg flex justify-between items-start cursor-move">
              <div>
                <h3 className="font-semibold text-sm text-gray-800">
                  {activeIssue.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {activeIssue.assignee}
                </p>
              </div>
              <span
                className={`h-2 w-2 rounded-full ${getPriorityColor(
                  activeIssue.priority
                )}`}></span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

