import React from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, X } from "lucide-react";

import { FetchTaskBoardByUser } from "./action";
import { ROLES, hasPermission } from "@utils/checkPermission";
import { FetchUserRole } from "../action";

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
    return format(date, "d MMM yyyy", { locale: th });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Boards</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(async (board: TaskBoard) => (
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
            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-4">
              {hasPermission(
                (await FetchUserRole({ TaskBoardID: board.id })) as ROLES,
                [ROLES.OWNER]
              ) && (
                <a
                  href={`/board/${board.id}/manage-user`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer">
                  Manage User
                </a>
              )}
              <a
                href={`/board/${board.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer">
                View Board
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 right-8">
        <a
          href="/board/create-new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition duration-300">
          <Plus />
        </a>
      </div>
    </div>
  );
}
