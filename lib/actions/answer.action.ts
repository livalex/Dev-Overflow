"use server";
// There's no use client counter part called use server, rather use server is used, as of now, to mark actions exclusively.
// So use server should be used in a file, with nothing but server actions.

import Answer from "@/database/answer.model";
import { connectedToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    connectedToDatabase();

    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) throw new Error("Answer not found");

    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );
    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    connectedToDatabase();
    const { answerId, userId, path, hasupVoted, hasdownVoted } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
      };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { upvotes: userId },
      };
    }

    // In Mongoose 4.0, the default value for the new option of findByIdAndUpdate
    // (and findOneAndUpdate) has changed to false, which means returning the old
    // doc. So you need to explicitly set the option to true to get the new version
    // of the doc, after the update is applied
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    connectedToDatabase();
    const { answerId, userId, path, hasupVoted, hasdownVoted } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
      };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { downvotes: userId },
      };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    connectedToDatabase();

    const { questionId, sortBy } = params;

    // 1. My way
    // const answers = await Question.findById(questionId).populate({
    //   path: "answers",
    //   populate: {
    //     path: "author",
    //     model: User,
    //     select: "_id clerkId name picture",
    //   },
    //   options: {
    //     sort: {
    //       createdAt: -1,
    //     },
    //   },
    // });

    let sortOptions = {};

    if (sortBy === "highestUpvotes") {
      sortOptions = { upvotes: -1 };
    } else if (sortBy === "lowestUpvotes") {
      sortOptions = { upvotes: 1 };
    } else if (sortBy === "recent") {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === "old") {
      sortOptions = { createdAt: 1 };
    }

    // 2. Adrian's way
    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .sort(sortOptions);

    return { answers };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectedToDatabase();

    const { author, content, question, path } = params;

    const newAnswer = await Answer.create({
      author,
      content,
      question,
    });

    // Add the answer to the question's answer array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // just refreshes the home page path so that the new question appears
    // Definition: allows you tu purge cached data on-demand for a specific path
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
