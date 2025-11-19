import { Spinner } from "Assets/svgs";
import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";
import { FaTrash } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function EditLevelPageHeader({
  backLink,
  pageTitle,
  deleteLoading = false,
  editSkillBtnFunction = () => {},
  isWithEdit = true,
  editDetailBtnFunction = () => {},
  isWithDelete = true,
  handleDeleteFunction = () => {},
}) {
  return (
    <div className="flex  justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Link to={backLink} className="text-accent">
          <FaArrowLeft />
        </Link>
        <h2 className="text-xl font-semibold text-accent capitalize">
          {pageTitle}
        </h2>
      </div>

      <div className="flex gap-3">
        {isWithDelete ? (
          <button disabled={deleteLoading} onClick={handleDeleteFunction}>
            {deleteLoading ? <Spinner size={20} /> : <FaTrash />}
          </button>
        ) : null}

        {isWithEdit ? (
          <>
            <InteractiveButton
              onClick={editSkillBtnFunction}
              // className=" !bg-white !text-accent   !px-12 !border hover:!border-secondary !border-white"
              isSecondaryBtn={true}
            >
              Edit Skills
            </InteractiveButton>

            <InteractiveButton
              onClick={editDetailBtnFunction}
              className="bg-primary hover:bg-accent text-white !px-12"
            >
              Edit Details
            </InteractiveButton>
          </>
        ) : null}
      </div>
    </div>
  );
}
