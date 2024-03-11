import QuestionCard from "@/components/cards/QuestionCard";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import LocalSearch from "@/components/shared/search/LocalSearch";
import { QuestionFilters } from "@/constants/filters";
import { auth } from "@clerk/nextjs";
import { getSavedQuestions } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import Pagination from "@/components/shared/Pagination";

export default async function Home({ searchParams }: SearchParamsProps) {
  const { userId } = auth();
  const searchQuery = searchParams.q;
  const filter = searchParams.filter;
  const page = searchParams.page ?? "1";

  if (!userId) {
    return null;
  }

  const savedQuestions = await getSavedQuestions({
    clerkId: userId,
    searchQuery,
    filter,
    page: +page,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/collection"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>
      <div className="mt-10 flex w-full flex-col gap-6">
        {savedQuestions.questions.length > 0 ? (
          savedQuestions.questions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There are no saved questions to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the
            discussion. our query could be the next big thing others learn from. Get
            involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
      <div className="mt-10">
        <Pagination pageNumber={+page} isNext={savedQuestions.isNext} />
      </div>
    </>
  );
}
