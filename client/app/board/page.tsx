import React from "react";
import { FetchTaskBoardByUser } from "./action";

type TaskBoard = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export default async function TaskBoardPage() {
  const { data } = await FetchTaskBoardByUser();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Boards</h1>

      {data.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-600 text-lg">No task boards found.</p>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer py-2 px-4 rounded-md transition duration-300">
            Create New Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((board: TaskBoard) => (
            <div
              key={board.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {board.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {board.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Created: {formatDate(board.created_at)}</span>
                  <span>Updated: {formatDate(board.updated_at)}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <a
                  href={`/board/${board.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer">
                  View Board
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

