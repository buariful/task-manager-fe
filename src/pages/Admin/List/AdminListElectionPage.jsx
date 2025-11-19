import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { set, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { excelFileMake, formatDate } from "Utils/utils";
import { PaginationBar } from "Components/PaginationBar";
import { AddButton } from "Components/AddButton";
import { SkeletonLoader } from "Components/Skeleton";
import TreeSDK from "Utils/TreeSDK";
import { ModalPrompt } from "Components/Modal";
import { DownloadButton } from "Components/DownloadButton";
import { SectionTitle } from "Components/SectionTitle";
import { FilterBoxBg } from "Components/FilterBoxBg";
// import "../../Official/list/officialListElection.css";
import {
  AdminElectionFilter,
  AdminElectionTable,
} from "Components/AdminElectionComponents";
import { ReportDownloadModal } from "Components/ReportDownloadModal";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Id",
    accessor: "id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Name",
    accessor: "name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Election Date",
    accessor: "election_date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Races",
    accessor: "races_id",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Composite Ballot Status",
    accessor: "composite_ballot_status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Is Template",
    accessor: "is_template",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Action",
    accessor: "",
  },
];

const AdminListElectionPage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState([]);
  const [showDltElectionModal, setShowDltElectionModal] = React.useState(false);
  const [dltElecLoading, setDltElecLoading] = React.useState(false);
  const [dltingElection, setDltingElection] = React.useState({
    name: "",
    id: null,
  });
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const schema = yup.object({
    elec_name: yup.string(),
    elec_date: yup.string(),
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(1, limit, filter);
    })();
  }

  function previousPage() {
    (async function () {
      await getData(
        currentPage - 1 > 1 ? currentPage - 1 : 1,
        pageSize,
        filter
      );
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 1,
        pageSize,
        filter
      );
    })();
  }

  async function getData(pageNum, limitNum, filterOption = []) {
    let tdk = new TreeSDK();
    setLoading(true);
    try {
      let sortField = columns.filter((col) => col.isSorted);
      const filter = [...filterOption];

      const result = await tdk.getPaginate("elections", {
        page: pageNum,
        size: limitNum,
        order: sortField.length ? sortField[0].accessor : "",
        direction: sortField.length
          ? sortField[0].isSortedDesc
            ? "DESC"
            : "ASC"
          : "",
        filter,
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
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  }

  const handleDltElection = async () => {
    setDltElecLoading(true);
    try {
      sdk.setTable("elections");
      const result = await sdk.callRestAPI(
        { id: dltingElection?.id },
        "DELETE"
      );
      if (!result?.error) {
        sdk.setTable("races");
        await sdk.callRestAPI(
          {
            set: { status: 0 },
            where: { election_id: dltingElection?.id },
          },
          "PUTWHERE"
        );
        sdk.setTable("petition");
        await sdk.callRestAPI(
          {
            set: { status: 0 },
            where: { election_id: dltingElection?.id },
          },
          "PUTWHERE"
        );

        showToast(globalDispatch, "Election deleted successfully.");
        getData(currentPage, pageSize, filter);
      }
    } catch (error) {
      showToast(
        globalDispatch,
        error?.message || "The election deletion failed.",
        4000,
        "error"
      );
      tokenExpireError(dispatch, error?.message);
    }
    setDltElecLoading(false);
    setShowDltElectionModal(false);
    setDltingElection({});
  };

  const exportTable = async (type, state, county) => {
    setDownloading(true);
    try {
      const filter = [`election_type,eq,${type}`, `state,eq,'${state}'`];
      if (county) filter.push(`county,eq,'${county}'`);

      const result = await new TreeSDK().getList("elections", { filter });

      let newDocdtype = [];
      result?.list?.map((item) => {
        newDocdtype.push({
          Id: item?.id,
          Name: item?.name,
          "Election Date": formatDate(item?.election_date),
          Races: (JSON.parse(item?.races_id) || [])
            ?.map((race) => race?.name)
            ?.join(", "),
          "Composite Ballot Status": item?.composite_ballot_status
            ? "Done"
            : "Pending",
          "Is Template": item?.is_template ? "Yes" : "No",
          Status: item?.status ? "Active" : "Inactive",
          "Election Type":
            Number(item?.election_type) === 1 ? "County" : "State",
          State: item?.state,
          County: item?.county,
        });
      });
      if (result?.list?.length === newDocdtype.length) {
        excelFileMake(newDocdtype, "Elections");
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
    }
    setDownloading(false);
    setDownloadModalOpen(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "election",
      },
    });

    (async function () {
      try {
        getData(1, pageSize);
      } catch (error) {
        tokenExpireError(globalDispatch, "Token Expired");
      }
    })();
  }, []);

  return (
    <div className="p-5 sm:p-10">
      <AdminElectionFilter setFilter={setFilter} getData={getData} />

      <div className="mb-5 flex w-full items-center justify-between text-center  ">
        <SectionTitle text={"Elections"} />
        <div className="flex gap-3">
          <DownloadButton
            callBackFn={() => setDownloadModalOpen(true)}
            downloading={false}
          />
          <AddButton
            withIcon={false}
            text={"Create Election"}
            link={"/admin/add-election"}
          />
        </div>
      </div>
      {!loading ? (
        <>
          <AdminElectionTable
            currentTableData={currentTableData}
            loading={loading}
            setDltingElection={setDltingElection}
            setShowDltElectionModal={setShowDltElectionModal}
          />
          <PaginationBar
            currentPage={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            updatePageSize={updatePageSize}
            previousPage={previousPage}
            nextPage={nextPage}
          />{" "}
        </>
      ) : (
        <SkeletonLoader />
      )}

      {showDltElectionModal ? (
        <ModalPrompt
          actionHandler={() => {
            handleDltElection();
          }}
          closeModalFunction={() => {
            setShowDltElectionModal(false);
            setDltingElection({});
          }}
          title={`Delete The Election`}
          message={`You are about to delete the election, ${dltingElection?.name}. Note that, this action is irreversible`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={dltElecLoading}
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

export default AdminListElectionPage;
