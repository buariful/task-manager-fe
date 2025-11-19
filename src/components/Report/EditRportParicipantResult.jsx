import { InteractiveButton } from "Components/InteractiveButton";
import { GlobalContext } from "Context/Global";
import React from "react";
import { useContext } from "react";
import { formatName } from "Utils/utils";

export default function EditRportParicipantResult({
  activeParticipant = {},
  setActiveParticipant = () => {},
  allParticipants = [],
  setAllParticipants = () => {},
  handleSaveChanges = () => {},
  isLoading,
  isEditable = true,
  template = {},
}) {
  const { labels } = useContext(GlobalContext);

  const handlePassFail = (e, skillId) => {
    try {
      const participant = {
        ...activeParticipant,
        skill_result: activeParticipant?.skill_result?.map((item) => {
          if (item?.skill_id === skillId) {
            return { ...item, pass: e.target?.value === "true" };
          } else return item;
        }),
      };

      const allParticipantsMod = allParticipants?.map((p) => {
        if (p?.id === activeParticipant?.id) {
          return participant;
        } else return p;
      });

      setAllParticipants(allParticipantsMod);
      setActiveParticipant(participant);
    } catch (error) {
      console.log("handlePassFail->>", error?.message);
    }
  };

  return (
    <div className="p-3">
      {activeParticipant?.id ? (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-32 h-32 rounded-full bg-[#e6e6e6]"></div>
            <div className="text-accent">
              <h3 className="font-semibold text-2xl">
                {formatName(
                  activeParticipant?.user?.first_name,
                  activeParticipant?.user?.last_name,
                  template?.name_option
                )}
                {/* {activeParticipant?.user?.first_name}{" "}
                {activeParticipant?.user?.last_name} */}
              </h3>
              <p className="text-xs mb-2 mt-1">
                {activeParticipant?.user?.parent_email}
              </p>
              <p className="capitalize font-normal text-lg">
                {activeParticipant?.level?.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-6">
            <div className="col-span-4  flex flex-col gap-5">
              <p className="text-sm font-medium">Skills</p>
              {activeParticipant?.skill_result?.map((skill) => (
                <p key={skill?.skill_id}>{skill?.name}</p>
              ))}
            </div>

            <div className="col-span-1  flex flex-col items-center gap-5">
              <p className="text-sm font-medium capitalize">
                {labels?.pass || "Pass"}
              </p>

              {activeParticipant?.skill_result?.map((skill, i) => (
                <input
                  key={`pass-${i}`}
                  name={skill?.skill_id}
                  type="radio"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  value={true}
                  checked={skill?.pass === true}
                  onChange={(e) => handlePassFail(e, skill?.skill_id)}
                />
              ))}
            </div>

            <div className="col-span-1 flex flex-col items-center gap-5">
              <p className="text-sm font-medium capitalize">
                {labels?.fail || "Fail"}
              </p>
              {activeParticipant?.skill_result?.map((skill, i) => {
                console.log(skill);
                return (
                  <input
                    key={`fail-${i}`}
                    name={skill?.skill_id}
                    type="radio"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    value={false}
                    checked={skill?.pass === false}
                    onChange={(e) => handlePassFail(e, skill?.skill_id)}
                  />
                );
              })}
            </div>
          </div>

          <p className="mt-10 text-neutral-gray">Created On Aug 10, 2025</p>

          {isEditable ? (
            <div className="flex items-end justify-end mt-5">
              <InteractiveButton
                onClick={handleSaveChanges}
                loading={isLoading}
              >
                Save Changes
              </InteractiveButton>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
