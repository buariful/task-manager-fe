import { XCircleIcon } from "@heroicons/react/24/solid";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { TbOvalVertical } from "react-icons/tb";

const Parties = ({
  selectedParties,
  setSelectedParties,
  allParties,
  parent_index,
  isEditing,
  //   removeParty,
  //   addParty,
}) => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);

  const addParty = (partyId) => {
    try {
      const targetedParty = allParties?.find(
        (party) => party?.id === Number(partyId)
      );
      setSelectedParties([...selectedParties, targetedParty]);
    } catch (error) {
      console.log("addParty", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };
  const removeParty = (id) => {
    try {
      setSelectedParties(
        selectedParties?.filter((party) => Number(party?.id) !== Number(id))
      );
    } catch (error) {
      console.log("removeParty", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  return (
    <>
      {selectedParties?.length > 0 && parent_index === 0 && (
        <div>
          {selectedParties?.map((party, i) => (
            <div
              key={i}
              className={`relative min-h-[50px] bg-[#CCCCCC] text-sm ${
                selectedParties?.length - 1 !== i
                  ? "border-b-[1px] border-b-black"
                  : " "
              }`}
            >
              <div className="flex min-h-[50px] items-center gap-3 px-3">
                {party?.logo && (
                  <img
                    src={party?.logo}
                    alt=""
                    className="h-[30px] w-[30px] max-w-[30px]"
                  />
                )}
                <p className="font-bold capitalize">
                  {party?.name ? party?.name : "NA"}
                </p>
              </div>
              <XCircleIcon
                className={`absolute left-[2px] top-3 w-4 -translate-y-1/2 cursor-pointer text-red-400 duration-300 hover:text-red-500 ${
                  isEditing ? "" : "hidden"
                }`}
                onClick={() => removeParty(party?.id)}
              />
            </div>
          ))}
        </div>
      )}

      {parent_index === 0 &&
        isEditing &&
        allParties?.length > selectedParties?.length && (
          <div className="flex justify-center px-2 py-2">
            <select
              name=""
              id=""
              onChange={(e) => addParty(e?.target?.value)}
              className="mx-auto mb-3 max-w-full cursor-pointer rounded border border-[#662D91]  text-sm capitalize text-[#662D91] disabled:cursor-not-allowed"
            >
              <option defaultValue className="text-gray-500">
                Add Party
              </option>
              {allParties?.map((party) => {
                if (!selectedParties?.find((p) => p?.id === party?.id)) {
                  return (
                    <option
                      className="text-black"
                      key={party?.id}
                      value={party?.id}
                    >
                      {party?.name}
                    </option>
                  );
                }
              })}
            </select>
          </div>
        )}
    </>
  );
};

export default Parties;
