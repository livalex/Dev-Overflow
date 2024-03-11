"use client";

import { Button } from "@/components/ui/button";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageNumber: number;
  isNext: boolean;
}

const Pagination = ({ pageNumber, isNext }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (direction: string) => {
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    // We do not want to pass the scroll false parameter because we want
    // to scroll back at the top of the page
    router.push(newUrl);
  };

  // My version:
  // const onPrevClickHandler = () => {
  //   let newUrl = "";
  //   if (pageNumber - 1 <= 2) {
  //     newUrl = removeKeysFromQuery({
  //       params: searchParams.toString(),
  //       keysToRemove: ["page"],
  //     });
  //   } else {
  // newUrl = formUrlQuery({
  //   params: searchParams.toString(),
  //   key: "page",
  //   value: (pageNumber - 1).toString(),
  // });
  //   }
  //   router.push(newUrl);
  // };

  // const onNextClickHandler = () => {
  //   const newUrl = formUrlQuery({
  //     params: searchParams.toString(),
  //     key: "page",
  //     value: (pageNumber + 1).toString(),
  //   });

  //   router.push(newUrl);
  // };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button
        className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        disabled={pageNumber <= 1}
        onClick={() => handleNavigation("prev")}
      >
        <p className="body-medium text-dark200_light800">Prev</p>
      </Button>
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>
      <Button
        className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
      >
        <p className="body-medium text-dark200_light800">Next</p>
      </Button>
    </div>
  );
};

export default Pagination;
