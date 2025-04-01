"use server";
import { cookies } from "next/headers";

export const loginAction = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const cookieStore = await cookies();
    cookieStore.set("token-user", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return 200;
  } catch (err) {
    console.error("Login failed:", err);
    return null;
  }
};

