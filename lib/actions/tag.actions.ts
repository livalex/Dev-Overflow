"use server";

import User from "@/database/user.model";
import { connectedToDatabase } from "../mongoose";
import { GetTopInteractedTagsParams } from "./shared.types";

export async function getUserTopInteractedTags(
  params: GetTopInteractedTagsParams
) {
  try {
    connectedToDatabase();

    // const { userId, limit = 3 } = params;
    const { userId } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    // Find interactions for the user and group by tags...

    const tags = [
      {
        _id: "0",
        name: "Java",
      },
      {
        _id: "1",
        name: "NextJS",
      },
      {
        _id: "1",
        name: "Python",
      },
    ];

    return tags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
