import { formatAndDivideNumber } from "@/lib/utils";
import { BadgeCounts } from "@/types";
import Image from "next/image";

interface Props {
  totalQuestions: number;
  totalAnswers: number;
  badgeCounts: BadgeCounts;
  reputation: number;
}

interface StatsCardInterface {
  imgUrl: string;
  alt: string;
  value: number;
  title: string;
}

const StatsCard = ({ imgUrl, alt, value, title }: StatsCardInterface) => {
  return (
    <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-evenly gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200">
      <Image src={imgUrl} alt={alt} width={40} height={50} />
      <div>
        <p className="paragraph-semibold text-dark200_light900">{value}</p>
        <p className="body-medium text-dark400_light700">{title}</p>
      </div>
    </div>
  );
};

const Stats = ({
  totalQuestions,
  totalAnswers,
  badgeCounts,
  reputation,
}: Props) => {
  return (
    <div className="mt-10">
      <h4 className="h3-semibold text-dark200_light900">
        Stats - {reputation}
      </h4>
      <div className="mt-5 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        <div className="light-border background-light900_dark300 flex flex-wrap items-center justify-evenly gap-4 rounded-md border p-6 shadow-light-300 dark:shadow-dark-200">
          <div>
            <p className="paragraph-semibold text-dark200_light900">
              {formatAndDivideNumber(totalQuestions)}
            </p>
            <p className="body-medium text-dark400_light700">Questions</p>
          </div>
          <div>
            <p className="paragraph-semibold text-dark200_light900">
              {formatAndDivideNumber(totalAnswers)}
            </p>
            <p className="body-medium text-dark400_light700">Answers</p>
          </div>
        </div>
        <StatsCard
          imgUrl="/assets/icons/gold-medal.svg"
          alt="gold medal icon"
          title="Gold Badges"
          value={badgeCounts.GOLD}
        />
        <StatsCard
          imgUrl="/assets/icons/silver-medal.svg"
          alt="silver medal icon"
          title="Silver Badges"
          value={badgeCounts.SILVER}
        />
        <StatsCard
          imgUrl="/assets/icons/bronze-medal.svg"
          alt="bronze medal icon"
          title="Bronze Badges"
          value={badgeCounts.BRONZE}
        />
      </div>
    </div>
  );
};

export default Stats;
