import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";
import { FaArrowLeft, FaRegTrashCan } from "react-icons/fa6";
import { LuPencilLine } from "react-icons/lu";
import { CiCircleInfo } from "react-icons/ci";
import { IoPrintOutline } from "react-icons/io5";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { GlobalContext, showToast } from "Context/Global";
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { useState } from "react";
import { handlePrint, worksheetStatus } from "Utils/utils";

export default function EditWorksheetPageHeader({
  backLink = "/administrator/worksheet",
  editDetailsLink,
  pageTitle,
  data,
  // isLoading = false,
  submitFunction = () => {},
  setDescriptionDrawerOpen = () => {},
  handleMarkAllSeen = () => {},
  setShowDeleteModal = () => {},
  handlePrintFn = () => {},
  isWithAddEdit = true,
  isWithDelete = true,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = React.useState(false);

  const navigate = useNavigate();

  const handleCreateReport = async () => {
    setIsLoading(true);
    try {
      await supabase
        .from("worksheet")
        .update({
          status: worksheetStatus?.inProgress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data?.id)
        .select();

      showToast(globalDispatch, "Report created successfully");
      navigate(backLink);
    } catch (error) {
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex  justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <Link to={backLink} className="text-accent">
          <FaArrowLeft />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-accent">
            {data?.course_code} <span className="capitalize">{data?.name}</span>
          </h2>
          <p>
            Last Save {moment(data?.updated_at).format("MMM DD, YYYY hh:mm A")}
          </p>
        </div>
      </div>

      <div className="flex items-center  gap-5">
        <button
          onClick={() => setDescriptionDrawerOpen(true)}
          className="text-neutral-gray hover:text-accent"
        >
          <IoIosInformationCircleOutline size={22} />
        </button>
        <button
          className="text-neutral-gray hover:text-accent"
          onClick={handlePrintFn}
        >
          <IoPrintOutline size={20} />
        </button>
        {/*  
        {data?.status?.toLowerCase() === "active" ? (
          
        ) : null} */}

        {data?.status === worksheetStatus?.active ? (
          <>
            {isWithAddEdit ? (
              <Link
                to={editDetailsLink}
                className="text-neutral-gray hover:text-accent"
              >
                <LuPencilLine size={20} />
              </Link>
            ) : null}

            {isWithDelete ? (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-neutral-gray hover:text-accent"
              >
                <FaRegTrashCan size={20} />
              </button>
            ) : null}

            <InteractiveButton
              onClick={handleMarkAllSeen}
              isSecondaryBtn={true}
              className="!px-3"
            >
              Mark All as Seen
            </InteractiveButton>

            {isWithAddEdit ? (
              <InteractiveButton
                loading={isLoading}
                onClick={handleCreateReport}
                className="bg-primary hover:bg-accent text-white !px-3"
              >
                Create Report Card
              </InteractiveButton>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
