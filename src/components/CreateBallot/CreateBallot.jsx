import {
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import TreeSDK from "Utils/TreeSDK";
import { TbOvalVertical } from "react-icons/tb";
import Instructions from "./Instructions";
import Parties from "./Parties";
import Races from "./Races";
import Amendment from "./Amendment";
import { FaCircleXmark } from "react-icons/fa6";
import { TiPlus } from "react-icons/ti";
import { formatDate } from "Utils/utils";

const tdk = new TreeSDK();
/* 
amendments={
          column1: [{title: "", summary:"", question:""}, {}, {}], 
          column2:[], 
          column3: []
        }
*/
const CreateBallot = ({
  selElectionRaces,
  allRaces,
  setAllRaces,
  selectedRacesIds,
  setSelectedRacesIds,
  isEditing,
  instructions,
  setInstructions,
  selectedParties,
  setSelectedParties,
  allParties,
  amendments,
  setAmendment,
  showDescription,
  electionInfo,
  description,
}) => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [showButton, setShowButton] = React.useState(false);
  const [raceSelect_loading, setRaceSelect_loading] = React.useState(false);

  const addPage = () => {
    try {
      setAllRaces([
        ...allRaces,
        {
          column1: [],
          column2: [],
          column3: [],
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const removePage = (index) => {
    try {
      let copy_allRaces = [...allRaces];
      let raceIds = [...selectedRacesIds];
      let deletedRaceIds = [];

      copy_allRaces[index]?.column1?.map((race) =>
        deletedRaceIds.push(race?.id)
      );
      copy_allRaces[index]?.column2?.map((race) =>
        deletedRaceIds.push(race?.id)
      );
      copy_allRaces[index]?.column3?.map((race) =>
        deletedRaceIds.push(race?.id)
      );

      raceIds = raceIds?.filter((id) => !deletedRaceIds.includes(id));
      setSelectedRacesIds(raceIds);
      copy_allRaces.splice(index, 1);
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    // <div className={`mx-auto ${selElectionRaces?.length < 1 ? "hidden" : ""}`}>
    <>
      <div className={`fontFira mx-auto`}>
        {allRaces?.map((race, parent_index) => (
          <div
            className={`mx-auto h-[11.69in] w-[8.31in] overflow-hidden p-5 ${
              isEditing ? "overflow-y-auto" : "overflow-hidden"
            }`}
            key={parent_index}
          >
            <div className={`table h-full w-full`} key={parent_index}>
              {showDescription && parent_index === 0 && (
                <div className="table-header-group">
                  <div className="border border-b-0 border-black p-2">
                    <div className="mb-2 uppercase">
                      <h2 className="text-lg ">
                        {electionInfo?.name} HELD FOR
                      </h2>
                      <h2 className="text-lg">{electionInfo?.county} COUNTY</h2>
                      {/* <h2 className="text-lg">TUESDAY, NOVEMBER 8, 2022</h2> */}
                      {/* <h2 className="text-lg">{electionInfo?.election_date formatDate}</h2> */}
                      <h2 className="text-lg">
                        {formatDate(
                          electionInfo?.election_date,
                          "dddd, MMMM D, YYYY"
                        )}
                      </h2>
                    </div>
                    <div
                      className=""
                      dangerouslySetInnerHTML={{ __html: description }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="table-row">
                <div className="relative mb-8 grid h-full w-full grid-cols-3 border border-black">
                  {/* <!-- ============= first column=============-- --> */}
                  <div className="">
                    <Instructions
                      parent_index={parent_index}
                      instructions={instructions}
                      isEditing={isEditing}
                      setInstructions={setInstructions}
                    />
                    <Parties
                      selectedParties={selectedParties}
                      setSelectedParties={setSelectedParties}
                      allParties={allParties}
                      parent_index={parent_index}
                      isEditing={isEditing}
                    />
                    <Races
                      columnArray={race?.column1}
                      columnName={"column1"}
                      isEditing={isEditing}
                      parent_index={parent_index}
                      selElectionRaces={selElectionRaces}
                      selectedRacesIds={selectedRacesIds}
                      allRaces={allRaces}
                      setAllRaces={setAllRaces}
                      setSelectedRacesIds={setSelectedRacesIds}
                      amendments={amendments}
                      setAmendment={setAmendment}
                      raceSelect_loading={raceSelect_loading}
                      setRaceSelect_loading={setRaceSelect_loading}
                    />

                    {/* allRaces,parent_index, amendmentArray,isEditing,arrayName */}
                    {/* <Amendment
                allRaces={allRaces}
                parent_index={parent_index}
                amendmentArray={amendments?.column1}
                arrayName={"column1"}
                amendments={amendments}
                setAmendment={setAmendment}
                isEditing={isEditing}
              /> */}
                  </div>

                  {/* <!-- ============= second column=============-- --> */}
                  <div className="border-l border-r border-black">
                    <Races
                      columnArray={race?.column2}
                      columnName={"column2"}
                      isEditing={isEditing}
                      parent_index={parent_index}
                      selElectionRaces={selElectionRaces}
                      selectedRacesIds={selectedRacesIds}
                      allRaces={allRaces}
                      setAllRaces={setAllRaces}
                      setSelectedRacesIds={setSelectedRacesIds}
                      amendments={amendments}
                      setAmendment={setAmendment}
                      raceSelect_loading={raceSelect_loading}
                      setRaceSelect_loading={setRaceSelect_loading}
                    />
                    {/* <Amendment
                allRaces={allRaces}
                parent_index={parent_index}
                amendmentArray={amendments?.column2}
                arrayName={"column2"}
                amendments={amendments}
                setAmendment={setAmendment}
                isEditing={isEditing}
              /> */}
                  </div>

                  {/* <!-- =================== Third column ===================== --> */}
                  <div className="">
                    <Races
                      columnArray={race?.column3}
                      columnName={"column3"}
                      isEditing={isEditing}
                      parent_index={parent_index}
                      selElectionRaces={selElectionRaces}
                      selectedRacesIds={selectedRacesIds}
                      allRaces={allRaces}
                      setAllRaces={setAllRaces}
                      setSelectedRacesIds={setSelectedRacesIds}
                      amendments={amendments}
                      setAmendment={setAmendment}
                      raceSelect_loading={raceSelect_loading}
                      setRaceSelect_loading={setRaceSelect_loading}
                    />

                    {/* <Amendment
                allRaces={allRaces}
                parent_index={parent_index}
                amendmentArray={amendments?.column3}
                arrayName={"column3"}
                amendments={amendments}
                setAmendment={setAmendment}
                isEditing={isEditing}
              /> */}
                  </div>

                  {isEditing && (
                    <span
                      className="absolute -right-2 -top-2 z-30 grid h-5 w-5 cursor-pointer place-items-center rounded-full bg-red-500 text-white"
                      onClick={() => removePage(parent_index)}
                    >
                      <XMarkIcon className="w-3" strokeWidth={3} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isEditing && (
          <p
            className="m-2 mx-auto flex max-w-[120px] cursor-pointer items-center justify-center gap-1 rounded border border-[#662D91] bg-transparent px-2  py-2 text-xs font-medium text-[#662D91] hover:bg-[#662D91] hover:text-white"
            style={{ fontFamily: "Inter, sens-serif" }}
            onClick={addPage}
          >
            {" "}
            <TiPlus className="text-sm" /> <span>Add Page</span>
          </p>
        )}
      </div>
    </>
  );
};

export default CreateBallot;
