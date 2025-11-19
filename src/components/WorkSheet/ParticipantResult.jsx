import React from "react";
import { RiCheckDoubleFill } from "react-icons/ri";

export default function ParticipantResult({
  participant,
  isAllPassed,
  allParticipants,
  setAllParticipants,
  disabled = false,
}) {
  const hanldeToggleParticipantSkill = (participantId, result) => {
    try {
      const participantModified = allParticipants?.map((participant) => {
        if (participantId === participant?.id) {
          return {
            ...participant,
            result: result ? "pass" : "fail",
            skill_result: participant?.skill_result?.map((skill) => ({
              ...skill,
              pass: result,
            })),
          };
        } else return participant;
      });

      setAllParticipants(participantModified);
    } catch (error) {
      console.log("handlePassAllSkills->>", error?.message);
    }
  };

  return (
    <div className="h-[2.25rem] mb-4 mt-2 p-2 flex items-center justify-between">
      <span className="text-sm capitalize">{participant?.result}</span>
      <button
        className={`h-5 w-5  grid place-content-center rounded p-1  ${
          isAllPassed ? "bg-light-info" : ""
        } `}
        disabled={disabled}
        onClick={() =>
          hanldeToggleParticipantSkill(participant?.id, !isAllPassed)
        }
      >
        <RiCheckDoubleFill />
      </button>
    </div>
  );
}
