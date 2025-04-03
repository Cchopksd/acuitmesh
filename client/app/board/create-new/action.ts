"use server";

import { decodeUserToken, getUserToken } from "@/app/utils/token";

interface AddNewBoard {
  title: string;
  description: string;
}

export const AddNewBoardCollaboration = async ({
  title,
  description,
}: AddNewBoard) => {
  try {
    const token = await getUserToken();
    const userInfo = (await decodeUserToken()) as { id: string };
    const response = await fetch(`${process.env.API_URL}/task-boards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        cache: "no-store",
      },
      body: JSON.stringify({
        title,
        user: userInfo.id,
        role: "owner",
        description,
      }),
    });

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
