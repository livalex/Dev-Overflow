"use server";

import Question from "@/database/question.model";
import { connectedToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

export async function getHotQuestions() {
  try {
    connectedToDatabase();

    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    connectedToDatabase();
    const { questionId, title, content, path } = params;

    const question = await Question.findById(questionId).populate("tags");

    if (!question) throw new Error("Question not found");

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectedToDatabase();
    const { questionId, path } = params;

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectedToDatabase();
    const { questionId, userId, path, hasupVoted, hasdownVoted } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectedToDatabase();
    const { questionId, userId, path, hasupVoted, hasdownVoted } = params;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestions(params: GetQuestionsParams) {
  try {
    // connect to DB
    connectedToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipAmount = pageSize * (page - 1);

    // Question.find({}) finds all the questions
    // If a specific questions has tags, we want to populate
    // that path so we can display them. That is because MongoDB,
    // by default, doesn't keep full data on the Question model,
    // just some references on types like Objects and Arrays.
    // Finally, it sorts them from most recent to the oldest.
    // const questions = await Question.find({})
    //   .populate({ path: "tags", model: Tag })
    //   .populate({ path: "author", model: User })
    //   .sort({ createdAt: -1 });

    const query: FilterQuery<typeof Question> = searchQuery
      ? {
          $or: [
            { title: { $regex: new RegExp(searchQuery, "i") } },
            { content: { $regex: new RegExp(searchQuery, "i") } },
          ],
        }
      : {};

    // OR Adrian's way

    // const query: FilterQuery<typeof Question> = {};

    // if(searchQuery) {
    //   query.$or = [
    //     { title: { $regex: new RegExp(searchQuery, "i")}},
    //     { content: { $regex: new RegExp(searchQuery, "i")}},
    //   ]
    // }
    let sortOptions = {};

    if (filter === "newest") {
      sortOptions = { createdAt: -1 };
    } else if (filter === "frequent") {
      sortOptions = { views: -1 };
    } else if (filter === "unanswered") {
      query.answers = { $size: 0 };
    }

    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);

    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
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
        { $setOnInsert: { name: tag }, $push: { questions: question._id } }, // do some things on it
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
