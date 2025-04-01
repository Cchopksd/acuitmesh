export const FetchTaskBoardExTendTask = async () => {
  try {
    const response = await fetch(`${process.env.API_URL}/task-boards`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
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
