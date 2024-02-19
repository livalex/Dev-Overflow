import { getUserAnswers } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "../ui/pagination";
import AnswerCard from "../cards/AnswerCard";

interface AnswerTabInterface extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}

const AnswersTab = async ({
  searchProps,
  userId,
  clerkId,
}: AnswerTabInterface) => {
  const pageSize = 10;

  const userAnswers = await getUserAnswers({
    userId,
    page: 1,
    pageSize,
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
      {userAnswers.totalAnswers > pageSize && (
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

export default AnswersTab;
