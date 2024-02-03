"use client";

import { downvoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import {
  downvoteQuestion,
  upvoteQuestion,
} from "@/lib/actions/question.action";
import { toggleSaveQuestion } from "@/lib/actions/user.actions";
import { formatAndDivideNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface VotesProps {
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  type: string;
  itemdId: string;
  userId: string;
  hasSaved?: boolean;
}

const Votes = ({
  upvotes,
  downvotes,
  hasUpvoted,
  hasDownvoted,
  type,
  itemdId,
  userId,
  hasSaved,
}: VotesProps) => {
  const pathName = usePathname();

  const handleSave = async () => {
    if (!userId) {
      return;
    }

    await toggleSaveQuestion({
      userId: JSON.parse(userId),
      questionId: JSON.parse(itemdId),
      path: pathName,
    });
  };

  const handleVote = async (action: string) => {
    if (!userId) {
      return;
    }

    const questionArgument = {
      questionId: JSON.parse(itemdId),
      userId: JSON.parse(userId),
      hasupVoted: hasUpvoted,
      hasdownVoted: hasDownvoted,
      path: pathName,
    };

    const answerArgument = {
      answerId: JSON.parse(itemdId),
      userId: JSON.parse(userId),
      hasupVoted: hasUpvoted,
      hasdownVoted: hasDownvoted,
      path: pathName,
    };

    if (action === "upvote") {
      if (type === "Question") {
        await upvoteQuestion(questionArgument);
      } else if (type === "Answer") {
        await upvoteAnswer(answerArgument);
      }
    } else if (action === "downvote") {
      if (type === "Question") {
        await downvoteQuestion(questionArgument);
      } else if (type === "Answer") {
        await downvoteAnswer(answerArgument);
      }
    }
  };

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasUpvoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            width={18}
            height={18}
            alt="upvote"
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />
        </div>
        <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatAndDivideNumber(upvotes)}
          </p>
        </div>
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasDownvoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            width={18}
            height={18}
            alt="downvote"
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />
        </div>
        <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatAndDivideNumber(downvotes)}
          </p>
        </div>
      </div>
      {type === "Question" && (
        <Image
          src={
            hasSaved
              ? "/assets/icons/star-filled.svg"
              : "/assets/icons/star-red.svg"
          }
          width={18}
          height={18}
          alt="star"
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
