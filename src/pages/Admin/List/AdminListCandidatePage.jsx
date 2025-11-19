import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PaginationBar } from "Components/PaginationBar";
import { AddButton } from "Components/AddButton";
import { MkdListTable } from "Components/MkdListTable";
import { ExportButton } from "Components/ExportButton";
import { SkeletonLoader } from "Components/Skeleton";
import TreeSDK from "Utils/TreeSDK";
import { MultiSelect } from "react-multi-select-component";
import { ModalPrompt } from "Components/Modal";
import { InteractiveButton } from "Components/InteractiveButton";
import {
  JsonParse,
  capitalizeWord,
  excelFileMake,
  formatDate,
  replacePlaceholders,
} from "Utils/utils";
import FilterBoxBg from "Components/FilterBoxBg/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { CustomButton } from "Components/CustomButton";
import DownloadButton from "Components/DownloadButton/DownloadButton";
import { isArray } from "@legendapp/state";
import { AdminCandidateTable, CandidateTable } from "Components/CandidateTable";
import {
  CandidateFilterBox,
  CandidateFilterBox2,
} from "Components/CandidateFilterBox";
import { ReportDownloadModal } from "Components/ReportDownloadModal";

const sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminListCandidatePage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [download2_loading, setDownload2_loading] = React.useState(false);
  const [allParties, setAllParties] = React.useState([]);
  const [allElections, setAllElections] = React.useState([]);
  const [emailTemplate, setEmailTemplate] = React.useState({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedElectionId, setSelectedElectionId] = React.useState("");
  const [sendBallotLoading, setSendBallotLoading] = React.useState(false);
  const [petitionId, setPetitionId] = React.useState(null);
  const [singleSendBallot_info, setSingleSendBallot_info] = React.useState({});
  const [isDeletingPrevPetition, setIsDeletingPrevPetition] =
    React.useState(false);
  const [deletingPetition, setDeletingPetition] = React.useState(null);
  const [showDeletingModal, setShowDeletingModal] = React.useState(false);
  const [dltPetitionLoading, setDltPetitionLoading] = React.useState(false);

  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);

  const [currentPage2, setPage2] = React.useState(1);
  const [canPreviousPage2, setCanPreviousPage2] = React.useState(false);
  const [canNextPage2, setCanNextPage2] = React.useState(false);
  const [loading2, setLoading2] = React.useState(false);
  const [currentTableData2, setCurrentTableData2] = React.useState([]);
  const [pageSize2, setPageSize2] = React.useState(10);
  const [pageCount2, setPageCount2] = React.useState(0);

  const [downloading, setDownloading] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [elections, setElections] = React.useState([]);
  const [activeElectionId, setActiveElectionId] = React.useState(null);

  const [selected_states, setSelected_states] = useState([]);
  const [selected_county, setSelected_county] = useState([]);
  const [selectedElection, setSelectedElection] = React.useState([]);

  /* 
where -> petition table
where2 -> elections table
where3 -> modification table
where4 -> races table
where5 -> parties table
*/
  const [filter, setFilter] = React.useState({
    where: {},
    where2: {},
    where3: {},
    where4: {},
    where5: {},
  });
  const [filter2, setFilter2] = React.useState({
    where: {},
    where2: {},
    where3: {},
    where4: {},
    where5: {},
  });
  const schema = yup.object({
    race_name: yup.string(),
    candidate_name: yup.string(),
    party: yup.string(),
    modification_req: yup.string(),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const exportTable = async (type, state, county) => {
    setDownloading(true);
    try {
      const where2 = { status: 1, election_type: type, state };
      if (county) {
        where2["county"] = county;
      }

      const result = await sdk.getCandidates({
        where: {},
        where2,
        where3: {},
        where4: {},
        where5: {},
        page: 1,
        limit: 9999999999999,
        orderBy: "id",
        direction: "DESC",
      });
      /*  formating data for download csv  */
      let newDocdtype = [];
      result?.list?.map((item) => {
        newDocdtype.push({
          Id: item?.id,
          Email: item?.email,
          "Candidate Name": `${item?.candidate_name}`,
          "Race Name": item?.race_name,
          // "Election Date": formatDate(item?.election_date),
          Incumbent: Number(item?.Incumbent) ? "Yes" : "No",
          Areas: `${
            item?.race_precincts
              ? JsonParse(item?.race_precincts)?.map(
                  (pre, i) => `${capitalizeWord(pre?.name)}`
                )
              : ""
          }`,

          Address: item?.address,
          // County: item?.election_county,
          "Modification Request": item?.modification_id ? "Yes" : "No",
          County: county || "",
          State: state,
        });
      });
      /* - triggering the utils function for downloading */
      if (result?.list?.length === newDocdtype.length) {
        excelFileMake(newDocdtype, "Candidates");
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
    }

    setDownloading(false);
    setDownloadModalOpen(false);
  };

  const handleDltPetition = async (petitionId) => {
    setDltPetitionLoading(true);

    try {
      const petition = await tdk.getOne("petition", petitionId, {
        join: "races,elections,parties",
      });
      await tdk.delete("petition", petitionId);

      // -- update race candidates
      const raceCandidates_mod = JsonParse(
        petition?.model?.races?.candidates
      )?.filter((candidate) => candidate?.email !== petition?.model?.email);
      await tdk.update("races", petition?.model?.race_id, {
        candidates: JSON.stringify(raceCandidates_mod),
      });

      // - update user profile --

      if (petition?.model?.user_id) {
        const profileData = {
          party: "",
          parties_id: null,
          election_date: "",
          election_id: null,
          incumbent: "0",
          races_id: "",
          precincts: "",
          sample_ballot: "",
          instruction_link: null,
          com_ballot_pdf: "",
          // address: "",
          // state: "",
          // county: "",
        };
        let userPrev_petitions = [];
        userPrev_petitions = await tdk.getList("petition", {
          filter: [
            `user_id,eq,${petition?.model?.user_id}`,
            `id,neq,${petitionId}`,
          ],
          join: "races,elections,parties",
          order: "id",
          direction: "DESC",
        });

        if (userPrev_petitions?.list?.length) {
          profileData["party"] = userPrev_petitions?.list[0]?.parties?.name;
          profileData["parties_id"] = userPrev_petitions?.list[0]?.parties_id;

          profileData["election_id"] = userPrev_petitions?.list[0]?.election_id;
          profileData["election_date"] =
            userPrev_petitions?.list[0]?.elections?.election_date;

          profileData["incumbent"] = userPrev_petitions?.list[0]?.Incumbent;

          profileData["address"] = userPrev_petitions?.list[0]?.address;
          profileData["state"] = userPrev_petitions?.list[0]?.elections?.state;
          profileData["county"] =
            userPrev_petitions?.list[0]?.elections?.county;

          const raceIds = [];
          let precincts = [];
          userPrev_petitions?.list?.map((pet) => {
            raceIds.push({ id: pet?.races?.id, name: pet?.races?.name });

            precincts = [...precincts, ...JsonParse(pet?.races?.precincts)];
          });

          profileData["precincts"] = JSON.stringify(precincts);
          profileData["races_id"] = JSON.stringify(raceIds);
        }

        sdk.setTable("profile");
        await sdk.callRestAPI(
          {
            set: profileData,
            where: { user_id: petition?.model?.user_id },
          },
          "PUTWHERE"
        );
      }

      showToast(globalDispatch, "Petition deleted successfully.");
      if (isDeletingPrevPetition) {
        getData2(currentPage2, pageSize2, filter2);
      } else {
        getData(currentPage, pageSize, filter);
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setDeletingPetition(null);
    setDltPetitionLoading(false);
    setShowDeletingModal(false);
    setIsDeletingPrevPetition(false);
  };

  async function getData(
    pageNum,
    limitNum,

    filter = { where: {}, where2: {}, where3: {}, where4: {}, where5: {} },
    electionType
  ) {
    let where2_mod = {
      ...filter.where2,
    };
    let where4_mod = {
      ...filter.where4,
    };

    const filter_mod = {
      ...filter,
      where: { ...filter.where, status: 1 },
      where4: where4_mod,
      where2: where2_mod,
    };

    setLoading(true);
    try {
      const result = await sdk.getCandidates({
        // ...filter,
        ...filter_mod,
        page: pageNum,
        limit: limitNum,
        orderBy: "id",
        direction: "DESC",
      });
      const { list, total, limit, num_pages, page } = result;

      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
      setLoading(false);
    } catch (error) {
      console.log(error?.message);
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  }

  async function getData2(
    pageNum,
    limitNum,
    filter = { where: {}, where2: {}, where3: {}, where4: {}, where5: {} }
  ) {
    let where2_mod = {
      ...filter.where2,
    };
    let where4_mod = {
      ...filter.where4,
      state: state?.state,
    };

    const filter_mod = {
      ...filter,
      where: { ...filter.where, status: 0 },
      where4: filter.where4,
      where2: filter.where2,
    };

    setLoading2(true);
    try {
      const result = await sdk.getCandidates({
        // ...filter,
        ...filter_mod,
        page: pageNum,
        limit: limitNum,
        orderBy: "id",
        direction: "DESC",
      });
      const { list, limit, num_pages, page } = result;

      setCurrentTableData2(list);
      setPageSize2(limit);
      setPageCount2(num_pages);
      setPage2(page);
      setCanPreviousPage2(page > 1);
      setCanNextPage2(page + 1 <= num_pages);
      setLoading2(false);
    } catch (error) {
      console.log(error?.message);
      tokenExpireError(dispatch, error.message);
    }
    setLoading2(false);
  }

  const getActiveCountyElectionId = async (
    electionType,
    county,
    fallbackId
  ) => {
    if (Number(electionType) !== 2) return fallbackId;

    const { list } = await tdk.getList("elections", {
      filter: [`election_type,eq,1`, `county,eq,'${county}'`, `status,eq,1`],
    });

    return list?.[0]?.id || null;
  };

  const getBallotByElectionId = async (electionId) => {
    const { list } = await tdk.getList("ballots_layout", {
      filter: [`election_id,eq,${electionId}`],
    });
    return list?.[0];
  };

  const showError = (message) => {
    showToast(globalDispatch, message, 4000, "error");
    return false;
  };
  const handleSendBallot = async (withComp_ballot) => {
    const selectedElId = selectedElection?.[0]?.id;
    let activeCountyElectionId = selectedElection?.[0]?.id;

    setIsModalOpen(false);

    if (!selectedElId) return showError("Election is not selected");

    setSendBallotLoading(true);
    try {
      console.log("try start", selectedElId, allElections);
      const selectedElectionObj = elections?.find(
        (el) => el.id === selectedElId
      );

      console.log("active election type 2");
      console.log(selectedElectionObj);

      activeCountyElectionId = await getActiveCountyElectionId(
        selectedElectionObj?.election_type,
        selected_county?.[0]?.county,
        selectedElId
      );

      if (!activeCountyElectionId) {
        setSendBallotLoading(false);
        return showError(
          `${singleSendBallot_info?.countyInCharge} doesn't have any active election.`
        );
      }

      console.log("getting ballot");
      const ballot = await getBallotByElectionId(activeCountyElectionId);
      console.log("ballot check");

      if (!ballot?.pdf_file) {
        showError("The ballot has not been uploaded!");
      } else if (withComp_ballot && !ballot?.com_ballot_pdf) {
        showError("The composite ballot has not been published!");
      } else {
        const result = await sdk.sendBallot({
          election_id: selectedElId,
          with_com_ballot: withComp_ballot,
          active_election_id: activeCountyElectionId,
        });

        if (!result.error) {
          showToast(globalDispatch, "The ballot sent successfully!");
        } else {
          showError(result?.message || "The ballot couldn't be sent!");
        }
      }
    } catch (error) {
      showError(error?.message || "The ballot couldn't be sent!");
      tokenExpireError(dispatch, error?.message);
    } finally {
      setSendBallotLoading(false);
    }
  };

  const handleSingleSendBallot = async (withComp_ballot) => {
    try {
      setIsModalOpen(false);

      let activeCountyElectionId = await getActiveCountyElectionId(
        singleSendBallot_info?.election_type,
        singleSendBallot_info?.countyInCharge,
        singleSendBallot_info?.election_id
      );

      if (!activeCountyElectionId) {
        setSingleSendBallot_info({});
        setPetitionId(null);
        return showError(
          `${singleSendBallot_info?.countyInCharge} doesn't have any active election.`
        );
      }

      const ballot = await getBallotByElectionId(activeCountyElectionId);

      if (!ballot?.pdf_file) {
        showError("The ballot has not been uploaded!");
      } else if (withComp_ballot && !ballot?.com_ballot_pdf) {
        showError("The composite ballot has not been published yet.");
      } else {
        const candidateInfo = {
          id: singleSendBallot_info?.id,
          user_id: singleSendBallot_info?.user_id,
          email: singleSendBallot_info?.email,
          race_name: singleSendBallot_info?.race_name,
          election_id: singleSendBallot_info?.election_id,
          candidate_name: singleSendBallot_info?.candidate_name,
          petition_id: singleSendBallot_info?.id,
        };

        await sdk.sendBallot({
          election_id: singleSendBallot_info?.election_id,
          with_com_ballot: withComp_ballot,
          active_election_id: activeCountyElectionId,
          candidate: [candidateInfo],
        });

        showToast(globalDispatch, "Ballot sent successfully!");
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
      showError(error?.message);
    } finally {
      setSingleSendBallot_info({});
      setPetitionId(null);
    }
  };

  const minutesToRefetch = 5;

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "candidates",
      },
    });

    (async function () {
      getData(1, pageSize);
      getData2(1, pageSize2);
      // getParties();
      // getElections();
      try {
        const temp1 = await tdk.getOne("email", 13);
        setEmailTemplate(temp1?.model);
      } catch (error) {
        console.log(error?.message);
      }
    })();

    const intervalId = setInterval(() => {
      getData(currentPage, pageSize, filter);
      getData2(currentPage2, pageSize2, filter2);
    }, minutesToRefetch * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-5 sm:p-10">
      {/*  current election's petitions -- */}

      <CandidateFilterBox2
        className={`mb-10`}
        title={"Search Candidates Petitions"}
        prevPetitions={false}
        getData={getData}
        setFilter={setFilter}
        selectedElectionId={selectedElectionId}
        setSelectedElectionId={setSelectedElectionId}
        sendBallotLoading={sendBallotLoading}
        setIsModalOpen={setIsModalOpen}
        pageSize={pageSize}
        // activeElectionId={activeElectionId}
        setActiveElectionId={setActiveElectionId}
        elections={elections}
        setElections={setElections}
        selected_county={selected_county}
        setSelected_county={setSelected_county}
        selected_states={selected_states}
        setSelected_states={setSelected_states}
        selectedElection={selectedElection}
        setSelectedElection={setSelectedElection}
      />
      <div className="mb-3 flex w-full justify-between text-center  ">
        <SectionTitle text={"Candidate Petitions"} />
        <div className="flex items-center gap-2 ">
          <AddButton link={"/admin/add-petition"} text={"Add Petition"} />
          <DownloadButton
            callBackFn={() => setDownloadModalOpen(true)}
            downloading={false}
          />
        </div>
      </div>

      <AdminCandidateTable
        className={"mb-8"}
        currentTableData={currentTableData}
        loading={loading}
        currentPage={currentPage}
        pageCount={pageCount}
        pageSize={pageSize}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        setPageSize={setPageSize}
        getData={getData}
        filterState={filter}
        isWithElectionDate={false}
        prevPetition={false}
        isAddingPetition={false}
        petitionId={petitionId}
        setPetitionId={setPetitionId}
        setDeletingPetition={setDeletingPetition}
        setShowDeletingModal={setShowDeletingModal}
        setIsDeletingPrevPetition={setIsDeletingPrevPetition}
        isModalOpen={isModalOpen}
        setSingleSendBallot_info={setSingleSendBallot_info}
        setIsModalOpen={setIsModalOpen}
      />

      <CandidateFilterBox2
        className={`mb-10`}
        title={"Search Candidates Petitions"}
        prevPetitions={true}
        getData={getData2}
        setFilter={setFilter2}
        setIsModalOpen={setIsModalOpen}
        pageSize={pageSize2}
      />
      <div className="mb-3 flex w-full justify-between text-center  ">
        <SectionTitle text={"Previous Petitions"} />
      </div>
      <AdminCandidateTable
        className={"mb-8"}
        // - for table -
        currentTableData={currentTableData2}
        loading={loading2}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setDltingPetition={setDeletingPetition}
        setShowDltingModal={setShowDeletingModal}
        prevPetition={true}
        setIsDltingPrevPetition={setIsDeletingPrevPetition}
        //  for pagination
        currentPage={currentPage2}
        pageCount={pageCount2}
        pageSize={pageSize2}
        canPreviousPage={canPreviousPage2}
        canNextPage={canNextPage2}
        setPageSize={setPageSize2}
        getData={getData2}
        filterState={filter2}
      />
      {/*  send ballot modal  */}
      {isModalOpen ? (
        <ModalPrompt
          title={`Send Ballot`}
          message={`Do you want to send the composite ballot also?`}
          loading={sendBallotLoading}
          actionHandler={() => {
            if (petitionId) handleSingleSendBallot(true);
            else handleSendBallot(true);
          }}
          closeModalFunction={() => {
            setIsModalOpen(false);
            if (petitionId) {
              setPetitionId(null);
              setSingleSendBallot_info({});
            }
          }}
          callAnotherFn_OnRejection={true}
          anotherFunction={() => {
            if (petitionId) handleSingleSendBallot(false);
            else handleSendBallot(false);
          }}
          isDangerBtn={false}
        />
      ) : null}

      {/*  delete petition modal - */}
      {showDeletingModal ? (
        <ModalPrompt
          title={`Delete The Candidate Petition`}
          message={`Do you want to delete the petition, ${deletingPetition}. Note that, this action is irreversible.`}
          loading={dltPetitionLoading}
          actionHandler={() => {
            handleDltPetition(deletingPetition);
          }}
          closeModalFunction={() => {
            setDeletingPetition(null);
            setShowDeletingModal(false);
          }}
        />
      ) : null}

      {isDownloadModalOpen ? (
        <ReportDownloadModal
          loading={downloading}
          setModalOpen={setDownloadModalOpen}
          downloadFunction={exportTable}
        />
      ) : null}
    </div>
  );
};

export default AdminListCandidatePage;
