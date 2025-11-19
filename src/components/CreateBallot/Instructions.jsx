import { XCircleIcon } from "@heroicons/react/24/solid";
import { TiPlus } from "react-icons/ti";
import React from "react";

const Instructions = ({
  parent_index,
  instructions,
  isEditing,
  setInstructions,
}) => {
  return (
    <>
      {parent_index === 0 && instructions?.length > 0 && (
        <div className="border-t border-black p-3">
          <p className="mb-1 block text-center text-base font-bold uppercase">
            INSTRUCTIONS TO VOTERS
          </p>
          {instructions?.map((instruction, i) =>
            isEditing ? (
              <div key={i} className="relative">
                <textarea
                  className="w-full rounded-[5px] focus:border-[#8128c5] focus:ring-0"
                  value={instruction}
                  onChange={(e) => {
                    let copyInstruction = [...instructions];
                    copyInstruction[i] = e.target.value;
                    setInstructions(copyInstruction);
                  }}
                />
                <XCircleIcon
                  className="absolute -left-1 -top-1 w-4 cursor-pointer text-red-400 duration-300 hover:text-red-500"
                  onClick={() => {
                    let copyInstruction = [...instructions];
                    copyInstruction.splice(i, 1);
                    setInstructions(copyInstruction);
                  }}
                />
              </div>
            ) : (
              <p key={i} className=" text-sm">
                {instruction}
              </p>
            )
          )}
        </div>
      )}
      {isEditing && parent_index === 0 && (
        <p
          className="m-2 mx-auto flex max-w-[120px] cursor-pointer items-center justify-center gap-1 rounded border border-[#662D91] bg-[#8128c5] px-2 py-2  text-xs font-medium text-white hover:bg-[#662D91]"
          style={{ fontFamily: "Inter, sens-serif" }}
          onClick={() => setInstructions([...instructions, ""])}
        >
          {" "}
          <TiPlus className="text-xs" /> <span>Instruction</span>
        </p>
      )}
    </>
  );
};

export default Instructions;
