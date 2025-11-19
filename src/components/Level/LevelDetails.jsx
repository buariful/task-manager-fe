import { Card } from "Components/Card";
import React from "react";
import { JsonParse } from "Utils/utils";

const Title = ({ text }) => {
  return <p className="text-sm text-accent font-normal mb-2">{text}</p>;
};

const Section = ({ title, content }) => {
  return (
    <div className="mb-6">
      <Title text={title} />
      <p className="text-lg font-normal">{content}</p>
    </div>
  );
};

export default function LevelDetails({ data }) {
  const file_urls = JsonParse(data?.file_urls) || [];
  return (
    <Card>
      <Section
        title={"Next Recommended Level"}
        content={data?.next_recommended_level?.name}
      />
      <Section title={"Description"} content={data?.description} />
      <Section
        title={"Minimum Percentage Required to Pass"}
        content={`${data?.min_percentage}%`}
      />

      {file_urls?.length ? (
        <div className="mb-6">
          <Title text={"Attachments"} />

          {file_urls?.map((item, i) => (
            <div className="flex flex-wrap gap-2 items-center ">
              <p className="rounded text-xs p-2 border border-neutral-gray text-neutral-gray">
                {item?.name}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <Section
        title={"Report Card Template"}
        content={data?.report_card_template?.name}
      />
    </Card>
  );
}
