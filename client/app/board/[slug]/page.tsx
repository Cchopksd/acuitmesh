"use server";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import Board from "./components/Board";
import { FetchTaskBoardExTendTask } from "./action";
import { decodeUserToken } from "@/app/utils/token";
import { FetchUserRole } from "@/app/action";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const boardDetail = await FetchTaskBoardExTendTask({ id: slug });

  const role = await FetchUserRole({ TaskBoardID: slug });

  return (
    <>
      <Board
        boardDetail={boardDetail.data.tasks}
        taskBoardID={slug}
        userRole={role}
      />
    </>
  );
}
