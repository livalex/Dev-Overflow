"use server";

import User from "@/database/user.model";
import { connectedToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import { FilterQuery } from "mongoose";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectedToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;
    const skipAmount = pageSize * (page - 1);

    const totalAnswers = await Answer.countDocuments({ author: userId });

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");

    const isNext = totalAnswers > skipAmount + userAnswers.length;

    return { totalAnswers, answers: userAnswers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectedToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;
    const skipAmount = pageSize * (page - 1);

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");

    // const questions = await Question.find({ author: userId })
    //   .skip(pageSize * (page - 1))
    //   .limit(pageSize)
    //   .sort({ upvotes: -1 });

    const isNext = totalQuestions > skipAmount + userQuestions.length;

    return { totalQuestions, questions: userQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectedToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return {
      user,
      totalQuestions,
      totalAnswers,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectedToDatabase();

    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipAmount = pageSize * (page - 1);

    const query: FilterQuery<typeof Question> = searchQuery
      ? {
          $or: [
            { title: { $regex: new RegExp(searchQuery, "i") } },
            { content: { $regex: new RegExp(searchQuery, "i") } },
          ],
        }
      : {};

    let sortOptions = {};

    if (filter === "most_recent") {
      sortOptions = { createdAt: -1 };
    } else if (filter === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (filter === "most_voted") {
      sortOptions = { upvotes: -1 };
    } else if (filter === "most_viewed") {
      sortOptions = { views: -1 };
    } else if (filter === "most_answered") {
      sortOptions = { answers: -1 };
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        skip: skipAmount,
        limit: pageSize + 1,
        sort: sortOptions,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const filteredSavedQuestions = user.saved;

    const isNext = user.saved.length > pageSize;

    return { questions: filteredSavedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectedToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { saved: questionId },
        },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { saved: questionId },
        },
        { new: true }
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectedToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipAmount = pageSize * (page - 1);

    const query: FilterQuery<typeof User> = searchQuery
      ? {
          $or: [
            { name: { $regex: new RegExp(searchQuery, "i") } },
            { username: { $regex: new RegExp(searchQuery, "i") } },
          ],
        }
      : {};

    let sortOptions = {};

    if (filter === "new_users") {
      sortOptions = { joinedAt: -1 };
    } else if (filter === "old_users") {
      sortOptions = { joinedAt: 1 };
    } else if (filter === "top_contributors") {
      sortOptions = { reputation: -1 };
    }

    // It sorts them from most recent to the oldest.
    const users = await User.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalUsers = await User.countDocuments(query);

    const isNext = totalUsers > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserById(params: GetUserByIdParams) {
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

export async function createUser(userData: CreateUserParams) {
  try {
    connectedToDatabase();
    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectedToDatabase();

    const { clerkId, updateData, path } = params;

    // creates new instance of the user in the database
    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectedToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete user from database and also questions, answers, comments, etc.

    // get user question ids
    // distinct = Creates a distinct query: returns the distinct values of the given field that match filter.
    // const userQuestionIds = await Question.find({
    //   author: user._id,
    // }).distinct("_id");

    // delete user questions
    await Question.deleteMany({ author: user._id });

    // userQuestionIds we use this because we need to delete the anwsers , commnets etc. also later

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
