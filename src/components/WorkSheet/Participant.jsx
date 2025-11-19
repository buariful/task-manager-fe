import { ModalPrompt } from "Components/Modal";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useContext } from "react";
import { MdCancel } from "react-icons/md";
import { supabase } from "Src/supabase";

export default function Participant({
  participant,
  setAllParticipants,
  disabled,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleRemoveParticipant = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("worksheet_participant_map")
        .delete()
        .eq("id", participant?.id);

      setAllParticipants((prev) =>
        prev?.filter((p) => p?.id !== participant?.id)
      );

      if (error?.message) {
        showToast(globalDispatch, error?.message, 4000, "error");
      } else {
        showToast(globalDispatch, "Participant Removed.");
      }
    } catch (error) {
      console.log("handleRemoveParticipant->>", error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setDeleteLoading(false);
  };

  return (
    <>
      <div className=" bg-[#F5F5F5] p-2 h-[3.25rem] flex items-center gap-2 justify-between">
        <div className="flex-1 overflow-hidden">
          <p className="text-xs truncate">
            {participant?.user?.first_name + " " + participant?.user?.last_name}
          </p>
          <p className="text-[0.675rem] truncate">
            {participant?.user?.parent_email}
          </p>
        </div>
        {!disabled ? (
          <button
            className="flex-shrink-0 text-neutral-gray hover:text-accent"
            disabled={disabled}
            onClick={() => setShowDeleteModal(true)}
          >
            <MdCancel />
          </button>
        ) : null}
      </div>

      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={() => {
            handleRemoveParticipant(participant?.id);
          }}
          closeModalFunction={() => {
            setShowDeleteModal(false);
          }}
          title={`Remove Participant `}
          message={`You are about to remove the participant - ${participant?.user?.first_name}. Note that this action is irreversible`}
          acceptText={`REMOVE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}
    </>
  );
}
