import { auth } from "@clerk/nextjs/server";
import React from "react";

const SyncUser = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  return <div>SYnc USer</div>;
};

export default SyncUser;
