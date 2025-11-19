import { InteractiveButton } from "Components/InteractiveButton";
import { usePermission } from "Context/Custom";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { participantReportCardStatus, worksheetStatus } from "Utils/utils";

export default function EditReportPageHeader({
  backLink,
  subTitle,
  status,
  isLoading = false,
  submitFunction = () => {},
  reportPermisstion,
}) {
  return (
    <div className="flex  justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        {backLink ? (
          <Link to={backLink} className="text-accent">
            <FaArrowLeft />
          </Link>
        ) : null}
        <div>
          <h2 className="text-xl font-semibold text-accent">
            Report Card Details
          </h2>
          <p className="flex items-center gap-2">
            <span>{subTitle}</span>
            <span className="bg-neutral-gray text-white text-xs inline-block p-2 py-1 rounded-full capitalize">
              {status}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {/* <InteractiveButton
          onClick={cancelFunction}
          // className=" !bg-white !text-accent   !px-12 !border hover:!border-secondary !border-white"
          isSecondaryBtn={true}
        >
          {cancelBtnText}
        </InteractiveButton> */}

        {status?.toLowerCase() === worksheetStatus?.inProgress &&
        reportPermisstion?.review ? (
          <InteractiveButton
            loading={isLoading}
            onClick={submitFunction}
            className=""
          >
            Submit for Review
          </InteractiveButton>
        ) : null}
        {status?.toLowerCase() === worksheetStatus?.inReview &&
        reportPermisstion?.publish ? (
          <InteractiveButton
            loading={isLoading}
            onClick={submitFunction}
            className=""
          >
            Publish Report Card
          </InteractiveButton>
        ) : null}
      </div>
    </div>
  );
}
