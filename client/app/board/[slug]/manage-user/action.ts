"use server";
import { getUserToken } from "@/app/utils/token";

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
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch Task board:", err);
    return null;
  }
};

