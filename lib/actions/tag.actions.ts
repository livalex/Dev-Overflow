"use server";

import User from "@/database/user.model";
import { connectedToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Question from "@/database/question.model";

export async function getTopPopularTags() {
  try {
    connectedToDatabase();

    // find results can only include content from the docs themselves, while
    // aggregate can project new values that are derived from the doc's content
    // (like an array's length)

    // $project reshapes our tag and what we want to get back

    const topPopularTags = Tag.aggregate([
      {
        $project: { name: "$name", numberOfQuestions: { $size: "$questions" } },
      },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return topPopularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectedToDatabase();

    const { tagId, searchQuery } = params;
    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!tag) throw new Error("Tag not found");

    const tagQuestions = tag.questions;

    return { tagTitle: tag.name, questions: tagQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectedToDatabase();

    const { searchQuery } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { name: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    const tags = await Tag.find(query);

    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

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
