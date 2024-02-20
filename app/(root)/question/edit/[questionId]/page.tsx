interface EditQuestionDetailsParams {
  params: {
    questionId: string;
  };
}

const EditQuestionDetails = ({ params }: EditQuestionDetailsParams) => {
  const questionId = params.questionId;
  console.log(questionId);

  return <div>EditQuestionDetails</div>;
};

export default EditQuestionDetails;
