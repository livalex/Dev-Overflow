import { getUserById, getUserQuestions } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchParamsProps } from "@/types";
import QuestionCard from "../cards/QuestionCard";

interface QuestionTabInterface extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const QuestionTab = async ({
  searchProps,
  userId,
  clerkId,
}: QuestionTabInterface) => {
  const pageSize = 10;

  const userQuestions = await getUserQuestions({
    userId,
    page: 1,
    pageSize,
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
      {userQuestions.totalQuestions > pageSize && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default QuestionTab;
