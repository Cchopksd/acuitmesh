"use server";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import KanbanBoard from "./components/Board";
import { FetchTaskBoardExTendTask } from "./action";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const boardDetail = await FetchTaskBoardExTendTask({ id: slug });

  return (
    <>
      <KanbanBoard
        boardDetail={boardDetail.data.tasks}
        taskBoardID={slug}
      />
    </>
  );
}

