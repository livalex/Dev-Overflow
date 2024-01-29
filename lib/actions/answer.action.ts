"use server";
// There's no use client counter part called use server, rather use server is used, as of now, to mark actions exclusively.
// So use server should be used in a file, with nothing but server actions.

import Answer from "@/database/answer.model";
import { connectedToDatabase } from "../mongoose";
import { CreateAnswerParams, GetAnswersParams } from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function getAnswers(params: GetAnswersParams) {
  try {
    connectedToDatabase();

    const { questionId } = params;

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

    // 2. Adrian's way
    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .sort({ createdAt: -1 });

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
