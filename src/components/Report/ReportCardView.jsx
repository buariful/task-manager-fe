import moment from "moment";
import React from "react";
import { formatName } from "Utils/utils";

export default function ReportCardView({ data }) {
  return (
    <div className="p-3 border border-[#f5f5f5] max-w-[30.18rem] mx-auto ">
      <div className="grid grid-cols-10 gap-5">
        <div className="flex items-center col-span-5 gap-3 mb-5">
          <div className="w-20 h-20 rounded-full bg-[#e6e6e6]"></div>
          <div className="text-accent">
            <h3 className="font-semibold text-2xl">
              {formatName(
                data?.participant?.first_name,
                data?.participant?.last_name,
                data?.worksheet?.report_template?.name_option
              )}
              {/* {data?.participant?.first_name} {data?.participant?.last_name} */}
            </h3>

            <p className="capitalize font-normal text-xs">
              {data?.level?.name}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end pt-5 pb-7 col-span-5">
          <p>{data?.worksheet?.course_code}</p>

          <div className="flex items-start flex-wrap gap-3">
            {data?.heading_items?.map((item, i) => (
              <div key={i}>
                <p className="text-[0.48rem]">{item?.title}</p>
                <p className="text-[0.55rem]">{item?.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-5">
        <div className="col-span-6  ">
          <div className="flex flex-col font-open-sans gap-5 mb-12">
            <p className="text-sm font-medium font-roboto">Skills</p>
            {data?.skill_result?.map((item) => (
              <p className="text-xs" key={item?.skill_id}>
                {item?.name}
              </p>
            ))}
          </div>
        </div>

        <div className="col-span-2  ">
          <div className="flex flex-col items-center gap-5 mb-12">
            <p className="text-sm font-medium font-roboto">Pass</p>

            {data?.skill_result?.map((skill, i) => (
              // <input
              //   key={`pass-${i}`}
              //   name={skill?.skill_id}
              //   type="radio"
              //   className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              //   checked={skill?.pass === true}
              //   disabled
              // />
              <div
                key={i}
                className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center"
              >
                {skill.pass ? (
                  <div className="w-2 h-2 rounded bg-primary"></div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col items-center gap-5">
          <p className="text-sm font-medium font-roboto">Fail</p>

          {data?.skill_result?.map((skill, i) => (
            // <input
            //   key={`fail-${i}`}
            //   name={skill?.skill_id}
            //   type="radio"
            //   className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            //   checked={skill?.pass === false}
            //   disabled
            // />
            <div
              key={i}
              className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center"
            >
              {!skill.pass ? (
                <div className="w-2 h-2 rounded bg-primary"></div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="col-span-6">
          {data?.comment ? (
            <>
              <p className="text-sm font-medium font-roboto mb-2">Comments</p>
              <p className="text-xs font-open-sans">{data?.comment}</p>
            </>
          ) : null}
        </div>
        <div className="col-span-4">
          {data?.comment ? (
            <>
              <p className="text-sm font-medium font-roboto mb-2">
                {" "}
                Next Level Recommendation
              </p>
              <p className="text-xs font-open-sans">{data?.next_level?.name}</p>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-10 text-neutral-gray text-sm">
        Created On {moment(data?.created_at)?.format("MMM DD, YYYY")}
      </p>
    </div>
  );
}
