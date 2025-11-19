import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { isImage, empty, isVideo, formatDate, JsonParse } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { SkeletonLoader } from "Components/Skeleton";
import { CircleStackIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { TbOvalVertical } from "react-icons/tb";
import TreeSDK from "Utils/TreeSDK";
import html2canvas from "html2canvas";
import { GoPencil } from "react-icons/go";
import { InteractiveButton } from "Components/InteractiveButton";
import { RiContactsBookLine } from "react-icons/ri";
import { CreateBallot } from "Components/CreateBallot";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { StickyButton } from "Components/StickyButton";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminEditBallotLayoutPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const { dispatch, state } = React.useContext(AuthContext);
  const [isEditing, setIsEditing] = React.useState(false);
  const [viewModel, setViewModel] = React.useState({});
  const [layout, setLayout] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [save_loading, setSave_loading] = React.useState(false);

  // const [isSavedChanges, setIsSavedChanges] = React.useState(false);
  const [isLayoutEdited, setIsLayoutEdited] = React.useState(false);
  const [isPublishig, setIspublishing] = React.useState(false);
  const [selElectionRaces, setSelElectionRaces] = useState([]);
  const [selectedRacesIds, setSelectedRacesIds] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [allParties, setAllParties] = useState([]);
  const [selectedParties, setSelectedParties] = useState([]);
  const [ballot_pdf, setBallot_pdf] = useState(null);

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

  const params = useParams();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const timestamp = Date.now();
      const newFile = new File([file], `${timestamp}Ballot.pdf`, {
        type: file.type,
      });
      setBallot_pdf(newFile);
    }
  };

  const getData = async () => {
    setLoading(true);
    try {
      sdk.setTable("ballots_layout");
      const result = await sdk.callRestAPI(
        { id: Number(params?.id), join: "elections" },
        "GET"
      );

      if (!result.error) {
        setLayout(result?.model);
        const selecteRaces_id = [];
        const partyIDs = [];

        // const allRaces_ofElection = await sdk.getRacesOfElection(
        //   result?.model?.elections?.id
        // );
        const allRaces_ofElection = await sdk.getStateCountyRacesOfEl(
          result?.model?.elections?.id
        );
        const elRaces_mod =
          allRaces_ofElection?.list?.map((race) => {
            JsonParse(race?.parties)?.map((p) => {
              if (p?.id && p?.id !== "NA") {
                partyIDs.push(p?.id);
              }
            });
            return { ...race, label: race?.name, value: race?.id };
          }) || [];

        setSelElectionRaces(elRaces_mod);
        if (partyIDs?.length) {
          const parties = await tdk.getList("parties", {
            filter: [`id,in,${partyIDs?.join(",")}`],
          });
          setAllParties(parties?.list);
        }

        const pdfData = JsonParse(result?.model?.pdf_data);

        for (let i = 0; i < pdfData?.races?.length; i++) {
          pdfData?.races[i]?.column1?.map((race) => {
            selecteRaces_id.push(race?.id);
          });
          pdfData?.races[i]?.column2?.map((race) => {
            selecteRaces_id.push(race?.id);
          });
          pdfData?.races[i]?.column3?.map((race) => {
            selecteRaces_id.push(race?.id);
          });
        }

        setAllRaces(pdfData?.races);
        setSelectedParties(pdfData?.parties);
        setAmendment(pdfData?.amendment);
        setInstructions(pdfData?.instructionsToVoter);
        // setSelElectionRaces(selElection_races);
        setSelectedRacesIds(selecteRaces_id);
      }
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  };

  React.useEffect(function () {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "ballot",
      },
    });

    getData();
  }, []);

  const saveBallotChanges = async () => {
    setSave_loading(true);
    try {
      const ballot_data = {
        pdf_data: JSON.stringify({
          races: allRaces,
          parties: selectedParties,
          instructionsToVoter: instructions,
          amendment: amendment,
        }),
      };

      await tdk.update("ballots_layout", params?.id, ballot_data);

      setIsLayoutEdited(true);
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setSave_loading(false);
    setIsEditing(false);
  };

  const handleBallotPublish = async () => {
    /*  ------ checking if all the parties and races are selected or not -------- */
    if (allParties?.length !== selectedParties?.length) {
      showToast(globalDispatch, "Please select all the parties", 4000, "error");
      return;
    }
    if (selElectionRaces?.length !== selectedRacesIds?.length) {
      showToast(globalDispatch, "Please select all the races", 4000, "error");
      return;
    }
    setIspublishing(true);
    try {
      let ballot_data = {
        pdf_data: JSON.stringify({
          races: allRaces,
          parties: selectedParties,
          instructionsToVoter: instructions,
          amendment: amendment,
        }),
        com_ballot_status: "Generated",
        published: 1,
      };

      // --- generate the composite ballot ----
      const generatePdf = await sdk.generatePdf({
        data: {
          races: allRaces,
          parties: selectedParties,
          instructionsToVoter: instructions,
          amendment: amendment,
          info: {
            election_name: layout?.elections?.name,
            election_date: formatDate(
              layout?.elections?.election_date,
              "dddd, MMMM D, YYYY"
            ),
            election_county: layout?.elections?.county,
            description: layout?.description,
          },
        },
      });
      ballot_data["com_ballot_pdf"] = generatePdf?.pdfUrl;

      //  ----- new ballot pdf upload ----
      if (ballot_pdf) {
        const formData = new FormData();
        formData.append("file", ballot_pdf);

        const upload_result = await sdk.uploadBallotPdf_crop(formData);
        // const upload_result = await sdk.uploadPDF(formData);
        ballot_data["pdf_file"] = upload_result?.data?.url;
      }

      // ------ update the ballot layout -----------
      await tdk.update("ballots_layout", params?.id, ballot_data);
      await tdk.update("elections", layout?.election_id, {
        composite_ballot_status: 1,
      });
      showToast(globalDispatch, "Ballot published!");
      navigate("/admin/ballots-layout");
    } catch (error) {
      showToast(
        globalDispatch,
        error?.message || "Update failed!",
        4000,
        "error"
      );
      tokenExpireError(dispatch, error?.message || "Token expired");
    } finally {
      setIspublishing(false);
    }
  };

  return (
    <div className=" p-10 ">
      <FilterBoxBg>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-5">
              <h4 className="text-xl font-medium">View Ballots Layout</h4>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <InteractiveButton
                    onClick={saveBallotChanges}
                    disabled={save_loading}
                    // loading={save_loading}
                    className="mx-1 flex min-h-[40px] min-w-[80px] cursor-pointer items-center gap-2 rounded-md border border-[#29ABE2] px-7 py-2 text-center text-sm font-medium text-[#29ABE2] shadow-md hover:bg-[#29ABE2] hover:text-white disabled:cursor-not-allowed"
                  >
                    <span>{save_loading ? "Loading..." : "Save Changes"}</span>
                  </InteractiveButton>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mx-1 flex min-h-[40px] min-w-[80px] cursor-pointer items-center gap-2 rounded-md border border-[#29ABE2] px-7 py-2 text-center text-sm font-medium text-[#29ABE2] shadow-md hover:bg-[#29ABE2] hover:text-white disabled:cursor-not-allowed "
                  >
                    <GoPencil className="text-sm" /> <span>Edit Layout</span>
                  </button>
                )}
                <InteractiveButton
                  disabled={isPublishig || isEditing}
                  loading={isPublishig}
                  className="mx-1 flex min-h-[40px] min-w-[80px] cursor-pointer items-center rounded-md  bg-gradient-to-tr from-[#29ABE2] to-[#61D0FF] px-3 py-2 text-center text-sm font-[600]  text-white shadow-md hover:from-[#29ABE2] hover:to-[#29ABE2] disabled:cursor-not-allowed "
                  onClick={handleBallotPublish}
                >
                  Approve & Publish
                </InteractiveButton>
              </div>
            </div>
            <div className="w-full max-w-lg">
              <div className={`mb-5 rounded`}>
                <label className="mb-2 block text-sm font-[400]">
                  Update The Ballot Pdf
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className={`ocus:shadow-outline block w-full cursor-pointer resize-none appearance-none rounded border border-transparent bg-[#f5f5f5]  p-1 px-4 py-2.5  text-sm leading-tight   outline-none  file:rounded file:border-none file:bg-[#662D91] file:px-2 file:py-1 file:text-white focus:outline-none disabled:cursor-not-allowed `}
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
              showDescription={true}
              electionInfo={layout?.elections}
              description={layout?.description}
            />
          </>
        )}
      </FilterBoxBg>
      <StickyButton
        isEditing={isEditing}
        saveBallotChangesFn={saveBallotChanges}
        save_loading={save_loading}
        setIsEditing={setIsEditing}
      />
    </div>
  );
};

export default AdminEditBallotLayoutPage;
