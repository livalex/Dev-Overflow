"use server";

import Question from "@/database/question.model";
import { connectedToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import Answer from "@/database/answer.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";

export async function globalSearch(params: SearchParams) {
  try {
    connectedToDatabase();

    let results = [];
    const { query, type } = params;
    const regexQuery = { $regex: query, $options: "i" };

    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question", id: "_id" },
      { model: Answer, searchField: "content", type: "answer", id: "question" },
      { model: Tag, searchField: "name", type: "tag", id: "_id" },
      { model: User, searchField: "name", type: "user", id: "clerkId" },
    ];

    const typeLower = type?.toLowerCase();

    if (
      typeLower &&
      ["question", "answer", "tag", "user"].includes(typeLower)
    ) {
      const searchedModel = modelsAndTypes.find((model) => model.type === type);

      if (!searchedModel) throw new Error("Invalid search type");

      const queryResults = await searchedModel!.model
        .find({ [searchedModel.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((item) => ({
        title:
          type === "answer"
            ? `Answers containing ${query}`
            : item[searchedModel.searchField],
        type,
        id: item[searchedModel.id],
      }));
    } else {
      // YOU CAN NOT USE async / await WITH forEach OR map, use for...of instead
      for (const { model, searchField, type, id } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

        results.push(
          ...queryResults.map((item) => ({
            title:
              type === "answer"
                ? `Answers containing ${query}`
                : item[searchField],
            type,
            id: item[id],
          }))
        );
      }
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
