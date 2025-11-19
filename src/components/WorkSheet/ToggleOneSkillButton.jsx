import React from "react";
import { RiCheckDoubleFill } from "react-icons/ri";
import { participantPassFailCheck } from "Utils/utils";

export default function ToggleOneSkillButton({
  allParticipants,
  setAllParticipants,
  minPassMark,
  skillId,
  isAllPassed,
  disabled = false,
}) {
  const handleToggleOneSkill = (skillId, result) => {
    try {
      const participantModified = allParticipants?.map((participant) => {
        const skills = participant?.skill_result?.map((skill) => {
          if (skill?.skill_id === skillId) {
            return { ...skill, pass: result };
          } else return skill;
        });
        const isPass = participantPassFailCheck({
          skills,
          minPassMark: minPassMark,
        });

        return {
          ...participant,
          result: isPass ? "pass" : "fail",
          skill_result: skills,
        };
      });

      setAllParticipants(participantModified);
    } catch (error) {
      console.log("handlePassOneSKillOfAll->>", error?.message);
    }
  };

  return (
    <div className="w-[3.25rem] h-6 grid place-content-center shrink-0   ">
      <button
        className={`h-5 w-5 grid p-1 place-content-center rounded ${
          isAllPassed ? "bg-light-info" : ""
        }`}
        disabled={disabled}
        onClick={() => handleToggleOneSkill(skillId, !isAllPassed)}
      >
        <RiCheckDoubleFill />
      </button>
    </div>
  );
}
