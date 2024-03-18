import { BADGE_CRITERIA } from "@/constants";

export interface SidebarLink {
  imgURL: string;
  route: string;
  label: string;
}

export interface Tag {
  _id: string;
  name: string;
  totalQuestions: number;
}

export interface Question {
  _id: number;
  title: string;
}

export interface Job {
  id?: string;
  employer_name?: string;
  employer_logo?: string | undefined;
  employer_website?: string;
  job_employment_type?: string;
  job_title?: string;
  job_description?: string;
  job_apply_link?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
}

export interface Country {
  name: {
    common: string;
  };
}

export interface ParamsProps {
  params: { id: string };
}

export interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

export interface URLProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export interface BadgeCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}

// As you might already know, the typeof operator gives you the type of an object. In the above example of Person interface, we already knew the type, so we just had to use the keyof operator on type Person.

// But what to do when we don't know the type of an object or we just have a value and not a type of that value like the following?

// const bmw = { name: "BMW", power: "1000hp" }
// This is where we use keyof typeof together.

// The typeof bmw gives you the type: { name: string, power: string }

// And then keyof operator gives you the literal type union as shown in the following code:

// type CarLiteralType = keyof typeof bmw

// let carPropertyLiteral: CarLiteralType
// carPropertyLiteral = "name"       // OK
// carPropertyLiteral = "power"      // OK
// carPropertyLiteral = "anyOther"   // Error...

export type BadgeCriteriaType = keyof typeof BADGE_CRITERIA;
