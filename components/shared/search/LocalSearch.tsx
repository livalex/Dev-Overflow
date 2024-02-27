"use client";

import { Input } from "@/components/ui/input";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  // Maybe we share an URL with a query
  const [searchInput, setSearchInput] = useState(query || "");

  // Managing the application data through the URL will not only remove the need
  // to use states and make almost everything client-side but also make the
  // application more shareable and SEO-optimized. You can directly share the
  // above URL, and you’ll get the right results anytime.

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "/";
      if (searchInput) {
        newUrl = formUrlQuery({
          // params will be q=lala&p=bebe for http://localhost:3000/?q=lala&p=bebe
          params: searchParams.toString(),
          key: "q",
          value: searchInput,
        });
      } else {
        if (pathname === route) {
          newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["q"],
          });
        }
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, route, pathname, router, searchParams, query]);

  const SearchIcon = () => (
    <Image
      src={imgSrc}
      alt="search icon"
      width={24}
      height={24}
      className="cursor-pointer"
    />
  );

  const onChangeHandler = (e: any) => {
    setSearchInput(e.target.value);
  };

  return (
    <div
      className={`background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && <SearchIcon />}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={onChangeHandler}
        className="background-light800_darkgradient paragraph-regular no-focus placeholder border-none shadow-none outline-none"
      />

      {iconPosition === "right" && <SearchIcon />}
    </div>
  );
};

export default LocalSearch;
