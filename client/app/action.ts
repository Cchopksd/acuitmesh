"use server";
import { JwtPayload } from "jwt-decode";
import { decodeUserToken, getUserToken } from "@utils/token";

export const FetchUserRole = async ({
  TaskBoardID,
}: {
  TaskBoardID: string;
}) => {
  try {
    const token = await getUserToken();
    const userInfo = (await decodeUserToken()) as JwtPayload & { id: string };

    if (!userInfo) {
      throw new Error("Failed to decode user token: userInfo is undefined");
    }

    const response = await fetch(
      `${process.env.API_URL}/task-boards/${TaskBoardID}/check-collaborators-permission/user_id/${userInfo.id}`,
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

    const { data } = await response.json();
    return data.role;
  } catch (err) {
    console.error("Failed to fetch Task board:", err);
    return null;
  }
};
