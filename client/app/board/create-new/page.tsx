import React from "react";
import TaskBoardForm from "./components/Form";

export default async function page() {
  return (
    <div className='h-full flex justify-center items-center'>
      <TaskBoardForm />
    </div>
  );
}
