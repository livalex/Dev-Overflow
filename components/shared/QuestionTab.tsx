import { getUserQuestions } from "@/lib/actions/user.actions";
import Pagination from "@/components/shared/Pagination";
import { SearchParamsProps } from "@/types";
import QuestionCard from "../cards/QuestionCard";

interface QuestionTabInterface extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const QuestionTab = async ({
  searchParams,
  userId,
  clerkId,
}: QuestionTabInterface) => {
  const page = searchParams.page ?? "1";

  const userQuestions = await getUserQuestions({
    userId,
    page: +page,
  });

  return (
    <>
      {userQuestions.questions.map((question) => (
        <QuestionCard
          key={question._id}
          _id={question._id}
          clerkId={clerkId}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
        />
      ))}
      <div className="mt-10">
        <Pagination pageNumber={+page} isNext={userQuestions.isNext} />
      </div>
    </>
  );
};

export default QuestionTab;
