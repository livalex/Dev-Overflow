import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.actions";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs";

const EditQuestionDetails = async ({ params }: ParamsProps) => {
  const { userId } = auth();

  if (!userId) return null;

  const questionId = params.id;
  const mongoUser = await getUserById({ userId });
  const questionDetails = await getQuestionById({ questionId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
        <Question
          type="Edit"
          mongoUserId={JSON.stringify(mongoUser?._id)}
          questionDetails={JSON.stringify(questionDetails)}
        />
      </div>
    </>
  );
};

export default EditQuestionDetails;
