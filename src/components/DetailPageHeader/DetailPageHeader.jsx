import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function DetailPageHeader({
  backLink,
  pageTitle,
  isLoading = false,
  cancelBtnText = "Cancel",
  submitBtnText = "Submit",
  showSubmitButton = true,
  cancelFunction = () => {},
  submitFunction = () => {},
}) {
  return (
    <div className="flex  justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        {backLink ? (
          <Link to={backLink} className="text-accent">
            <FaArrowLeft />
          </Link>
        ) : null}
        <h2 className="text-xl font-semibold text-accent">{pageTitle}</h2>
      </div>

      <div className="flex gap-3">
        <InteractiveButton
          onClick={cancelFunction}
          // className=" !bg-white !text-accent   !px-12 !border hover:!border-secondary !border-white"
          isSecondaryBtn={true}
        >
          {cancelBtnText}
        </InteractiveButton>

        {showSubmitButton ? (
          <InteractiveButton
            loading={isLoading}
            onClick={submitFunction}
            className="bg-primary hover:bg-accent text-white !px-12"
          >
            {submitBtnText}
          </InteractiveButton>
        ) : null}
      </div>
    </div>
  );
}
