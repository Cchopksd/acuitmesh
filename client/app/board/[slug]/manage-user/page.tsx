import React from "react";
import { FetchUserCollaboration } from "./action";
import CollaborationBoard from "./components/CollaborationBoard";

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await FetchUserCollaboration({ id: slug });

  return (
    <main>
      <CollaborationBoard data={data} />
    </main>
  );
}

