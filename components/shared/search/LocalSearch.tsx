"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";

interface LocalSearchProps {
  route: string;
  iconPosition: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({
  route,
  iconPosition,
  imgSrc,
  placeholder,
  otherClasses,
}: LocalSearchProps) => {
  const SearchIcon = () => (
    <Image
      src={imgSrc}
      alt="search icon"
      width={24}
      height={24}
      className="cursor-pointer"
    />
  );

  return (
    <div
      className={`background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && <SearchIcon />}
      <Input
        type="text"
        placeholder={placeholder}
        value=""
        onChange={() => {}}
        className="background-light800_darkgradient paragraph-regular no-focus placeholder border-none shadow-none outline-none"
      />

      {iconPosition === "right" && <SearchIcon />}
    </div>
  );
};

export default LocalSearch;
