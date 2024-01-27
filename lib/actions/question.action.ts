"use server";

import Question from "@/database/question.model";
import { connectedToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import {
  CreateQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { get } from "http";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    // connect to DB
    connectedToDatabase();

    // Question.find({}) finds all the questions
    // If a specific questions has tags, we want to populate
    // that path so we can display them. That is because MongoDB,
    // by default, doesn't keep full data on the Question model,
    // just some references on types like Objects and Arrays.
    // Finally, it sorts them from most recent to the oldest.
    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    // connect to DB
    connectedToDatabase();

    const { questionId } = params;

    // The question has only references to tags for example, you get the actual objects with the populate method.
    // Additionally, select specifies the only fields you want to get.
    const question = await Question.findById(questionId)
      .populate({
        path: "tags",
        model: Tag,
        select: "_id name",
      })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    // connect to DB
    connectedToDatabase();

    const { title, content, tags, author, path } = params;

    // Create the question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // Create the tags or get them if they already exist
    for (const tag of tags) {
      // - it searches for a document in the Tag collection where the name matches the provided regular expression
      // - if it finds such a document, it updates it by pushing the ID of a question into the question array field
      // - if no matching document is fouund, it iserts a new document with the name set to the value tag variable and adds the question ID to the question array
      // - It returns the updated or newly created document as a result
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } }, // find something
        { $setOnInsert: { name: tag }, $push: { question: question._id } }, // do some things on it
        { upsert: true, new: true } // aditional options
      );

      tagDocuments.push(existingTag._id);
    }

    // push the tags in the question
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // just refreshes the home page path so that the new question appears
    // Definition: allows you tu purge cached data on-demand for a specific path
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
