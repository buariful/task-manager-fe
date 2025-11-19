import React from "react";
import {
  PencilIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { TbOvalVertical } from "react-icons/tb";
import TreeSDK from "Utils/TreeSDK";
import Amendment from "./Amendment";

const tdk = new TreeSDK();

const Races = ({
  columnArray, //
  isEditing, // boolean
  parent_index, //number
  columnName, //"column1"/column2/column3
  selElectionRaces,
  selectedRacesIds,
  allRaces,
  setAllRaces,
  setSelectedRacesIds,
  amendments,
  setAmendment,
  raceSelect_loading,
  setRaceSelect_loading,
}) => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  // const [raceSelect_loading, setRaceSelect_loading] = React.useState(false);

  const isJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRaceSelect = async (raceId, parent_index, col_name) => {
    setRaceSelect_loading(true);
    try {
      const selectedRace = selElectionRaces.find(
        (race) => Number(race?.id) === Number(raceId)
      );

      const candidateParties = [];

      const candidates = await tdk.getList("petition", {
        filter: [`race_id,eq,${raceId}`],
        join: "parties,user",
      });
      const candidates_mod = candidates?.list?.map((candidate) => {
        candidate?.parties?.id && candidateParties.push(candidate?.parties);
        return {
          name: `${candidate?.candidate_name}`,
          party: candidate?.parties?.name,
        };
      });

      const newData = {
        id: selectedRace?.id,
        name: selectedRace?.name,
        vote_for_phrase: selectedRace?.vote_for_phrase,
        for_candidate_petition: selectedRace?.for_candidate_petition,
        is_federal: selectedRace?.is_federal,
        precincts: isJSON(selectedRace?.precincts)
          ? JSON.parse(selectedRace?.precincts)
              ?.map((prec) => prec?.name)
              .join(", ") || ""
          : selectedRace?.precincts,
        candidates: candidates_mod,
        amendment: isJSON(selectedRace?.amendment)
          ? JSON.parse(selectedRace?.amendment)
          : {},
      };

      let copyAllRaces = [...allRaces];
      copyAllRaces[parent_index][col_name] = [
        ...copyAllRaces[parent_index][col_name],
        newData,
      ];

      setAllRaces(copyAllRaces);
      setSelectedRacesIds([...selectedRacesIds, Number(raceId)]);

      // // -------------- auto add race amendment ------------
      // if (selectedRace?.amendment) {
      //   const shortestColumn = Object.keys(amendments).reduce((a, b) =>
      //     amendments[a].length < amendments[b].length ? a : b
      //   );
      //   setAmendment((prev) => {
      //     return {
      //       ...prev,
      //       [shortestColumn]: [
      //         ...prev[shortestColumn],
      //         JSON.parse(selectedRace?.amendment),
      //       ],
      //     };
      //   });
      // }
    } catch (error) {
      console.log(error?.message);
      tokenExpireError(dispatch, error?.message);
    }
    setRaceSelect_loading(false);
  };

  const removeRace = (parent_index, col_name, col_index, raceId) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0) ||
      !raceId
    )
      return;

    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name].splice(col_index, 1);
      setAllRaces(copy_allRaces);
      setSelectedRacesIds(selectedRacesIds?.filter((id) => id !== raceId));

      // let { column1, column2, column3 } = amendments;
      // column1 = column1.filter((cl) => Number(cl?.race_id) !== Number(raceId));
      // column2 = column2.filter((cl) => Number(cl?.race_id) !== Number(raceId));
      // column3 = column3.filter((cl) => Number(cl?.race_id) !== Number(raceId));

      // setAmendment({ column1, column2, column3 });
    } catch (error) {
      console.log("removeRace", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const changeRaceVote = (parent_index, col_name, col_index, key, value) => {
    if (
      parent_index !== 0 &&
      col_index !== 0 &&
      (!parent_index || !col_index || !col_name || !key)
    )
      return;
    try {
      const copyAllRaces = [...allRaces];
      copyAllRaces[parent_index][col_name][col_index][key] = value;
      setAllRaces(copyAllRaces);
    } catch (error) {
      console.log("changeRaceVote", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const changeCandidates = (
    parent_index,
    col_name,
    col_index,
    cand_index,
    key,
    value
  ) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0) ||
      (!cand_index && cand_index !== 0) ||
      !key
    )
      return;

    try {
      const copy_allRaces = [...allRaces];
      copy_allRaces[0][col_name][col_index].candidates[cand_index][key] = value;
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("changeCandidates", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const removeCandidate = (parent_index, col_name, col_index, cand_index) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0) ||
      (!cand_index && cand_index !== 0)
    )
      return;
    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name][col_index].candidates.splice(
        cand_index,
        1
      );
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("removeCandidate", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const addCandidate = (parent_index, col_name, col_index) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0)
    )
      return;

    try {
      const copy_allRaces = [...allRaces];
      copy_allRaces[parent_index][col_name][col_index].candidates = [
        ...copy_allRaces[parent_index][col_name][col_index].candidates,
        {
          name: "",
          party: "",
        },
      ];
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("addCandidate", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const handlePrecinct_change = (parent_index, col_name, col_index, value) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0)
    )
      return;
    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name][col_index].precincts = value;
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("handlePrecinct_change", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  return (
    <>
      {columnArray?.map((race, index) => (
        <div key={index}>
          {/* --- race name and vote for phrase --- */}
          <div className="grid min-h-[53px] place-items-center border border-l-0 border-r-0 border-black bg-[#CCCCCC] px-3">
            {isEditing ? (
              <>
                <p
                  onClick={() =>
                    removeRace(parent_index, columnName, index, race?.id)
                  }
                  className=" mb-1 cursor-pointer border-b border-b-transparent text-xs text-red-500 hover:border-b-red-500"
                >
                  Remove Race
                </p>
                <div className="mb-1 grid grid-cols-12 items-center gap-1 text-sm">
                  <p className="col-span-3 text-end text-sm ">Race:</p>

                  <input
                    type="text"
                    className="col-span-9 w-full text-sm"
                    name=""
                    id=""
                    value={race?.name}
                    onChange={(e) =>
                      changeRaceVote(
                        parent_index,
                        columnName,
                        index,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-12 items-center gap-1 pb-1 text-sm">
                  <p className="col-span-3 text-end text-sm">Vote for: </p>
                  <input
                    type="number"
                    name=""
                    className="col-span-9 text-sm"
                    id=""
                    min={1}
                    value={race?.vote_for_phrase}
                    onChange={(e) =>
                      changeRaceVote(
                        parent_index,
                        columnName,
                        index,
                        "vote_for_phrase",
                        e.target.value
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="track block break-all text-sm font-semibold leading-[14px]">
                  {race?.name}
                </p>
                <p className=" text-xs font-medium">
                  (Vote for {race?.vote_for_phrase})
                </p>
              </div>
            )}
          </div>

          {/* ---- candidates ---- */}
          {race?.candidates?.map((cand, cand_index) => (
            <div
              className={`min-h-[55px] border-b border-b-black px-3 py-1 text-sm`}
              key={cand_index}
            >
              {isEditing ? (
                <>
                  <div className="text-center">
                    <span
                      onClick={() =>
                        removeCandidate(
                          parent_index,
                          columnName,
                          index,
                          cand_index
                        )
                      }
                      className=" cursor-pointer border-b border-b-transparent text-xs text-red-500 hover:border-red-500"
                    >
                      Remove Candidate
                    </span>
                  </div>
                  <div className=" relative mb-1 grid grid-cols-12 items-center gap-1">
                    <p className="col-span-2 text-xs ">Name:</p>
                    <input
                      type="text"
                      className="col-span-10 w-full border-b border-l-0 border-r-0 border-t-0 text-sm focus:border-none focus:outline-none"
                      name=""
                      id=""
                      value={cand?.name ? cand?.name : ""}
                      onChange={(e) =>
                        changeCandidates(
                          parent_index,
                          columnName,
                          index,
                          cand_index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    {/* <span
                      onClick={() =>
                        removeCandidate(
                          parent_index,
                          columnName,
                          index,
                          cand_index
                        )
                      }
                      className="absolute -top-2 left-1/2 -translate-x-1/2 cursor-pointer text-xs text-red-500 hover:border-b hover:border-red-500"
                    >
                      Remove Candidate
                    </span> */}
                  </div>

                  <div className="grid grid-cols-12 items-center gap-1">
                    <p className="col-span-2 text-xs ">Party:</p>
                    <input
                      type="text"
                      className="col-span-10 w-full border-b border-l-0 border-r-0 border-t-0 text-sm focus:border-none focus:outline-none"
                      name=""
                      id=""
                      value={cand?.party}
                      onChange={(e) =>
                        changeCandidates(
                          parent_index,
                          columnName,
                          index,
                          cand_index,
                          "party",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <div
                  className="grid grid-cols-12 items-center "
                  key={cand_index}
                >
                  <span className="col-span-1 grid  items-center">
                    <TbOvalVertical className="text-xl" />
                  </span>
                  <div className="col-span-11 pl-2">
                    <p className="break-all text-base font-medium capitalize">
                      {cand?.name}
                    </p>
                    <p className="break-all text-xs  capitalize">
                      {cand?.party}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {Number(race?.for_candidate_petition) === 1 ||
          Number(race?.is_federal) === 1 ? (
            <p
              className={`ml-3 inline-block cursor-pointer ${
                isEditing ? "" : "hidden"
              }`}
              onClick={() => addCandidate(parent_index, columnName, index)}
            >
              <PlusCircleIcon className="w-8 text-blue-400 transition-all duration-300 hover:text-blue-500" />
            </p>
          ) : null}

          {/* --- & write in --- */}
          {(() => {
            if (
              Number(race?.for_candidate_petition) === 1 ||
              Number(race?.is_federal) === 1
            ) {
              const divArray = [];
              for (let i = 0; i < Number(race?.vote_for_phrase); i++) {
                divArray.push(
                  <div
                    key={i}
                    className="grid grid-cols-12 items-center px-3 py-2"
                  >
                    <span className="col-span-1 grid  items-center">
                      <TbOvalVertical className="text-xl" />
                    </span>
                    <div className="col-span-11 pl-3">
                      <p className="border-b border-gray-800 pb-2 text-sm">
                        Write-in
                      </p>
                    </div>
                  </div>
                );
              }
              return divArray;
            }
          })()}

          {/* ------- amendment -------- */}
          {race?.amendment?.title && (
            <Amendment
              amendment={race?.amendment}
              isEditing={isEditing}
              parent_index={parent_index}
              col_name={columnName}
              col_index={index}
              allRaces={allRaces}
              setAllRaces={setAllRaces}
            />
          )}

          {/* ---- precincts ---- */}
          <div className="grid place-items-center border-b border-t border-black px-4 py-1">
            {isEditing ? (
              <>
                <div className="flex w-full  items-center justify-center gap-2 ">
                  <textarea
                    className="w-full rounded-md text-sm focus:border-[#7e3fad] focus:ring-0"
                    value={race?.precincts}
                    onChange={(e) => {
                      handlePrecinct_change(
                        parent_index,
                        columnName,
                        index,
                        e.target.value
                      );
                    }}
                  />

                  <PencilIcon className="w-4" strokeWidth={2} />
                </div>
                <div className="my-2 flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="cursor-pointer text-purple-600 focus:ring-0"
                    onChange={(e) => {
                      handlePrecinct_change(
                        parent_index,
                        columnName,
                        index,
                        e?.target.checked ? "Countywide" : ""
                      );
                    }}
                  />
                  <label className=" block text-sm text-gray-700">
                    Countywide
                  </label>
                </div>
              </>
            ) : (
              <h6 className="">{race?.precincts}</h6>
            )}
          </div>
        </div>
      ))}

      {isEditing && (
        <div
          className={`flex justify-center px-2 py-2 ${
            selElectionRaces?.length === selectedRacesIds?.length
              ? "hidden"
              : ""
          }`}
        >
          <select
            className={`mx-auto mb-3 max-w-full cursor-pointer rounded border border-[#662D91]  text-sm capitalize text-[#662D91] disabled:cursor-not-allowed`}
            onChange={(e) =>
              handleRaceSelect(e.target.value, parent_index, columnName)
            }
            disabled={raceSelect_loading}
          >
            <option defaultValue className="text-gray-500">
              Add Race
            </option>
            {selElectionRaces?.map((race) => {
              if (!selectedRacesIds?.includes(race?.id)) {
                return (
                  <option
                    key={race?.id}
                    value={race?.id}
                    className="capitalize text-black"
                  >
                    {race?.name}
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

export default Races;
