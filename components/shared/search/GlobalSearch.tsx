"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import GlobalResult from "./GlobalResult";

const GlobalSearch = () => {
  const searchContainerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  // Maybe we share an URL with a query
  const [searchInput, setSearchInput] = useState(query || "");
  const [isOpened, setIsOpened] = useState(false);

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
          key: "global",
          value: searchInput,
        });
      } else {
        // if the query from the local search exists, delete the search from global
        if (query) {
          newUrl = removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["global", "type"],
          });
        }
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, router, pathname, searchParams, query]);

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        searchContainerRef.current &&
        // @ts-ignore
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsOpened(false);
        setSearchInput("");
      }
    };

    setIsOpened(false);
    // As with all event listeners, if we use them inside
    // the useEffect, we have to clear them
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [pathname]);

  return (
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />
        <Input
          type="text"
          placeholder="Search anything globally..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!isOpened) setIsOpened(true);
            if (e.target.value === "" && isOpened) setIsOpened(false);
          }}
          className="text-dark400_light700 paragraph-regular no-focus placeholder background-light800_darkgradient border-none shadow-none outline-none"
        />
      </div>
      {isOpened && <GlobalResult />}
    </div>
  );
};

export default GlobalSearch;
