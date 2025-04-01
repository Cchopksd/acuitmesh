import { MoreHorizontal } from "lucide-react";
import React from "react";
import KanbanBoard from "./components/Board";

export default function page() {
  return (
    <>
      <section className="my-6">
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
      <KanbanBoard />
    </>
  );
}

