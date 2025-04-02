import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export const getUserToken = async () => {
  const cookieStore = await cookies();

  const userToken = cookieStore.get("token-user");

  return userToken?.value;
};

export const decodeUserToken = async () => {
  const token = await getUserToken();
  if (!token) {
    console.error("Token is not defined");
    return;
  }
  const decoded = jwtDecode(token as string);

  return decoded;
};

export const destroyUserToken = async () => {
  const cookieStore = await cookies();

  cookieStore.delete("token-user");

  return;
};

