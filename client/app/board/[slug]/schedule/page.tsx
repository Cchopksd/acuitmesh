import React from "react";
import TaskScheduler from "./components/Timeline";
import { FetchTaskBoardExtendTask } from "../action";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const boardDetail = await FetchTaskBoardExtendTask({
    id: slug,
  });
  return (
    <div>
      <TaskScheduler boardDetail={boardDetail?.data?.tasks || []} />
    </div>
  );
}

