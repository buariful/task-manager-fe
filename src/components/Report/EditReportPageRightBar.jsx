import React from "react";

const Heading = ({ title, text }) => {
  return (
    <div>
      <p className="text-neutral-gray text-xs">{title}</p>
      <p className="text-accent font-medium text-sm">{text}</p>
    </div>
  );
};

export default function EditReportPageRightBar({
  levels,
  activeParticipant = {},
  setActiveParticipant = () => {},
  allParticipants = [],
  setAllParticipants = () => {},
  selectedLevel,
  setSelectedLevel = () => {},
  template = {},
}) {
  const handleComment = (e) => {
    try {
      const participantMod = {
        ...activeParticipant,
        comment: e?.target?.value,
      };

      setActiveParticipant({ ...activeParticipant, comment: e?.target?.value });
      setAllParticipants((prev) =>
        prev?.map((item) => {
          if (item?.id === activeParticipant?.id) {
            return participantMod;
          } else return item;
        })
      );
    } catch (error) {
      console.log("handleComment->>", error?.message);
    }
  };

  return (
    <div className="p-3">
      <div className="flex flex-wrap gap-5 items-center mb-5">
        {activeParticipant?.heading_items?.map((item, i) => (
          <Heading
            key={`heading_${i}`}
            text={item?.value}
            title={item?.title}
          />
        ))}
      </div>

      {template?.comment ? (
        <div className="mb-5">
          <label className={`mb-2 block cursor-pointer text-sm font-[400] `}>
            Comment
          </label>
          <textarea
            className={`focus:shadow-outline border-0 focus:ring-0 w-full border-b border-b-accent  appearance-none bg-input-bg px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none `}
            cols={30}
            name={"comment"}
            placeholder={"Comment"}
            rows={5}
            value={activeParticipant?.comment}
            onChange={handleComment}
          />
        </div>
      ) : null}

      {template?.next_level_recommendation ? (
        <div className="mb-5">
          <label className={`mb-2 block cursor-pointer text-sm font-[400] `}>
            Next Recommended Level
          </label>
          <select
            className={`focus:shadow-outline w-full resize-none appearance-none border  bg-input-bg px-4  py-2.5 text-sm leading-tight   outline-none focus:outline-none `}
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e?.target?.value)}
          >
            {levels.map((option, key) => (
              <option value={option?.value} key={key + 1}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
