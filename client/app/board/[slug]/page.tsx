"use server";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import Board from "./components/Board";
import { FetchTaskBoardExtendTask } from "./action";
import { decodeUserToken } from "@/app/utils/token";
import { FetchUserRole } from "@/app/action";
import { Priorities, Statuses } from "./components/interfaces/types";

export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { status, priority } = await searchParams;
  const boardDetail = await FetchTaskBoardExtendTask({
    id: slug,
    statuses: (status as Statuses) || (status as Statuses[]),
    priorities: (priority as Priorities[]) || (priority as Priorities),
  });

  const role = await FetchUserRole({ TaskBoardID: slug });

  return (
    <>
      <Board
        boardDetail={boardDetail?.data?.tasks || []}
        taskBoardID={slug}
        userRole={role}
      />
    </>
  );
}
