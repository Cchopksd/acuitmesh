"use server";
import { getUserToken } from "@/app/utils/token";

interface AddNewCollaborator {
  email: string;
  role: "owner" | "editor" | "viewer";
  task_board_id: string;
}

export const FetchUserCollaboration = async ({ id }: { id: string }) => {
  try {
    const token = await getUserToken();
    const response = await fetch(
      `${process.env.API_URL}/task-boards/${id}/collaborators`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          cache: "no-store",
        },
      }
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch Task board:", err);
    return null;
  }
};

export const AddNewUserCollaboration = async ({
  email,
  role,
  task_board_id,
}: AddNewCollaborator) => {
  try {
    const token = await getUserToken();
    const response = await fetch(
      `${process.env.API_URL}/task-boards/${task_board_id}/collaborators`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          cache: "no-store",
        },
        body: JSON.stringify({
          email,
          role,
          task_board_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const { data } = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch Task board:", err);
    return null;
  }
};
