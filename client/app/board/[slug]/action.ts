"use server";

import { decodeUserToken, getUserToken } from "@/app/utils/token";
import { JwtPayload } from "jwt-decode";
import { Task } from "./components/interfaces/types";

export const FetchTaskBoardExTendTask = async ({ id }: { id: string }) => {
  try {
    const token = await getUserToken();
    const response = await fetch(`${process.env.API_URL}/task-boards/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        cache: "no-store",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch Task board:", err);
    return null;
  }
};

export const CreateTask = async ({
  task,
  taskBoardID,
}: {
  task: Task;
  taskBoardID: string;
}) => {
  try {
    const token = await getUserToken();
    const userInfo = (await decodeUserToken()) as JwtPayload & { id: string };
    const response = await fetch(`${process.env.API_URL}/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userInfo.id, ...task }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error("Failed to create Task:", err);
    return null;
  }
};

export const UpdateTask = async ({
  task,
  taskBoardID,
}: {
  task: Task;
  taskBoardID: string;
}) => {
  try {
    const token = await getUserToken();
    const userInfo = (await decodeUserToken()) as JwtPayload & { id: string };
    const response = await fetch(`${process.env.API_URL}/tasks/${task.id}`, {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userInfo.id, ...task }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(data);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error("Failed to create Task:", err);
    return null;
  }
};

export const DeleteTask = async () => {};
