"use server";
export const registerAction = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${process.env.API_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("Login failed:", err);
    return null;
  }
};

