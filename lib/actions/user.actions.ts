"use server";

import User from "@/database/user.model";
import { connectedToDatabase } from "../mongoose";

export async function getUserById(params: any) {
  try {
    // always connect to the database first
    connectedToDatabase();
    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
