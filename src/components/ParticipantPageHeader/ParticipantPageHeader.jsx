import { SearchInput } from "Components/SearchInput";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import { supabase } from "Src/supabase";
import { GlobalContext, showToast } from "Context/Global";
import { IoFilterCircle } from "react-icons/io5";
import { ImportData } from "Components/Import";
import { FaPlus } from "react-icons/fa6";
import { downloadCsv } from "Utils/utils";
import { ModalPrompt } from "Components/Modal";

const sampleParticipants = [
  {
    first_name: "John",
    last_name: "Doe",
    unique_id: "U12345",
    contact_number: "01712345678",
    parent_email: "parent1@example.com",
  },
  {
    first_name: "Alex",
    last_name: "Tua",
    unique_id: "U67890",
    contact_number: "01898765432",
    parent_email: "parent2@example.com",
  },
];

export default function ParticipantPageHeader({
  handleSearchFn,
  setIsFilterDrawerOpen = () => {},
  refetchData,
  setShowAddModal,
  register,
  handleSubmit,
  selectedParticipants = [],
  setSelectedParticipants = () => {},

  isWithImport = true,
  isWithExport = true,
  isWithDelete = true,
  isWithEnableDisable = true,
  isWithAdd = true,
}) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [disableLoading, setDisableLoading] = React.useState(false);
  const [showDisableModal, setShowDisableModal] = React.useState(false);
  const [enableLoading, setEnableLoading] = React.useState(false);
  const [showEnableModal, setShowEnableModal] = React.useState(false);

  const handleImportParticipant = async (data) => {
    try {
      const dataModified = data?.map((item) => ({
        ...item,
        status: "active",
        organization_id: state?.organization_id,
      }));

      const { data: result, error } = await supabase
        .from("participant")
        .insert(dataModified)
        .select();
      if (error) {
        throw new Error(error?.message || "Failed to create participant");
      }

      showToast(globalDispatch, "Participants created successfully");
      console.log(result);
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to create participants",
        4000,
        "error"
      );
    }
  };

  const downloadParticipants = () => {
    try {
      const modifiedList = selectedParticipants?.map((item) => ({
        "Unique Id": item?.unique_id || "",
        "First Name": item?.first_name || "",
        "Last Name": item?.last_name || "",
        Email: item?.level?.parent_email || "",
        "Created At": item?.created_at_modified,
        Contact: item?.contact_number,
        Status: item?.statusModified,
      }));

      downloadCsv(modifiedList, "Participants.csv");
    } catch (error) {
      console.log("downloadWorksheetsAsExcel->>", error?.message);
    }
  };

  const handleDeleteItems = async () => {
    setDeleteLoading(true);
    try {
      const selectedIds = selectedParticipants?.map((item) => item?.id);

      const { error, data } = await supabase
        .from("participant")
        .delete()
        .in("id", selectedIds);

      if (error) {
        showToast(
          globalDispatch,
          "Failed to delete the participants.",
          4000,
          "error"
        );
      } else {
        showToast(globalDispatch, "Participants are updated successfully.");
        refetchData(1);
      }
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        "Failed to delete the participants.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
    setSelectedParticipants([]);
  };

  const handleDisableItems = async () => {
    setDisableLoading(true);
    try {
      const selectedIds = selectedParticipants?.map((item) => item?.id);

      const { error, data } = await supabase
        .from("participant")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedIds);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to update the participants.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Participants are updated successfully.");
      refetchData(1);
    } catch (error) {
      console.log("handleDisableItems->>", error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to update the participants.",
        4000,
        "error"
      );
    }
    setDisableLoading(false);
    setShowDisableModal(false);
    setSelectedParticipants([]);
  };

  const handleEnableItems = async () => {
    setEnableLoading(true);
    try {
      const selectedIds = selectedParticipants?.map((item) => item?.id);

      const { error, data } = await supabase
        .from("participant")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedIds);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to update the participants.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Participants are updated successfully.");
      refetchData(1);
    } catch (error) {
      console.log("handleEnableItems->>", error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to update the participants.",
        4000,
        "error"
      );
    }
    setEnableLoading(false);
    setShowEnableModal(false);
    setSelectedParticipants([]);
  };

  return (
    <div className="flex mb-7 items-center gap-5 justify-between">
      <div className="flex  flex-1 max-w-xl items-center gap-5">
        <form className="flex-1 " onSubmit={handleSubmit(handleSearchFn)}>
          <SearchInput
            errors={{}}
            register={register}
            name={"searchText"}
            placeholder={"Search by participant name"}
          />
        </form>
        <InteractiveButton
          type={"button"}
          // className={"hover:!border-secondary hover:!text-secondary"}
          isSecondaryBtn={true}
          onClick={() => setIsFilterDrawerOpen(true)}
        >
          <p className="flex items-center gap-2">
            <span>Filter</span>
            <IoFilterCircle className="" size={25} />
          </p>
        </InteractiveButton>
      </div>

      {selectedParticipants?.length ? (
        <div className="flex items-center gap-2">
          {isWithExport ? (
            <InteractiveButton
              isSecondaryBtn={true}
              onClick={downloadParticipants}
              className="!px-5 !border !border-neutral-gray hover:!border-accent"
              type={"button"}
            >
              <span>Export</span>
            </InteractiveButton>
          ) : null}

          {isWithDelete ? (
            <InteractiveButton
              isSecondaryBtn={true}
              onClick={() => setShowDeleteModal(true)}
              className="!px-5 !border !border-neutral-gray hover:!border-accent"
              type={"button"}
            >
              <span>Delete Selected</span>
            </InteractiveButton>
          ) : null}

          {isWithEnableDisable ? (
            <>
              <InteractiveButton
                isSecondaryBtn={true}
                onClick={() => setShowDisableModal(true)}
                className="!px-5 !border !border-neutral-gray hover:!border-accent"
                type={"button"}
              >
                <span>Disable Selected</span>
              </InteractiveButton>
              <InteractiveButton
                isSecondaryBtn={true}
                onClick={() => setShowEnableModal(true)}
                className="!px-5 !border !border-neutral-gray hover:!border-accent"
                type={"button"}
              >
                <span>Enable Selected</span>
              </InteractiveButton>
            </>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {isWithImport ? (
            <ImportData
              importDataFunction={handleImportParticipant}
              title={"Import Participant"}
              refetch={refetchData}
              sampleData={sampleParticipants}
            />
          ) : null}

          {isWithAdd ? (
            <InteractiveButton
              onClick={() => setShowAddModal(true)}
              className={"!px-10"}
              type={"button"}
            >
              <span className="flex items-center gap-3">
                {" "}
                <FaPlus />
                <span>New Participant</span>
              </span>
            </InteractiveButton>
          ) : null}
        </div>
      )}

      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={handleDeleteItems}
          closeModalFunction={() => {
            setShowDeleteModal(false);
          }}
          title={`Delete Participants `}
          message={`You are about to delete the selected participants. Note that this action is irreversible`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}

      {showDisableModal ? (
        <ModalPrompt
          actionHandler={handleDisableItems}
          closeModalFunction={() => {
            setShowDisableModal(false);
          }}
          title={`Disable Participants `}
          message={`You are about to disable the selected participants. Are you sure about that?`}
          acceptText={`Disable`}
          rejectText={`CANCEL`}
          loading={disableLoading}
        />
      ) : null}
      {showEnableModal ? (
        <ModalPrompt
          actionHandler={handleEnableItems}
          closeModalFunction={() => {
            setShowEnableModal(false);
          }}
          title={`Enable Participants `}
          message={`You are about to enable the selected participants. Are you sure about that?`}
          acceptText={`Enable`}
          rejectText={`CANCEL`}
          loading={enableLoading}
        />
      ) : null}
    </div>
  );
}
