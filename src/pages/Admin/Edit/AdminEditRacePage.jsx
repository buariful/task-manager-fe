import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { JsonParse, county_change } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import TreeSDK from "Utils/TreeSDK";
import { SkeletonLoader } from "Components/Skeleton";
import { MultiSelect } from "react-multi-select-component";
import "./adminEditRace.css";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { SearchDropdown } from "Components/SearchDropdown";
import Counties from "../../../utils/counties.json";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminEditRacePage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const schema = yup
    .object({
      Name: yup.string().required(),
      Phrase: yup.string().required(),
      amendment_title: yup.string(),
      amendment_summary: yup.string(),
      amendment_question: yup.string(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [isLoading, setIsLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState({});
  const [allPrecinsts, setAllPrecinsts] = useState([]);
  const [selectedPrecinsts, setSelectedPrecinsts] = useState([]);
  const [precinstsError, setPrecinstsError] = useState(false);
  const [filteredCounties, setFilteredCounties] = useState([]);

  const [allParty, setAllParty] = useState([]);
  const [selectedParty, setSelectedParty] = useState([]);
  const [partyError, setPartyError] = useState(false);
  const [isAreaWide, setIsAreaWide] = useState(false);
  const [isPartyNA, setIsPartyNA] = useState(false);
  const [racePrevName, setRacePrevName] = useState("");
  const [isAddingAmendment, setIsAddingAmendment] = useState(false);
  const [prevAmendment, setPrevAmendment] = useState(null);
  const [amend_options, setAmend_options] = useState([""]);
  const [option_error, setOption_error] = useState(false);
  const [amendSummary, setAmendSummary] = useState("");
  const [isEditorEmpty, setIsEditorEmpty] = useState(false);
  const [isFederal, setIsFederal] = useState(false);
  const [selectedRaceType, setSelectedRaceType] = useState([]);
  const [raceTypeError, setRaceTypeError] = useState(false);
  const [electionInfo, setElectionInfo] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();
  const [countyInCharge, setCountyInCharge] = useState([]);
  const [countyInChargeError, setCountyInChargeError] = useState(false);

  const raceTypeOptions = [
    { label: "For Candidate Petition", value: 1, realValue: 1 },
    { label: "Amendment", value: 0, realValue: 0 },
  ];
  const raceTypeOptions2 = [
    { label: "State", value: 1, realValue: 1 },
    { label: "Federal", value: 2, realValue: 0 },
    { label: "Amendment", value: 3, realValue: 0 },
  ];

  const navigate = useNavigate();
  const [id, setId] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();

  const handleChangeType = (value) => {
    try {
      setRaceTypeError(false);
      let race_type_obj;
      if (value?.length < 2) {
        setSelectedRaceType(value);
        race_type_obj = value[0];
      } else {
        setSelectedRaceType([value[value?.length - 1]]);
        race_type_obj = value[value?.length - 1];
      }

      if (race_type_obj.label == "Amendment") {
        setIsAddingAmendment(true);
        setIsFederal(false);
      } else if (race_type_obj.label == "Federal") {
        setIsAddingAmendment(false);
        setIsAreaWide(true);
        setIsFederal(true);
        setCountyInCharge([]);
        setSelectedPrecinsts([
          {
            label: `Statewide`,
            value: `statewide`,
            id: `statewide`,
            name: `statewide`,
          },
        ]);
      } else {
        setIsAddingAmendment(false);
        setIsFederal(false);
      }
    } catch (error) {
      console.log(error?.message);
    }
  };

  const handle_areaCheckbox = (e) => {
    try {
      setPrecinstsError(false);
      setIsAreaWide(e.target.checked);
      if (e.target.checked) {
        const isCountywide = Number(data?.election_type) === 1;
        setSelectedPrecinsts([
          {
            label: `${isCountywide ? "County" : "State"}wide`,
            value: `${isCountywide ? "county" : "state"}wide`,
            id: `${isCountywide ? "county" : "state"}wide`,
            name: `${isCountywide ? "county" : "state"}wide`,
          },
        ]);
      } else {
        setSelectedPrecinsts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckEmpty = async (content, editor) => {
    setAmendSummary(content);
    const isEmpty = !editor?.getText()?.trim();
    setIsEditorEmpty(isEmpty);
    return isEmpty;
  };

  const removeAmndment_opt = (index) => {
    try {
      const amnd_copy = [...amend_options];
      amnd_copy.splice(index, 1);
      setAmend_options(amnd_copy);
    } catch (error) {
      console.log(error?.message);
    }
  };
  const editAmndment_opt = (index, value) => {
    setOption_error(false);
    try {
      let amnd_copy = [...amend_options];
      amnd_copy[index] = value;
      setAmend_options(amnd_copy);
    } catch (error) {
      console.log(error?.message);
    }
  };

  const inputValidations = (_data) => {
    try {
      let validate_success = true;
      if (selectedPrecinsts.length < 1) {
        setPrecinstsError(true);
        validate_success = false;
      }
      if (selectedParty.length < 1) {
        setPartyError(true);
        validate_success = false;
      }

      if (isAddingAmendment) {
        if (!_data?.amendment_title) {
          validate_success = false;
          setError("amendment_title", {
            type: "manual",
            message: "Please write a amendment title.",
          });
        }
        if (!amendSummary) {
          validate_success = false;
          setIsEditorEmpty(true);
        }
        let optionEmpty = false;
        amend_options?.map((op) => {
          if (!op) optionEmpty = true;
        });

        if (optionEmpty) {
          validate_success = false;
          setOption_error(true);
        }
      }

      return validate_success;
    } catch (error) {
      console.log("inputValidations", error?.message);
      return false;
    }
  };

  const onSubmit = async (_data) => {
    // if inactive race
    if (!data?.status) return;

    const inputValidation_success = await inputValidations(_data);
    if (!inputValidation_success) return;
    setIsLoading(true);
    try {
      //  modifying precincts and parties
      const precinsts = selectedPrecinsts?.map((pr) => ({
        name: pr?.label,
        id: pr?.id,
      }));
      const parties = selectedParty?.map((par) => ({
        name: par?.name,
        id: par?.id,
      }));

      // ---- payload -------
      let raceData = {
        id: id,
        name: _data.Name,
        vote_for_phrase: _data.Phrase,
        for_candidate_petition: selectedRaceType[0]?.realValue,
      };
      if (isAreaWide) {
        const isCountrywide = Number(data?.election_type) === 1;
        raceData["precincts"] = JSON.stringify([
          {
            id: `${isCountrywide ? "county" : "state"}wide`,
            name: `${isCountrywide ? "county" : "state"}wide`,
          },
        ]);
      } else {
        raceData["precincts"] = JSON.stringify(precinsts);
      }

      if (isPartyNA) {
        raceData["parties"] = JSON.stringify([{ id: "NA", name: "NA" }]);
      } else {
        raceData["parties"] = JSON.stringify(parties);
      }

      if (isAddingAmendment) {
        raceData["amendment"] = JSON.stringify({
          title: _data?.amendment_title,
          // summary: _data?.amendment_summary,
          summary: amendSummary,
          question: _data?.amendment_question,
          options: amend_options,
          race_id: id,
        });
      }
      if (prevAmendment && !isAddingAmendment) {
        raceData["amendment"] = "";
      }

      if (data?.election_type == 2) {
        raceData["county"] = selectedPrecinsts
          ?.map((pr) => pr.label)
          ?.join(", ");
      }
      let is_federal;
      if (selectedRaceType[0]?.label == "Federal") {
        is_federal = 1;
      } else {
        is_federal = 0;
      }
      raceData["is_federal"] = is_federal;

      if (data?.election_type == 2) {
        raceData["county"] = selectedPrecinsts
          ?.map((pr) => pr.label)
          ?.join(", ");

        raceData["countyInCharge"] = countyInCharge[0]?.label;
      } else {
        raceData["countyInCharge"] = data?.county;
        raceData["county"] = data?.county;
      }

      //  check the race name
      if (racePrevName?.toLowerCase() !== _data.Name?.toLowerCase()) {
        const nameCheck = await sdk.checkRaceName(_data.Name, electionInfo?.id);
        if (nameCheck?.message === true) {
          setError("Name", {
            type: "manual",
            message: "Race exist!",
          });
          setIsLoading(false);
          return;
        }
      }

      sdk.setTable("races");
      const result = await sdk.callRestAPI(raceData, "PUT");

      if (!result.error) {
        //  update election race_id
        let parsedElRaces_id = JsonParse(electionInfo?.races_id);
        parsedElRaces_id = parsedElRaces_id.map((raceInfo) => {
          if (Number(raceInfo?.id) === Number(id)) {
            return {
              ...raceInfo,
              for_candidate_petition: selectedRaceType[0]?.realValue,
              name: _data.Name,
              is_federal: is_federal,
            };
          } else return raceInfo;
        });
        await tdk.update("elections", electionInfo?.id, {
          races_id: JSON.stringify(parsedElRaces_id),
        });

        showToast(globalDispatch, "Race updated successfully");

        navigate(
          `/admin/race${
            searchParams.get("election_id")
              ? "?election_id=" + searchParams.get("election_id")
              : ""
          }${
            searchParams.get("template")
              ? "&template=" + searchParams.get("template")
              : ""
          }`
        );
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
  };

  const getCounties = async (raceState) => {
    try {
      const stateCounties = Counties.filter(
        (county) => county?.state?.toLowerCase() === raceState?.toLowerCase()
      );

      setFilteredCounties(stateCounties);
      return stateCounties;
    } catch (error) {
      console.log(error);
      tokenExpireError(dispatch, error?.message);
    }
  };

  const getAllPrecincts = async (raceCounty) => {
    try {
      const precinctResult = await new TreeSDK().getList("precincts", {
        filter: [`county_name,eq,'${raceCounty}'`],
      });
      const precinctResult_mod = precinctResult?.list?.map((pre) => ({
        ...pre,
        label: pre?.precinct_name,
        value: pre?.id,
      }));
      const precinctsAsObj = precinctResult_mod?.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      setAllPrecinsts(precinctResult_mod);
      return precinctsAsObj;
    } catch (error) {
      console.log(error);
      tokenExpireError(dispatch, error?.message);
    }
  };

  const getAllParties = async (raceState, raceCounty, electionType) => {
    try {
      const filter = [
        `state,eq,'${raceState}'`,
        `election_type,eq,${electionType}`,
      ];
      if (Number(electionType) === 1) {
        filter.push(`county,eq,'${raceCounty}'`);
      }

      const partyResult = await new TreeSDK().getList("parties", {
        filter,
      });
      const partyResult_mod = partyResult?.list?.map((pre) => ({
        ...pre,
        label: pre?.name,
        value: pre?.id,
      }));
      const partyAsObj = partyResult_mod?.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
      setAllParty(partyResult_mod);
      return partyAsObj;
    } catch (error) {
      console.log(error);
      tokenExpireError(dispatch, error?.message);
    }
  };
  const getRaceInfo = async (
    precinctsAsObj,
    partyAsObj,
    stateCounties,
    race
  ) => {
    try {
      // find previous selected precincts
      const paresed_precinsts = JSON.parse(race?.model?.precincts) || [];
      const selectedAreasIDs = paresed_precinsts.map((pre) => pre?.id);
      let findSelected_Precincts = [];
      const electionType = race?.model?.election_type;

      switch (paresed_precinsts[0]?.id) {
        case "countywide":
          findSelected_Precincts = [
            {
              id: "countywide",
              name: "countywide",
              label: "Countywide",
              value: "countywide",
            },
          ];
          setIsAreaWide(true);
          break;
        case "statewide":
          findSelected_Precincts = [
            {
              id: "statewide",
              name: "statewide",
              label: "statewide",
              value: "statewide",
            },
          ];
          const findCountyInCharge = Counties?.find(
            (county) =>
              county?.county?.toLowerCase() ==
                race?.model?.countyInCharge?.toLowerCase() &&
              county?.state?.toLowerCase() == race?.model?.state?.toLowerCase()
          );

          setIsAreaWide(true);
          setCountyInCharge(findCountyInCharge ? [findCountyInCharge] : []);
          break;
        default:
          const isCountryOfficial = Number(electionType) === 1;
          if (isCountryOfficial) {
            findSelected_Precincts = paresed_precinsts
              .map((item) => precinctsAsObj[item?.id])
              .filter((v) => v);
          } else {
            findSelected_Precincts = stateCounties.filter((county) =>
              selectedAreasIDs.includes(county.id)
            );

            const inCharge = findSelected_Precincts?.find(
              (pre) => pre?.label == race?.model?.countyInCharge
            );
            if (inCharge?.label) {
              setCountyInCharge([inCharge]);
            } else {
              setCountyInCharge([
                {
                  label: race?.model?.countyInCharge,
                  value: race?.model?.countyInCharge,
                },
              ]);
            }
          }
      }

      // find previous selected parties
      let findSelected_Parties = [];
      const parsedParites = JSON.parse(race?.model?.parties) || [];
      if (parsedParites[0]?.id === "NA") {
        setIsPartyNA(true);
        findSelected_Parties = [
          { id: "NA", name: "NA", label: "NA", value: "NA" },
        ];
      } else {
        findSelected_Parties = parsedParites
          .map((item) => partyAsObj[item.id])
          .filter((v) => v);
      }

      // --------amendment -----------
      if (race?.model?.amendment) {
        const amendmentParsed = JSON.parse(race?.model?.amendment) || {};
        setPrevAmendment(amendmentParsed);
        setAmend_options(amendmentParsed?.options);
        setAmendSummary(amendmentParsed?.summary);
        // setValue("amendment_summary", amendmentParsed?.summary);
        setValue("amendment_title", amendmentParsed?.title);
        setValue("amendment_question", amendmentParsed?.question);
        setIsAddingAmendment(true);
      }
      let race_type;
      if (race?.model?.amendment) {
        race_type =
          Number(electionType) === 1 ? raceTypeOptions[1] : raceTypeOptions2[2];
      } else {
        race_type = (
          Number(electionType) === 1 ? raceTypeOptions : raceTypeOptions2
        )?.find(
          (tp) => tp.realValue === Number(race?.model?.for_candidate_petition)
        );
      }
      setIsFederal(race?.model?.is_federal ? true : false);
      setSelectedRaceType([race_type]);
      setSelectedPrecinsts(findSelected_Precincts);
      setSelectedParty(findSelected_Parties);
      setRacePrevName(race.model.name);
      setValue("Name", race.model.name);
      setValue("Phrase", race.model.vote_for_phrase);
      setId(race.model.id);
    } catch (error) {
      console.log(error);
      tokenExpireError(dispatch, error?.message);
    }
    return;
  };

  const getElection = async (electionId) => {
    if (!electionId) return {};
    try {
      const election = await tdk.getOne("elections", electionId);
      return election?.model || {};
    } catch (error) {
      console.log(error);
      tokenExpireError(dispatch, error?.message);
      return {};
    }
  };

  async function getAllData() {
    try {
      setLoading(true);
      sdk.setTable("races");
      //   const race = await sdk.callRestAPI(
      //     { id: Number(params?.id), join: "elections" },
      //     "GET"
      //   );
      const race = await tdk.getOne("races", Number(params?.id), {
        join: "elections",
      });
      const {
        state: raceState,
        county: raceCounty,
        election_type,
        election_id,
      } = race?.model;
      setData(race?.model);

      const [stateCounties, partyAsObj, election, precinctsAsObj] =
        await Promise.all([
          getCounties(raceState),
          getAllParties(raceState, raceCounty, election_type),
          getElection(election_id),
          (() => {
            if (Number(election_type) === 1) return getAllPrecincts(raceCounty);
            else return {};
          })(),
        ]);

      await getRaceInfo(precinctsAsObj, partyAsObj, stateCounties, race);
      setElectionInfo(election);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "races",
      },
    });

    getAllData();
  }, []);

  return (
    <div className=" min-h-screen p-5 sm:p-10">
      <FilterBoxBg>
        <h4 className="text-2xl font-medium">Edit Race</h4>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
            <SearchDropdown
              options={
                Number(data?.election_type) === 1
                  ? raceTypeOptions
                  : raceTypeOptions2
              }
              selected_states={selectedRaceType}
              label={"Race Type"}
              stateError={raceTypeError}
              errorMessage={"Please select a type."}
              stateChangeFn={(value) => {
                handleChangeType(value);
              }}
              className={"mb-4 mt-3"}
            />
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 md:gap-5">
              <MkdInput
                type={"text"}
                page={"edit"}
                name={"Name"}
                errors={errors}
                label={"Name"}
                // placeholder={"Name"}
                register={register}
                className={""}
              />

              <div className="">
                <label
                  htmlFor="vote_phrase"
                  className="mb-2 block text-sm font-[400]"
                >
                  Vote For Phrase
                </label>
                <input
                  id="vote_phrase"
                  type={"number"}
                  // placeholder={"Vote for phrase"}
                  min={1}
                  {...register("Phrase")}
                  className={`focus:shadow-outline w-full appearance-none rounded border bg-[#f5f5f5] px-3 py-2.5 text-sm leading-tight focus:outline-none ${
                    errors?.Phrase?.message
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                />
                <p className="text-field-error italic text-red-500">
                  {errors?.Phrase?.message}
                </p>
              </div>
            </div>

            {!isFederal ? (
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <label className="mb-2 block  text-sm font-[400]">
                    {Number(data?.election_type) === 1
                      ? "Precincts"
                      : "Select Counties"}
                  </label>

                  <div className="flex gap-1">
                    <input
                      type="checkbox"
                      checked={isAreaWide}
                      id="allAreas"
                      className="cursor-pointer text-purple-600 focus:ring-0"
                      onChange={handle_areaCheckbox}
                    />
                    <label
                      htmlFor="allAreas"
                      className="mb-2 block cursor-pointer text-sm font-[400]"
                    >
                      {Number(data?.election_type) === 1 ? "County" : "State"}
                      wide
                    </label>
                  </div>
                </div>
                <MultiSelect
                  options={
                    Number(data?.election_type) === 1
                      ? allPrecinsts
                      : filteredCounties
                  }
                  value={selectedPrecinsts}
                  onChange={(value) => {
                    setSelectedPrecinsts(value);
                    setPrecinstsError(false);
                  }}
                  overrideStrings={{
                    allItemsAreSelected: `All ${
                      Number(data?.election_type) === 1
                        ? "precincts"
                        : "counties"
                    } are selected.`,
                  }}
                  hasSelectAll={false}
                  labelledBy="Select..."
                  disabled={isAreaWide}
                  className={`multiSelect_customStyle ${
                    precinstsError && "error"
                  } ${isAreaWide && "cursorNot_Allowed"}`}
                />

                {data?.election_type == 2 ? (
                  <SearchDropdown
                    options={
                      selectedPrecinsts[0]?.label?.toLowerCase() == "statewide"
                        ? filteredCounties
                        : selectedPrecinsts
                    }
                    selected_states={countyInCharge}
                    label={"County In Charge"}
                    stateError={countyInChargeError}
                    errorMessage={"Please select a county."}
                    stateChangeFn={(value) => {
                      setCountyInChargeError(false);
                      county_change(value, setCountyInCharge);
                    }}
                    className={"mb-5 mt-5"}
                  />
                ) : null}
                <p className="text-field-error italic text-red-500">
                  {precinstsError && "Please Select atleast one option."}
                </p>
              </div>
            ) : null}

            <div className="mb-8">
              <div className="flex items-center justify-between">
                <label className="mb-2 block text-sm font-[400] ">
                  Select Party
                </label>
                <div className="flex gap-1">
                  <input
                    id="NA"
                    className="cursor-pointer text-purple-600 focus:ring-0"
                    type="checkbox"
                    checked={isPartyNA}
                    onChange={(e) => {
                      setIsPartyNA(e.target.checked);
                      setPartyError(false);
                      if (e.target.checked) {
                        setSelectedParty([
                          {
                            label: "NA",
                            value: "NA",
                            id: "NA",
                            name: "NA",
                          },
                        ]);
                      } else {
                        setSelectedParty([]);
                      }
                    }}
                  />
                  <label
                    htmlFor="NA"
                    className="mb-2 block cursor-pointer text-sm font-[400]"
                  >
                    NA
                  </label>
                </div>
              </div>
              <MultiSelect
                options={allParty}
                value={selectedParty}
                onChange={(value) => {
                  setSelectedParty(value);
                  setPartyError(false);
                }}
                disabled={isPartyNA}
                overrideStrings={{
                  allItemsAreSelected: `All parties are selected.`,
                }}
                hasSelectAll={false}
                labelledBy="Select..."
                className={`multiSelect_customStyle ${partyError && "error"}  ${
                  isPartyNA && "cursorNot_Allowed"
                }`}
              />

              <p className="text-field-error italic text-red-500">
                {partyError && "Please Select atleast one option."}
              </p>
            </div>

            {isAddingAmendment && (
              <>
                <div className="mb-5">
                  <label
                    // htmlFor="amendment_title"
                    className="mb-2 block text-sm font-[400]"
                  >
                    Amendment Title
                  </label>
                  <input
                    id="amendment_title"
                    type={"text"}
                    // placeholder={"Title"}
                    min={1}
                    {...register("amendment_title")}
                    className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none ${
                      errors?.amendment_title?.message
                        ? "border-red-500"
                        : "border-transparent"
                    }`}
                  />
                  <p className="text-field-error italic text-red-500">
                    {errors?.amendment_title?.message}
                  </p>
                </div>

                <div className="mb-5">
                  <label
                    // htmlFor="amendment_summary"
                    className="mb-2 block text-sm font-[400]"
                  >
                    Amendment Summary
                  </label>
                  <ReactQuill
                    onChange={(content, _delta, _source, editor) =>
                      handleCheckEmpty(content, editor)
                    }
                    className={`${
                      isEditorEmpty ? "" : ""
                    } hide_toolbar bg_darkWhite no_border`}
                    value={amendSummary}
                    modules={{
                      toolbar: [], // Empty array to hide the toolbar
                    }}
                  />
                  <p className="text-field-error italic text-red-500">
                    {isAddingAmendment && isEditorEmpty
                      ? "Please add a summary"
                      : ""}
                  </p>
                </div>

                <div className="mb-5">
                  <label
                    // htmlFor="amendment_question"
                    className="mb-2 block text-sm font-[400]"
                  >
                    Options
                  </label>
                  {option_error ? (
                    <p className="text-field-error italic text-red-500">
                      Option cannot be left empty.
                    </p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-5">
                    {amend_options?.map((opt, opt_i) => (
                      <div className="relative mb-4" key={opt_i}>
                        <input
                          type={"text"}
                          // placeholder={"Option"}
                          value={opt}
                          onChange={(e) =>
                            editAmndment_opt(opt_i, e.target.value)
                          }
                          className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none`}
                        />
                        <span
                          className="absolute -right-1 -top-1 z-30 grid h-3.5 w-3.5 cursor-pointer place-items-center rounded-full bg-red-500 text-white"
                          onClick={() => removeAmndment_opt(opt_i)}
                        >
                          <XMarkIcon className="w-3" strokeWidth={3} />
                        </span>
                      </div>
                    ))}
                  </div>

                  <p
                    className={`ml-3 inline-block cursor-pointer `}
                    onClick={() => setAmend_options([...amend_options, ""])}
                  >
                    <PlusCircleIcon className="w-8 text-blue-500" />
                  </p>
                </div>
              </>
            )}

            {data?.status ? (
              <InteractiveButton
                type="submit"
                className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
                loading={isLoading}
                disable={isLoading}
              >
                Submit
              </InteractiveButton>
            ) : null}
          </form>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default AdminEditRacePage;
