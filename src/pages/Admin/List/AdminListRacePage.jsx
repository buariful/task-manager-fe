import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { JsonParse, excelFileMake, getNonNullValue } from "Utils/utils";
import { AddButton } from "Components/AddButton";
import TreeSDK from "Utils/TreeSDK";
import { ModalPrompt } from "Components/Modal";
import { SectionTitle } from "Components/SectionTitle";
import { DownloadButton } from "Components/DownloadButton";
import { RacesTable } from "Components/RacesTable";
import { RaceFilterBox } from "Components/RaceFilterBox";
import { AdminRaceFilterBox } from "Components/AdminRaceComponent";
import { ReportDownloadModal } from "Components/ReportDownloadModal";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminRacesListPage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [query, setQuery] = React.useState("");
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [electionInfo, setElectionInfo] = useState({});
  const [filterConditions, setFilterConditions] = useState({});
  const [downLoadingRaces, setDownLoadingRaces] = React.useState(false);

  const [currentTableData2, setCurrentTableData2] = React.useState([]);
  const [pageSize2, setPageSize2] = React.useState(10);
  const [pageCount2, setPageCount2] = React.useState(0);
  const [currentPage2, setPage2] = React.useState(0);
  const [canPreviousPage2, setCanPreviousPage2] = React.useState(false);
  const [canNextPage2, setCanNextPage2] = React.useState(false);
  const [loading2, setLoading2] = React.useState(false);
  const [filterConditions2, setFilterConditions2] = useState({});
  const [downLoadingRaces2, setDownLoadingRaces2] = React.useState(false);

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [dltingPrevRace, setDltingPrevRace] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [dltingRace, setDltingRace] = useState({
    name: "",
    id: null,
    election_id: null,
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);

  const getData = async (pageNum, limitNum, where = {}) => {
    setLoading(true);
    try {
      const electionID = searchParams.get("election_id");
      let where_mod = {
        ...where,
      };

      if (!electionID) {
        where_mod["status"] = 1;
      }

      const result = await sdk.getRacesPaginate({
        where: where_mod,
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
      console.log(error);
    }
    setLoading(false);
  };

  async function getData2(pageNum, limitNum, where = {}) {
    let where_mod = {
      status: 0,
      ...where,
    };

    setLoading2(true);
    try {
      const result = await sdk.getRacesPaginate({
        where: where_mod,
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
      console.log("ERROR", error);
      setLoading2(false);
      tokenExpireError(dispatch, error.message);
    }
  }

  const deleteItem = async (id, prevRace = false) => {
    try {
      setDeleteLoading(true);
      const election = dltingRace?.election_id
        ? await tdk.getOne("elections", dltingRace?.election_id)
        : {};

      sdk.setTable("races");
      const result = await sdk.callRestAPI({ id }, "DELETE");
      if (!result?.error) {
        // --- update the election
        if (election?.model?.id) {
          const prevRaces = (
            JSON.parse(election?.model?.races_id) || []
          )?.filter((race) => Number(race?.id) !== Number(dltingRace?.id));
          await tdk.update("elections", election?.model?.id, {
            races_id: JSON.stringify(prevRaces),
          });
        }

        // --- delete the petitions against the race ---
        await sdk.deleteByFilter("petition", { race_id: id });

        setDltingRace({ name: "", id: null, election_id: null });
        setDeleteLoading(false);
        setShowDeleteModal(false);
        setDltingPrevRace(false);

        if (prevRace) {
          getData2(currentPage2, pageSize2, filterConditions2);
        } else {
          getData(currentPage, pageSize, filterConditions);
        }
      }
    } catch (err) {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      tokenExpireError(dispatch, err?.message);
      throw new Error(err);
    }
  };

  const exportTable = async (type, state, county) => {
    const prevRaces = false;
    if (prevRaces) {
      setDownLoadingRaces2(true);
    } else {
      setDownLoadingRaces(true);
    }

    try {
      let filter = {
        status: prevRaces ? 0 : 1,
        election_type: type,
        state,
      };
      if (county) filter["county"] = county;

      const result = await sdk.getRacesPaginate({
        where: filter,
        page: 1,
        limit: 99999999999999,
        orderBy: "id",
        direction: "DESC",
      });
      // const result = await tdk.getPaginate("races", {
      //   page: 1,
      //   size: 99999999999999,
      //   order: "id",
      //   direction: "DESC",
      //   join: "petition,elections",
      //   filter,
      // });
      let newDocdtype = [];
      result?.list?.map((item) => {
        newDocdtype.push({
          Id: item?.id,
          "Race Name": item?.name,
          "Vote For Phrase": item?.vote_for_phrase,
          "Assigned Areas": `${JsonParse(item?.precincts)?.map(
            (pre) => ` ${pre?.name}`
          )}`,
          "Party Affiliation": `${JsonParse(item?.parties)?.map(
            (party) => ` ${party?.name}`
          )}`,
          Candidates: `${JsonParse(item?.candidates)?.map(
            (candidate, i) => ` ${candidate?.name}`
          )}`,
          "Election Type":
            Number(item?.election_type) === 1 ? "County" : "State",
          State: item?.state,
          County: item?.county,
        });
      });
      if (result?.list?.length === newDocdtype.length) {
        excelFileMake(newDocdtype, `${prevRaces ? "Previous Races" : "Races"}`);
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
    }
    if (prevRaces) {
      setDownLoadingRaces2(false);
    } else {
      setDownLoadingRaces(false);
    }
    setDownloadModalOpen(false);
  };

  const onSubmit = (
    data,
    prevRace = false,
    selectedState,
    selectedCounty,
    electionType
  ) => {
    const filterObj = {};
    if (data?.name) {
      filterObj["name"] = data?.name;
    }
    if (data?.party) {
      filterObj["parties"] = data?.party;
    }
    if (data?.electionID && prevRace) {
      filterObj["election_id"] = data?.electionID;
    }
    if (searchParams.get("election_id") && !prevRace) {
      filterObj["election_id"] = searchParams.get("election_id");
    }
    if (selectedCounty?.length) {
      filterObj["county"] = selectedCounty[0]?.value;
    }
    if (selectedState?.length) {
      filterObj["state"] = selectedState[0]?.value;
    }
    if (electionType?.length) {
      filterObj["election_type"] = electionType[0]?.value;
    }

    if (prevRace) {
      setFilterConditions2(filterObj);
      getData2(currentPage, pageSize, filterObj);
    } else {
      setFilterConditions(filterObj);
      getData(currentPage, pageSize, filterObj);
    }
  };

  const minutesToRefetch = 5;

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "races",
      },
    });

    const intervalId = setInterval(() => {
      getData(currentPage, pageSize, filterConditions);
    }, minutesToRefetch * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    (async function () {
      // getData3();
      if (searchParams.get("election_id")) {
        setLoading(true);
        const filterObj = { election_id: searchParams.get("election_id") };
        const election = await tdk.getOne(
          "elections",
          searchParams.get("election_id")
        );
        setElectionInfo(election?.model);

        getData(1, pageSize, filterObj);
        setFilterConditions(filterObj);
      } else {
        setElectionInfo({});
        setFilterConditions([]);
        getData(1, pageSize);
      }
      getData2(1, pageSize2);
    })();

    const intervalId = setInterval(() => {
      getData2(currentPage2, pageSize2, filterConditions2);
    }, minutesToRefetch * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [searchParams.get("election_id")]);

  return (
    <div className="p-5 sm:p-10">
      {/* ------------- current races ------------ */}
      <AdminRaceFilterBox
        getDataFn={getData}
        // onSubmitFn={(data) => onSubmit(data, false)}
        onSubmitFn={onSubmit}
        setFilterConditions={setFilterConditions}
        title={"Search Races"}
        prevRaceBox={false}
      />

      <div className="mb-3 flex w-full justify-between text-center  ">
        {/* <SectionTitle
          text={
            electionInfo?.id
              ? `Races of Election, ${electionInfo?.name}`
              : "Races"
          }
        /> */}
        <h4
          className={`text-xl font-medium `}
          style={{
            fontFamily: `Inter, sans-serif `,
          }}
        >
          {electionInfo?.id ? (
            <>
              Races of Election,{" "}
              <span className="capitalize">{electionInfo?.name}</span>
            </>
          ) : (
            "Races"
          )}
        </h4>
        <div className="flex gap-5">
          {!searchParams.get("election_id") && (
            <DownloadButton
              callBackFn={() => setDownloadModalOpen(true)}
              downloading={false}
            />
          )}
          <AddButton
            withIcon={false}
            text={"Create Race"}
            link={`/admin/add-race${
              searchParams.get("election_id")
                ? "?election_id=" + searchParams.get("election_id")
                : ""
            }`}
          />
        </div>
      </div>
      <RacesTable
        currentTableData={currentTableData}
        loading={loading}
        setDltingRace={setDltingRace}
        setShowDeleteModal={setShowDeleteModal}
        getData={getData}
        pageCount={pageCount}
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={currentPage}
        filterConditions={filterConditions}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        dltingPrevRace={false}
        setDltingPrevRace={setDltingPrevRace}
        isPrevRacesTable={false}
        role="admin"
      />

      {/* ------------- previous races ------------- */}
      <div className="mt-8">
        <AdminRaceFilterBox
          prevRaceBox={true}
          getDataFn={getData2}
          // onSubmitFn={(data) => onSubmit(data, true)}
          onSubmitFn={onSubmit}
          setFilterConditions={setFilterConditions2}
          title={"Search Previous Races"}
        />
      </div>

      <div className="mb-3 flex w-full justify-between text-center  ">
        <SectionTitle text={"Previous Races"} />
        {/* <DownloadButton
          callBackFn={() => exportTable(true)}
          downloading={downLoadingRaces2}
        /> */}
      </div>

      <RacesTable
        currentTableData={currentTableData2}
        loading={loading2}
        getData={getData2}
        pageCount={pageCount2}
        pageSize={pageSize2}
        setPageSize={setPageSize2}
        currentPage={currentPage2}
        filterConditions={filterConditions2}
        canPreviousPage={canPreviousPage2}
        canNextPage={canNextPage2}
        setDltingRace={setDltingRace}
        setShowDeleteModal={setShowDeleteModal}
        dltingPrevRace={true}
        setDltingPrevRace={setDltingPrevRace}
        isPrevRacesTable={true}
        role="admin"
      />

      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={() => {
            deleteItem(dltingRace?.id, dltingPrevRace);
          }}
          closeModalFunction={() => {
            setShowDeleteModal(false);
            setDltingRace({ name: "", id: null, election_id: null });
          }}
          title={`Delete The Race`}
          message={`You are about to delete the race, ${dltingRace?.name}. Note that all the petitions against this race will also be deleted.`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}

      {isDownloadModalOpen ? (
        <ReportDownloadModal
          loading={downLoadingRaces}
          setModalOpen={setDownloadModalOpen}
          downloadFunction={exportTable}
        />
      ) : null}
    </div>
  );
};

export default AdminRacesListPage;
