import React, { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import TreeSDK from "Utils/TreeSDK";
import { MultiSelect } from "react-multi-select-component";
import { CreateBallot } from "Components/CreateBallot";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { PlusIcon } from "@heroicons/react/24/solid";
import { SectionTitle } from "Components/SectionTitle";
import { JsonParse } from "Utils/utils";
import { SearchDropdown } from "Components/SearchDropdown";
import { StickyButton } from "Components/StickyButton";
import "./adminAddRacePage.css";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";
import { StateCountySelect } from "Components/StateCountySelect";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminAddBallotPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup.object({}).required();

  const { dispatch, state } = React.useContext(AuthContext);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const editorRef = useRef();
  const [description, setDescription] = useState("");
  const [isEditorEmpty, setIsEditorEmpty] = useState(false);
  const [pdf, setPdf] = useState([{ file: "" }]);
  const [pdfError, setPdfError] = useState(false);
  const [electionError, setElectionError] = useState(false);
  const [mergedPdfBytes, setMergedPdfBytes] = useState(null);
  // const [allCountries, setAllCountries] = useState([]);
  // const [selectedCountries, setSelectedCountries] = useState([]);
  const [countryError, setCountryError] = useState(false);
  const [isPdfCombined, setIsPdfCombined] = useState(false);
  const [mergingPDF, setMergingPDF] = useState(false);
  const [pdfReading, setPdfReading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [allElections, setAllElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState([]);
  const [selElectionRaces, setSelElectionRaces] = useState([]);
  const [selectedRacesIds, setSelectedRacesIds] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [allParties, setAllParties] = useState([]);
  const [selectedParties, setSelectedParties] = useState([]);
  const [instruction_pdf, setInstruction_pdf] = useState(null);
  const [ballot_pdf, setBallot_pdf] = useState(null);
  const [ballot_error, setBallot_Error] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [selected_states, setSelected_states] = useState([]);
  const [stateErrorMessage, setStateErrorMessage] = useState(false);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);
  const [countyErrorMessage, setCountyErrorMessage] = useState(false);

  const [allRaces, setAllRaces] = useState([
    {
      column1: [],
      column2: [],
      column3: [],
    },
  ]);

  const [amendment, setAmendment] = useState({
    column1: [],
    column2: [],
    column3: [],
  });

  const electionType = 1;

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

  const getElectionRacesNParties = async (electionId) => {
    setSelElectionRaces([]);
    setSelectedParties([]);
    setSelectedRacesIds([]);
    setAllRaces([
      {
        column1: [],
        column2: [],
        column3: [],
      },
    ]);
    try {
      if (electionId) {
        const partyIDs = [];
        // const result = await sdk.getRacesOfElection(electionId);
        const result = await sdk.getStateCountyRacesOfEl(electionId);
        const result_mod =
          result?.list?.map((race) => {
            JsonParse(race?.parties)?.map((p) => {
              if (p?.id && p?.id !== "NA") {
                partyIDs.push(p?.id);
              }
            });

            return { ...race, label: race?.name, value: race?.id };
          }) || [];
        setSelElectionRaces(result_mod);

        if (partyIDs?.length) {
          const parties = await tdk.getList("parties", {
            filter: [`id,in,${partyIDs?.join(",")}`],
          });
          setAllParties(parties?.list);
        }
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
  };

  const handleChangeElection = (value) => {
    if (value?.length < 2) {
      setSelectedElection(value);
      getElectionRacesNParties(value[0]?.id);
    } else {
      setSelectedElection([value[value?.length - 1]]);
      getElectionRacesNParties(value[value?.length - 1]?.id);
    }
    setElectionError(false);
  };

  const callHandleCheckEmpty = () => {
    const editor = editorRef.current.getEditor();
    const content = editorRef.current.getEditor().getContents();
    const result = handleCheckEmpty(content, editor);
    return result;
  };

  const handleCheckEmpty = async (content, editor) => {
    setDescription(content);
    const isEmpty = !editor.getText().trim();
    setIsEditorEmpty(isEmpty);
    return isEmpty;
  };

  const handleFileChange = (e) => {
    setBallot_Error(false);
    const file = e.target.files[0];
    if (file) {
      const timestamp = Date.now();
      const newFile = new File([file], `${timestamp}Ballot.pdf`, {
        type: file.type,
      });
      setBallot_pdf(newFile);
    }
  };

  const dataValidation = async () => {
    let isAnyField_empty = false;
    if (!selectedElection[0]?.id) {
      setElectionError(true);
      isAnyField_empty = true;
    }
    // state
    if (!selected_states.length) {
      setStateErrorMessage("Please select a state");
      isAnyField_empty = true;
    }
    // county
    if (!selected_county.length) {
      setCountyErrorMessage("Please select a county");
      isAnyField_empty = true;
    }
    // description
    const isDescriptionEmpty = await callHandleCheckEmpty();

    if (isEditorEmpty || isDescriptionEmpty) {
      setIsEditorEmpty(true);
      isAnyField_empty = true;
    }
    if (!ballot_pdf) {
      setBallot_Error(true);
      isAnyField_empty = true;
    }
    if (isAnyField_empty) {
      showToast(
        globalDispatch,
        "Please fill up all the fields.",
        4000,
        "error"
      );
      return false;
    }
    return true;
  };

  const onSubmit = async (_data) => {
    const validateResult = await dataValidation();
    if (!validateResult) return;

    setIsSubmitLoading(true);
    try {
      const ballotData = {
        description: description,
        com_ballot_status: "Not Generated",
        published: 0,
        election_id: selectedElection[0]?.id,
        election_date: selectedElection[0]?.election_date,
        pdf_data: JSON.stringify({
          races: allRaces,
          parties: selectedParties,
          instructionsToVoter: instructions,
          // amendment: amendment,
        }),
        total_page: allRaces?.length,
        county_name: selected_county[0]?.value,
        state: selected_states[0]?.value,
        election_type: electionType,
      };

      // -------- instruction and ballot pdf upload --------
      const formData = new FormData();
      formData.append("file", ballot_pdf);

      const upload_result = await sdk.uploadBallotPdf_crop(formData);
      ballotData["pdf_file"] = upload_result?.data?.url;
      // const upload_result = await sdk.uploadPDF(formData);
      // ballotData["pdf_file"] = upload_result?.url;

      if (instruction_pdf) {
        const instruction_formData = new FormData();
        instruction_formData.append("file", instruction_pdf);
        let instructionFile = await sdk.uploadPDF(instruction_formData);
        ballotData["instruction_file"] = instructionFile?.url;
      }

      // ---------- creating a ballot layout -------
      const result = await tdk.create("ballots_layout", ballotData);
      // await tdk.update("elections", selectedElection[0]?.id, {
      //   composite_ballot_status: 1,
      // });
      showToast(globalDispatch, "Ballot created successfully!");
      navigate("/admin/ballots-layout");
    } catch (error) {
      console.log(error);
      setIsSubmitLoading(false);
      setPdfReading(false);
      setPdfUploading(false);
      showToast(
        globalDispatch,
        error?.message || "Ballot creation failed!",
        4000,
        "error"
      );
      tokenExpireError(dispatch, error.message);
    }
    setIsSubmitLoading(false);
  };

  const getDataOfSelectedArea = useCallback(async () => {
    try {
      setSelectedElection([]);
      setAllElections([]);
      setElectionError(false);

      const ifAllSelected = selected_states?.length && selected_county?.length;

      const state = selected_states?.[0]?.value;
      const county = selected_county?.[0]?.value;

      if (ifAllSelected) {
        const filter = [
          "election_type,eq,1",
          `composite_ballot_status,eq,0`,
          `state,eq,'${state}'`,
          `county,eq,'${county}'`,
        ];
        const elections = await tdk.getList("elections", { filter });

        // storing data in the states
        const result_mod =
          elections?.list?.map((election) => ({
            ...election,
            label: election?.name,
            value: election?.id,
          })) || [];

        setAllElections(result_mod);
      }
    } catch (error) {
      console.log("getDataOfSelectedArea ->>", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
  }, [electionType, selected_states, selected_county]);

  React.useEffect(() => {
    getDataOfSelectedArea();
  }, [electionType, selected_states, selected_county]);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "ballot",
      },
    });
  }, []);

  return (
    <div className=" p-10">
      <FilterBoxBg>
        <SectionTitle
          className={"mb-5"}
          fontRoboto={true}
          text={"Upload Ballot Layout"}
        />
        <form
          style={{ fontFamily: "Inter, sans-serif" }}
          className=" w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full max-w-lg">
            {/* state and county */}
            <StateCountySelect
              selected_county={selected_county}
              selected_states={selected_states}
              setSelected_county={setSelected_county}
              setSelected_states={setSelected_states}
              stateErrorMessage={stateErrorMessage}
              setStateErrorMessage={setStateErrorMessage}
              countyErrorMessage={countyErrorMessage}
              setCountyErrorMessage={setCountyErrorMessage}
              filtered_counties={filtered_counties}
              setFiltered_counties={setFiltered_counties}
              electionType={electionType}
            />

            {/* election name */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]">
                Select Election Name
              </label>
              <MultiSelect
                options={allElections}
                value={selectedElection}
                onChange={(value) => handleChangeElection(value)}
                closeOnChangedValue={true}
                hasSelectAll={false}
                valueRenderer={(selected, _options) => {
                  return selected.length
                    ? selected.map(({ label }) => label)
                    : "Select...";
                }}
                labelledBy="Select..."
                className={`multiSelect_customStyle singleSelect ${
                  electionError && "error"
                }`}
              />
              {electionError && (
                <p className="text-field-error italic text-red-500">
                  Please select an election.
                </p>
              )}
            </div>

            {/* election date */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]">
                Election Date
              </label>
              <input
                type={"text"}
                disabled={true}
                value={selectedElection[0]?.election_date || ""}
                placeholder={"Date"}
                {...register("date")}
                className={`focus:shadow-outline w-full resize-none appearance-none rounded border border-transparent bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none disabled:cursor-not-allowed `}
              />
            </div>

            {/* ballot pdf upload */}
            <div className={`mb-5 rounded`}>
              <label className="mb-2 block text-sm font-[400]">
                The Ballot Pdf
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className={`ocus:shadow-outline block w-full cursor-pointer resize-none appearance-none rounded border border-transparent bg-[#f5f5f5]  p-1 px-4 py-2.5  text-sm leading-tight   outline-none  file:rounded file:border-none file:bg-[#662D91] file:px-2 file:py-1 file:text-white focus:outline-none disabled:cursor-not-allowed `}
              />
              {ballot_error && (
                <p className="text-field-error italic text-red-500">
                  Please upload the ballot.
                </p>
              )}
            </div>

            {/* instruction */}
            <div className={`mb-5 rounded`}>
              <label className="mb-2 block text-sm font-[400]">
                Instructions
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  setInstruction_pdf(e.target.files[0]);
                }}
                className="focus:shadow-outline block w-full cursor-pointer resize-none appearance-none rounded border border-transparent bg-[#f5f5f5]  p-1 px-4 py-2.5  text-sm leading-tight   outline-none  file:rounded file:border-none file:bg-[#662D91] file:px-2 file:py-1 file:text-white focus:outline-none disabled:cursor-not-allowed "
              />
            </div>

            {/* ballot header description */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]">
                Ballot Header Description
              </label>
              <p className="text-xs italic text-red-500">
                {isEditorEmpty ? "Please write something." : ""}
              </p>
              <ReactQuill
                ref={editorRef}
                value={description}
                onChange={(content, _delta, _source, editor) =>
                  handleCheckEmpty(content, editor)
                }
                className={` ${isEditorEmpty ? "quill_empty_error" : ""}`}
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"], // Toggle buttons
                    [{ header: [1, 2, 3, 4, 5, 6, false] }], // Font size dropdown
                    [{ align: [] }], // align texts
                    [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered list
                    [{ indent: "-1" }, { indent: "+1" }],
                    ["clean"], // Clear formatting
                  ],
                }}
              />
            </div>
          </div>
          <CreateBallot
            selElectionRaces={selElectionRaces}
            allRaces={allRaces}
            setAllRaces={setAllRaces}
            selectedRacesIds={selectedRacesIds}
            setSelectedRacesIds={setSelectedRacesIds}
            isEditing={isEditing}
            instructions={instructions}
            setInstructions={setInstructions}
            selectedParties={selectedParties}
            setSelectedParties={setSelectedParties}
            allParties={allParties}
            amendments={amendment}
            setAmendment={setAmendment}
          />

          <InteractiveButton
            type="submit"
            loading={isSubmitLoading}
            disabled={isSubmitLoading || (!isPdfCombined && pdf?.length > 1)}
            className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
          >
            Submit
          </InteractiveButton>
        </form>
      </FilterBoxBg>
      <StickyButton
        isEditing={isEditing}
        saveBallotChangesFn={() => setIsEditing(false)}
        save_loading={false}
        setIsEditing={setIsEditing}
      />
    </div>
  );
};

export default AdminAddBallotPage;
