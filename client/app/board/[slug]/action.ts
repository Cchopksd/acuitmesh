"use server";

import { decodeUserToken, getUserToken } from "@/app/utils/token";
import { JwtPayload } from "jwt-decode";
import { Priorities, Statuses, Task } from "./components/interfaces/types";

export const FetchTaskBoardExtendTask = async ({
  id,
  statuses,
  priorities,
}: {
  id: string;
  statuses?: Statuses[] | Statuses;
  priorities?: Priorities[] | Priorities;
}) => {
  try {
    const token = await getUserToken();

    let query: string[] = [];

    if (Array.isArray(priorities) && priorities.length > 0) {
      priorities.forEach((element) => {
        query.push(`priority=${element}`);
      });
    } else if (priorities) {
      query.push(`priority=${priorities}`);
    }

    if (Array.isArray(statuses) && statuses.length > 0) {
      statuses.forEach((element) => {
        query.push(`status=${element}`);
      });
    } else if (statuses) {
      query.push(`status=${statuses}`);
    }

    const response = await fetch(
      `${process.env.API_URL}/task-boards/${id}?${query.join("&")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error("Failed to create Task:", err);
    return null;
  }
};

export const DeleteTask = async () => {};

