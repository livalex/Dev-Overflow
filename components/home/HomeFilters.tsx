"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

const HomeFilters = () => {
  // ?? is a logical operator that returns its right-hand
  // side operand when its left-hand side operand
  // is null or undefined
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("filter");

  const onHomePageFilterClickHandler = (value: string) => {
    let newUrl = "/";

    if (value !== active) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: value.toLowerCase(),
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ["filter"],
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          onClick={() => onHomePageFilterClickHandler(item.value)}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none
            ${
              active === item.value
                ? "bg-primary-100 text-primary-500 dark:bg-dark-400 dark:text-primary-500"
                : "bg-light-800 text-light-500 dark:bg-dark-300"
            }`}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
