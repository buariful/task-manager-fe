import React from "react";
import { GoChecklist } from "react-icons/go";
import { participantReportCardStatus } from "Utils/utils";

export default function EditReportPageSideBar({
  data,
  setActiveParticipant,
  acitveParticipant,
  setAllParticipants,
}) {
  const handleSelectParticipant = (participant) => {
    try {
      setActiveParticipant({ ...participant, isEdited: true });
      setAllParticipants((prev) =>
        prev?.map((item) => {
          if (item?.id === participant?.id) {
            return { ...item, isEdited: true };
          }
          return item;
        })
      );
    } catch (error) {
      console.log("handleSelectParticipant->>", error?.message);
    }
  };

  return (
    <div>
      {data?.map((participant) => (
        <div
          key={participant?.id}
          className={`flex items-center p-2 border-b text-wrap overflow-hidden text-ellipsis border-b-gray-200  cursor-pointer gap-5 justify-between ${
            acitveParticipant?.id === participant?.id ? "bg-[#e6e6e6]" : ""
          }`}
          onClick={() => handleSelectParticipant(participant)}
        >
          <div>
            <p className="text-wrap">
              {participant?.user?.first_name} {participant?.user?.last_name}
            </p>
            <p className="">{participant?.user?.parent_email}</p>
          </div>

          {participant?.isEdited ? <GoChecklist /> : null}
        </div>
      ))}
    </div>
  );
}
