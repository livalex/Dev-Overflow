import { getUserAnswers } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";
import AnswerCard from "../cards/AnswerCard";

interface AnswerTabInterface extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({
  searchParams,
  userId,
  clerkId,
}: AnswerTabInterface) => {
  const page = searchParams.page ?? "1";

  const userAnswers = await getUserAnswers({
    userId,
    page: +page,
  });

  return (
    <>
      {userAnswers.answers.map((answer) => (
        <AnswerCard
          key={answer._id}
          _id={answer._id}
          clerkId={clerkId}
          question={answer.question}
          author={answer.author}
          upvotes={answer.upvotes.length}
          createdAt={answer.createdAt}
        />
      ))}
      <div className="mt-10">
        <Pagination pageNumber={+page} isNext={userAnswers.isNext} />
      </div>
    </>
  );
};

export default AnswersTab;
