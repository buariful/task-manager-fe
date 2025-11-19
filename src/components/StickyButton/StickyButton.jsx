import { Spinner } from "Assets/svgs";
import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";
import { FaSave } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import { VscLoading } from "react-icons/vsc";
const StickyButton = ({
  isEditing,
  saveBallotChangesFn,
  save_loading,
  setIsEditing,
}) => {
  return (
    <div className="fixed bottom-5 right-5">
      {isEditing ? (
        <InteractiveButton
          onClick={saveBallotChangesFn}
          disabled={save_loading}
          // loading={save_loading}
          className="mx-1 grid h-[40px]  w-[40px] cursor-pointer place-items-center items-center gap-2 rounded-full border border-[#29ABE2] bg-[#29ABE2] p-2 text-center text-sm font-medium text-white shadow-md disabled:cursor-not-allowed"
        >
          {save_loading ? (
            <VscLoading className="animate-spin text-lg" />
          ) : (
            <FaSave className=" text-lg" />
          )}
        </InteractiveButton>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="mx-1 grid h-[40px] w-[40px] cursor-pointer place-items-center items-center gap-2 rounded-full border border-[#29ABE2] p-2 text-center text-sm font-medium text-[#29ABE2] shadow-md hover:bg-[#29ABE2] hover:text-white disabled:cursor-not-allowed "
        >
          <GoPencil className="text-sm" />{" "}
        </button>
      )}
    </div>
  );
};

export default StickyButton;
