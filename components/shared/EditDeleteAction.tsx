"use client";

import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.action";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  type: string;
  itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
  const router = useRouter();
  const pathName = usePathname();

  const editHandler = () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };

  const deleteHandler = async () => {
    if (type === "Question") {
      await deleteQuestion({ questionId: JSON.parse(itemId), path: pathName });
    } else if (type === "Answer") {
      await deleteAnswer({ answerId: JSON.parse(itemId), path: pathName });
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 max-sm:w-full">
      {type === "Question" && (
        <Image
          alt="Edit"
          src="/assets/icons/edit.svg"
          width={14}
          height={14}
          className="cursor-pointer object-contain"
          onClick={editHandler}
        />
      )}
      <Image
        alt="Delete"
        src="/assets/icons/trash.svg"
        width={14}
        height={14}
        onClick={deleteHandler}
      />
    </div>
  );
};

export default EditDeleteAction;