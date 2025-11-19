import { useLevel } from "Context/Level/LevelContext";
import React from "react";
import { FaUsers } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
// CheckBoxWithLevel
export default function SkillList({ skills = {} }) {
  const { selectedSkills, setSelectedSkills } = useLevel();

  const handleRemoveSelectedSkill = (id) => {
    try {
      const filteredSkills = selectedSkills?.filter((item) => item?.id !== id);
      setSelectedSkills(filteredSkills);
    } catch (error) {
      console.log("handleRemoveSelectedSkill->>", error?.message);
    }
  };

  const handleSkillToggle = (skill) => {
    try {
      const isSkillExist = selectedSkills?.find(
        (item) => item.id === skill?.id
      );
      if (isSkillExist?.id) {
        handleRemoveSelectedSkill(skill?.id);
        return;
      }

      setSelectedSkills((prev) => [...prev, skill]);
    } catch (error) {
      console.log("handleSkillToggle->>", error?.message);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Skills List */}

      <div className="flex-1 bg-white rounded-lg p-4 border">
        {Object?.keys(skills)?.map((key, i) => (
          <div className="mb-4" key={i}>
            <div className="font-bold text-sm mb-2 capitalize">
              {key} ({skills[key]?.length})
            </div>

            <div className="grid grid-cols-2 gap-2">
              {skills[key]?.map((skill) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    // checked={selectedSkills?.find((s) => s?.id === skill?.id)}
                    checked={selectedSkills?.some((s) => s?.id === skill?.id)}
                    onChange={() => handleSkillToggle(skill)}
                    className="text-primary ring-primary focus:ring-primary"
                  />{" "}
                  {skill?.name}
                  {skill?.type === 1 ? (
                    <FiUsers className="text-neutral-gray" />
                  ) : null}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Selected Skills */}
      <div className="w-1/3 bg-white rounded-lg p-4 border">
        <div className="font-bold text-sm mb-2 flex items-center gap-2">
          Selected Skills <span className="text-gray-400 text-xs">&#9432;</span>
        </div>
        <ul className="space-y-2">
          {selectedSkills?.map((item) => (
            <li
              key={item?.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="flex items-center gap-2">
                {item?.name}
                {item?.type === 1 ? (
                  <FiUsers className="text-neutral-gray" />
                ) : null}
              </span>
              <button
                className="text-red-500"
                onClick={() => handleRemoveSelectedSkill(item?.id)}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
