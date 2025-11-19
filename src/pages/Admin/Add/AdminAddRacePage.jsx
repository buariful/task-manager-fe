import React, { useCallback, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { isImage, empty, isVideo, isPdf, county_change } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import { MultiSelect } from "react-multi-select-component";
import TreeSDK from "Utils/TreeSDK";
import "./adminAddRacePage.css";
import FilterBoxBg from "Components/FilterBoxBg/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { SearchDropdown } from "Components/SearchDropdown";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";
import counties from "../../../utils/counties.json";
import { MkdTabContainer } from "Components/MkdTabContainer";
import * as XLSX from "xlsx";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminAddRacePage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      Name: yup.string().required(),
      Phrase: yup.string().required(),
      amendment_title: yup.string(),
      amendment_summary: yup.string(),
      amendment_question: yup.string(),
    })
    .required();

  const { dispatch, state } = React.useContext(AuthContext);

  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [isPartyNA, setIsPartyNA] = useState(false);
  const [allElections, setAllElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState([]);
  const [electionError, setElectionError] = useState(false);

  const [isFederal, setIsFederal] = useState(false);
  const [selectedRaceType, setSelectedRaceType] = useState([]);
  const [raceTypeError, setRaceTypeError] = useState(false);

  const [allPrecincts, setAllPrecincts] = useState([]);
  const [selectedPrecinsts, setSelectedPrecinsts] = useState([]);
  const [countyInCharge, setCountyInCharge] = useState([]);
  const [countyInChargeError, setCountyInChargeError] = useState(false);
  const [precinstsError, setPrecinstsError] = useState(false);
  const [isAreaWide, setIsAreaWide] = useState(false);
  // const [filteredCounties, setFilteredCounties] = useState([]);

  const [allParty, setAllParty] = useState([]);
  const [selectedParty, setSelectedParty] = useState([]);
  const [partyError, setPartyError] = useState(false);

  const [isAddingAmendment, setIsAddingAmendment] = useState(false);
  const [amend_options, setAmend_options] = useState(["", ""]);
  const [option_error, setOption_error] = useState(false);
  const [amendSummary, setAmendSummary] = useState("");
  const [isEditorEmpty, setIsEditorEmpty] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const election_id = searchParams.get("election_id");

  const [electionType, setElectionType] = useState([]);
  const [selected_states, setSelected_states] = useState([]);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);

  const [electionTypeErrorMessage, setElectionTypeErrorMessage] = useState("");
  const [stateErrorMessage, setStateErrorMessage] = useState(false);

  const [countyErrorMessage, setCountyErrorMessage] = useState(false);

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
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleChangeType = (value) => {
    try {
      setRaceTypeError(false);
      let selected_type;
      if (value?.length < 2) {
        setSelectedRaceType(value);
        selected_type = value[0];
      } else {
        setSelectedRaceType([value[value?.length - 1]]);
        selected_type = value[value?.length - 1];
      }

      if (selected_type.label === "Amendment") {
        setIsAddingAmendment(true);
        setIsAreaWide(false);
        setIsFederal(false);
        setSelectedPrecinsts([]);
        setCountyInCharge([]);
      } else if (selected_type.label === "Federal") {
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
        setIsAreaWide(false);
        setIsFederal(false);
        setSelectedPrecinsts([]);
        setCountyInCharge([]);
      }
    } catch (error) {
      console.log(error?.message);
    }
  };
  const handle_areaCheckbox = (e) => {
    setIsAreaWide(e.target.checked);
    setPrecinstsError(false);
    if (e.target.checked) {
      // setSelectedPrecinsts(allPrecinsts);
      const isCountrywide = Number(electionType?.[0]?.value) === 1;
      setSelectedPrecinsts([
        {
          label: `${isCountrywide ? "County" : "State"}wide`,
          value: `${isCountrywide ? "county" : "state"}wide`,
          id: `${isCountrywide ? "county" : "state"}wide`,
          name: `${isCountrywide ? "county" : "state"}wide`,
        },
      ]);
    } else {
      setSelectedPrecinsts([]);
      setCountyInCharge([]);
    }
  };
  const handleCheckEmpty = async (content, editor) => {
    setAmendSummary(content);
    const isEmpty = !editor?.getText()?.trim();
    setIsEditorEmpty(isEmpty);
    return isEmpty;
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
      if (selectedElection.length < 1) {
        setElectionError(true);
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

  const onSubmit = async (_data) => {
    try {
      const inputValidation_success = await inputValidations(_data);
      if (!inputValidation_success) return;

      setIsSubmitLoading(true);
      // checking if there race exist with same name or not
      const nameCheck = await sdk.checkRaceName(
        _data.Name,
        selectedElection[0]?.id
      );
      if (nameCheck?.message === true) {
        setError("Name", {
          type: "manual",
          message: "Race exist!",
        });
        setIsSubmitLoading(false);
        return;
      }
      //   modify precincts and parties for storing at races table
      const precinsts = selectedPrecinsts?.map((pr) => ({
        // name: pr?.precinct_name,
        name: pr?.label,
        id: pr?.id,
      }));
      const parties = selectedParty?.map((par) => ({
        name: par?.name,
        id: par?.id,
      }));

      let raceData = {
        name: _data.Name,
        vote_for_phrase: _data.Phrase,
        state: selected_states[0]?.value,
        county: selected_county[0]?.value,
        for_candidate_petition: selectedRaceType[0]?.realValue,
        election_type: electionType?.[0]?.value,
        // status: 1,
      };

      if (electionType?.[0]?.value == 2) {
        raceData["county"] = selectedPrecinsts
          ?.map((pr) => pr.label)
          ?.join(", ");

        raceData["countyInCharge"] = countyInCharge[0]?.label;
      } else {
        raceData["countyInCharge"] = selected_county[0]?.value;
      }

      let is_federal;
      if (selectedRaceType[0]?.label == "Federal") {
        is_federal = 1;
      } else {
        is_federal = 0;
      }
      raceData["is_federal"] = is_federal;

      if (isAreaWide) {
        raceData["precincts"] = JSON.stringify([
          {
            id: `${
              Number(electionType?.[0]?.value) === 1 ? "county" : "state"
            }wide`,
            name: `${
              Number(electionType?.[0]?.value) === 1 ? "county" : "state"
            }wide`,
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
      if (selectedElection?.length > 0) {
        raceData["election_id"] = selectedElection[0]?.id;
        raceData["status"] = selectedElection[0]?.status;
      }
      // --------- inserting race into race table ---------
      sdk.setTable("races");
      const result = await sdk.callRestAPI(raceData, "POST");

      if (!result.error) {
        if (selectedElection?.length > 0) {
          let prevRaces = selectedElection[0]?.races_id
            ? JSON.parse(selectedElection[0]?.races_id) || [] //if any error while parsing
            : [];

          // ----------- add the race to election's race_id ------------
          prevRaces = [
            ...prevRaces,
            {
              id: result?.data,
              name: _data.Name,
              for_candidate_petition: selectedRaceType[0]?.realValue,
              is_federal,
            },
          ];
          await tdk.update("elections", selectedElection[0]?.id, {
            races_id: JSON.stringify(prevRaces),
          });
        }
        if (isAddingAmendment) {
          await tdk.update("races", result?.data, {
            amendment: JSON.stringify({
              title: _data?.amendment_title,
              // summary: _data?.amendment_summary,
              summary: amendSummary,
              question: _data?.amendment_question,
              options: amend_options,
              race_id: result?.data,
            }),
          });
        }
        showToast(globalDispatch, "Race created successfully.");
        navigate(
          `/admin/race${
            searchParams.get("election_id")
              ? "?election_id=" + searchParams.get("election_id")
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
      setIsSubmitLoading(false);
    } catch (error) {
      setIsSubmitLoading(false);
      console.log("Error", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
  };

  const getDataOfSelectedArea = useCallback(async () => {
    try {
      setLoading2(true);
      setAllElections([]);
      setSelectedElection([]);
      setSelectedParty([]);
      setSelectedPrecinsts([]);
      setElectionError(false);
      setPartyError(false);
      setPrecinstsError(false);

      const ifAllSelected =
        electionType?.length &&
        selected_states?.length &&
        selected_county?.length;
      const ifStateTypeSelected =
        electionType?.length && selected_states?.length;

      let elections = [];
      let parties = [];
      let precinctResult = [];

      const type = Number(electionType?.[0]?.value);
      const state = selected_states?.[0]?.value;
      const county = selected_county?.[0]?.value;

      if (ifStateTypeSelected && type === 2) {
        const filter = ["election_type,eq,2", `state,eq,'${state}'`];

        const [electionRes, partyRes] = await Promise.all([
          tdk.getList("elections", { filter }),
          tdk.getList("parties", { filter }),
        ]);

        elections = electionRes;
        parties = partyRes;
      }

      if (ifAllSelected && type === 1) {
        const filter = [
          "election_type,eq,1",
          `state,eq,'${state}'`,
          `county,eq,'${county}'`,
        ];

        const [electionRes, partyRes, precinctRes] = await Promise.all([
          tdk.getList("elections", { filter }),
          tdk.getList("parties", { filter }),
          tdk.getList("precincts", {
            filter: [`county_name,eq,'${county}'`],
          }),
        ]);

        elections = electionRes;
        parties = partyRes;
        precinctResult = precinctRes?.list;
      }

      // storing data in the states
      const result_mod =
        elections?.list?.map((election) => ({
          ...election,
          label: election?.name,
          value: election?.id,
        })) || [];

      const party_mod =
        parties?.list?.map((pre) => ({
          ...pre,
          label: pre?.name,
          value: pre?.id,
        })) || [];

      const precincts_mod =
        precinctResult?.map((item) => ({
          label: item?.precinct_name,
          value: item?.precinct_name,
        })) || [];

      setAllElections(result_mod);
      setAllParty(party_mod);
      setAllPrecincts(precincts_mod);

      if (result_mod.length) {
        if (election_id) {
          setSelectedElection([
            result_mod.find((elec) => elec.id === Number(election_id)),
          ]);
        } else {
          setSelectedElection([result_mod[0]]);
        }
      }
    } catch (error) {
      console.log("getDataOfSelectedArea ->>", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }

    setLoading2(false);
  }, [electionType, selected_states, selected_county]);

  useEffect(() => {
    getDataOfSelectedArea();
  }, [electionType, selected_states, selected_county]);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "races",
      },
    });
  }, []);

  const handleElectionData = async (electionId) => {
    if (!electionId) return;
    try {
      const election = await tdk.getOne("elections", electionId);
      const {
        election_type,
        state,
        county,
        name: electionName,
      } = election?.model;

      const stateCounties = counties.filter(
        (county) => county?.state?.toLowerCase() === state?.toLowerCase()
      );

      setElectionType([
        {
          value: election_type,
          label: Number(election_type) === 1 ? "County" : "State",
        },
      ]);
      setSelected_states([{ label: state, value: state }]);
      setSelected_county([{ label: county, value: county }]);
      setSelectedElection([{ label: electionName, value: electionId }]);
      setFiltered_counties(stateCounties);
    } catch (error) {
      console.log("handleElectionData->>", error?.message);
      showToast(globalDispatch, error?.message);
      tokenExpireError(dispatch, error?.message);
    }
  };

  React.useEffect(() => {
    if (Number(election_id)) {
      handleElectionData(election_id);
    }
  }, [election_id]);

  // New state for upload tab
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Sample Excel columns: Name, Phrase, State, County, RaceType, ElectionType, Parties, Precincts, etc.
  const sampleData = [
    {
      name: "Sample race",
      vote_for_phrase: "1",
      state: "Tennessee",
      county: "Williamson",
      for_candidate_petition: "1",
      election_type: "1",
      countyInCharge: "Williamson",
      is_federal: "0",
      precincts: "102",
      parties: "50",
      election_id: "230",
      status: "1",
    },
    {
      name: "Federal race",
      vote_for_phrase: "1",
      state: "Tennessee",
      county: "Statewide",
      for_candidate_petition: "0",
      election_type: "2",
      is_federal: "1",
      precincts: "102",
      parties: "50",
      election_id: "230",
      status: "1",
    },
    {
      name: "Amendment race",
      vote_for_phrase: "1",
      state: "Tennessee",
      county: "Williamson",
      for_candidate_petition: "0",
      election_type: "1",
      countyInCharge: "Williamson",
      is_federal: "0",
      precincts: "102",
      parties: "50",
      election_id: "230",
      status: "1",
      title: "Amendment title",
      summary: "Amendment summary",
      options: "Yes, No",
    },
  ];

  const handleDownloadSample = () => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Races");
    XLSX.writeFile(wb, "sample_races.xlsx");
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Call the new SDK method with FormData
      const result = await sdk.createRacesBulk(formData);
      if (!result.error) {
        showToast(globalDispatch, "Races created successfully.");
        navigate(
          `/admin/race${
            searchParams.get("election_id")
              ? "?election_id=" + searchParams.get("election_id")
              : ""
          }`
        );
      } else {
        showToast(
          globalDispatch,
          result.message || "Error creating races.",
          4000,
          "error"
        );
      }
    } catch (error) {
      showToast(
        globalDispatch,
        error?.message || "Error processing file.",
        4000,
        "error"
      );
    }
    setUploadLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className=" min-h-screen p-10 ">
      <FilterBoxBg>
        <SectionTitle
          fontRoboto={true}
          text={"Create Race"}
          className={"mb-5"}
        />
        <MkdTabContainer tabs={["Manual", "Upload Excel"]}>
          {/* Manual Tab */}
          <div componentId={0}>
            {loading ? (
              <SkeletonLoader />
            ) : (
              <form
                className="mt-5 w-full max-w-lg"
                onSubmit={handleSubmit(onSubmit)}
              >
                <ElectionTypeStateCountySelect
                  electionType={electionType}
                  selected_county={selected_county}
                  selected_states={selected_states}
                  setElectionType={setElectionType}
                  setSelected_county={setSelected_county}
                  setSelected_states={setSelected_states}
                  // setValue={setValue}
                  electionTypeErrorMessage={electionTypeErrorMessage}
                  setElectionTypeErrorMessage={setElectionTypeErrorMessage}
                  stateErrorMessage={stateErrorMessage}
                  setStateErrorMessage={setStateErrorMessage}
                  countyErrorMessage={countyErrorMessage}
                  setCountyErrorMessage={setCountyErrorMessage}
                  filtered_counties={filtered_counties}
                  setFiltered_counties={setFiltered_counties}
                  electionTypeDisabled={election_id}
                  stateSelectDisabled={election_id}
                  countySelectDisabled={election_id}
                />

                <div className="">
                  <SearchDropdown
                    options={allElections}
                    selected_states={selectedElection}
                    label={"Election"}
                    stateError={electionError}
                    errorMessage={"Please select an election."}
                    stateChangeFn={(value) => {
                      setElectionError(false);
                      county_change(value, setSelectedElection);
                    }}
                    className={"mb-4"}
                    disabled={election_id}
                  />
                  <SearchDropdown
                    options={
                      Number(electionType?.[0]?.value) === 1
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
                    className={"mb-4"}
                  />
                  <div className="mb-5 grid grid-cols-1 gap-3 md:mb-2 md:grid-cols-2 md:gap-5">
                    <div className="">
                      <label className="mb-2 block text-sm font-[400]">
                        Race Name
                      </label>
                      <input
                        id="race_name"
                        type={"text"}
                        placeholder={"Name"}
                        {...register("Name")}
                        className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-3  py-2.5 text-base leading-tight  outline-none focus:outline-none ${
                          errors?.Name?.message
                            ? "border-red-500"
                            : "border-transparent"
                        }`}
                      />
                      <p className="text-field-error italic text-red-500">
                        {errors?.Name?.message}
                      </p>
                    </div>

                    <div className="">
                      <label
                        // htmlFor="vote_phrase"
                        className="mb-2 block text-sm font-[400]"
                      >
                        Vote For Phrase
                      </label>
                      <input
                        id="vote_phrase"
                        type={"number"}
                        placeholder={"Vote for phrase"}
                        min={1}
                        {...register("Phrase")}
                        className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-3  py-2.5 text-base leading-tight  outline-none focus:outline-none ${
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

                  <div className={`mb-5 mt-4 ${isFederal ? "hidden" : ""}`}>
                    <div className="flex items-center justify-between">
                      <label className="mb-2 block text-sm font-[400]">
                        {Number(electionType?.[0]?.value) === 1
                          ? "Precincts"
                          : "Select Counties"}
                      </label>

                      <div className="flex gap-1">
                        <input
                          id="allAreas"
                          className="cursor-pointer text-purple-600 focus:ring-0"
                          type="checkbox"
                          onChange={handle_areaCheckbox}
                        />
                        <label
                          htmlFor="allAreas"
                          className="mb-2 block cursor-pointer text-sm font-[400]"
                        >
                          {Number(electionType?.[0]?.value) === 1
                            ? "County"
                            : "State"}
                          wide
                        </label>
                      </div>
                    </div>
                    <MultiSelect
                      options={
                        Number(electionType?.[0]?.value) === 1
                          ? allPrecincts
                          : filtered_counties
                      }
                      value={selectedPrecinsts}
                      onChange={(value) => {
                        setSelectedPrecinsts(value);
                        setPrecinstsError(false);
                      }}
                      hasSelectAll={false}
                      overrideStrings={{
                        allItemsAreSelected: `All ${
                          Number(electionType?.[0]?.value) === 1
                            ? "precincts"
                            : "counties"
                        } are selected.`,
                      }}
                      labelledBy="Select..."
                      disabled={isAreaWide}
                      className={`multiSelect_customStyle ${
                        precinstsError && "error"
                      } ${isAreaWide && "cursorNot_Allowed"}`}
                    />

                    {electionType?.[0]?.value == 2 ? (
                      <SearchDropdown
                        options={
                          selectedPrecinsts[0]?.label == "Statewide"
                            ? filtered_counties
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

                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <label className="mb-2 block text-sm font-[400]">
                        Select Party
                      </label>
                      <div className="flex gap-1">
                        <input
                          id="NA"
                          className="cursor-pointer text-purple-600 focus:ring-0"
                          type="checkbox"
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
                      disabled={isPartyNA}
                      onChange={(value) => {
                        setSelectedParty(value);
                        setPartyError(false);
                      }}
                      overrideStrings={{
                        allItemsAreSelected: `All parties are selected.`,
                      }}
                      hasSelectAll={false}
                      labelledBy="Select..."
                      className={`multiSelect_customStyle ${
                        partyError && "error"
                      } ${isPartyNA && "cursorNot_Allowed"}`}
                    />

                    <p className="text-field-error italic text-red-500">
                      {partyError && "Please Select atleast one option."}
                    </p>
                  </div>

                  {isAddingAmendment ? (
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
                          className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none ${
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
                                className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none`}
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
                          onClick={() =>
                            setAmend_options([...amend_options, ""])
                          }
                        >
                          <PlusCircleIcon className="w-8 text-blue-500" />
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>

                <InteractiveButton
                  type="submit"
                  className="mt-8 rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
                  loading={isSubmitLoading}
                  disable={isSubmitLoading}
                >
                  Submit
                </InteractiveButton>
              </form>
            )}
          </div>
          {/* Upload Excel Tab */}
          <div componentId={1}>
            <div className="mt-5 flex items-center gap-4 p-4">
              <button
                type="button"
                className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
                onClick={handleDownloadSample}
              >
                Download Sample Excel
              </button>
              {/* <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={uploadLoading}
                className="mt-2"
              /> */}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={uploadLoading}
                ref={fileInputRef}
                className="focus:shadow-outline block cursor-pointer resize-none appearance-none rounded border border-transparent bg-[#f5f5f5]  p-1 px-4 py-2.5  text-sm leading-tight   outline-none  file:rounded file:border-none file:bg-[#662D91] file:px-2 file:py-1 file:text-white focus:outline-none disabled:cursor-not-allowed"
              />
              {uploadLoading && <span>Uploading and processing...</span>}
            </div>
          </div>
        </MkdTabContainer>
      </FilterBoxBg>
    </div>
  );
};

export default AdminAddRacePage;
