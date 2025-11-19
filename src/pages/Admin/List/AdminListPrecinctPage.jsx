import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { RxDownload, RxUpload } from "react-icons/rx";
import { SectionTitle } from "Components/SectionTitle";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SearchDropdown } from "Components/SearchDropdown";
import { MkdInput } from "Components/MkdInput";
import { county_change, excelFileMake } from "Utils/utils";
import counties from "../../../utils/counties.json";
import { StateCountySelect } from "Components/StateCountySelect";
import { ReportDownloadModal } from "Components/ReportDownloadModal";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

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
    header: "County Name",
    accessor: "county_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Precinct Name",
    accessor: "precinct_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Abbreviated Name",
    accessor: "abbreviated_names",
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

const AdminListPrecinctPage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filterConditions, setFilterConditions] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [multipleDLTLoading, setMultipleDLTLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selected_states, setSelected_states] = useState([]);
  const [stateErrorMessage, setStateErrorMessage] = useState(false);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState([]);
  const [countyErrorMessage, setCountyErrorMessage] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = React.useState(false);

  const schema = yup.object({
    pr_name: yup.string(),
    county: yup.string(),
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

  function onSort(columnIndex) {
    if (columns[columnIndex].isSorted) {
      columns[columnIndex].isSortedDesc = !columns[columnIndex].isSortedDesc;
    } else {
      columns.map((i) => (i.isSorted = false));
      columns.map((i) => (i.isSortedDesc = false));
      columns[columnIndex].isSorted = true;
    }

    (async function () {
      await getData(1, pageSize, filterConditions);
    })();
  }

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(1, limit, filterConditions);
    })();
  }

  function previousPage() {
    (async function () {
      await getData(
        currentPage - 1 > 1 ? currentPage - 1 : 1,
        pageSize,
        filterConditions
      );
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 1,
        pageSize,
        filterConditions
      );
    })();
  }

  const deleteItem = async (id) => {
    try {
      sdk.setTable("precincts");
      setDeleteLoading(true);
      const result = await sdk.callRestAPI({ id }, "DELETE");
      if (!result?.error) {
        showToast(globalDispatch, "The precinct has been deleted.");
        getData(currentPage, pageSize, filterConditions);
        setDeleteLoading(false);
        setShowDeleteModal(false);
      }
    } catch (err) {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      tokenExpireError(dispatch, err?.message);
      throw new Error(err);
    }
  };

  const deleteMultiplePrecincts = async () => {
    setMultipleDLTLoading(true);
    try {
      const result = await sdk.deleteByFilter("precincts", {
        county_name: selectedCounty[0]?.label,
      });
      if (!result.error) {
        getData(currentPage, pageSize, filterConditions);
        showToast(globalDispatch, "Precincts are deleted.");
      } else {
        showToast(globalDispatch, "Deletion failed!");
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setMultipleDLTLoading(false);
    setShowModal(false);
  };

  const exportTable = async (_, state, county) => {
    setDownloading(true);
    try {
      if (!county) {
        showToast(globalDispatch, "Please select a county", 4000, "error");
        return;
      }

      const result = await tdk.getList("precincts", {
        direction: "DESC",
        order: "id",
        filter: [`county_name,eq,'${county}'`],
      });
      let tableData = [];
      await Promise.all(
        result?.list?.map((precinct) => {
          tableData.push({
            "County Name": precinct?.county_name,
            "Precinct Name": precinct?.precinct_name,
            "Abbreviated Name": precinct?.abbreviated_names,
          });
        })
      );
      if (
        result?.list?.length === tableData?.length &&
        result?.list?.length > 0
      ) {
        excelFileMake(tableData, "Precincts");
      } else if (result?.list?.length < 1) {
        tableData = [
          {
            "County Name": " ",
            "Precinct Name": " ",
          },
        ];
        excelFileMake(tableData, "Precincts");
      } else {
      }
    } catch (error) {}
    setDownloading(false);
    setDownloadModalOpen(false);
  };

  const handleFileUpload = async (e) => {
    setImportLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const result = await sdk.uploadPrecincts(formData);
      if (!result.error) {
        getData(currentPage, pageSize, filterConditions);
        showToast(globalDispatch, "Precincts are added.");
      }
    } catch (error) {
      showToast(globalDispatch, "Upload failed!", 4000, error?.message);
      tokenExpireError(dispatch, error?.message);
    }
    e.target.value = "";
    setImportLoading(false);
  };

  const precinctSearch = (data) => {
    let filterData = [];
    if (data?.pr_name) {
      filterData.push(`precinct_name,cs,${data?.pr_name}`);
    }
    if (data?.county) {
      filterData.push(`county_name,cs,${data?.county}`);
    }

    getData(1, pageSize, filterData);
    setFilterConditions(filterData);
  };

  async function getData(pageNum, limitNum, filter = []) {
    let tdk = new TreeSDK();
    setLoading(true);
    try {
      let sortField = columns.filter((col) => col.isSorted);

      const result = await tdk.getPaginate("precincts", {
        // payload: { ...currentTableData },
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
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "precinct",
      },
    });

    (function () {
      getData(1, pageSize);
    })();
  }, []);

  return (
    <div className="p-5 sm:p-10">
      <FilterBoxBg className={"mb-10"}>
        <form
          style={{ fontFamily: "Inter, sans-serif" }}
          action=""
          onSubmit={handleSubmit(precinctSearch)}
          className="mb-8"
        >
          <SectionTitle
            text={"Search Precincts"}
            fontRoboto={true}
            className={"mb-5"}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <div className="">
              <label className="mb-2 block  text-sm font-[400]">
                County Name
              </label>

              <input
                type="text"
                placeholder="Precinct Name"
                {...register("county")}
                className={`active: focus:shadow-outline box-shadow w-full resize-none appearance-none rounded border-none bg-[#f5f5f5] p-2  px-4 py-2.5 text-base leading-tight outline-none focus:outline-none`}
              />
            </div>

            <div className="">
              <label className="mb-2 block  text-sm font-[400]">
                Precincts Name
              </label>

              <input
                type="text"
                placeholder="Precinct Name"
                {...register("pr_name")}
                className={`active: focus:shadow-outline box-shadow w-full resize-none appearance-none rounded border-none bg-[#f5f5f5] p-2  px-4 py-2.5 text-base leading-tight outline-none focus:outline-none`}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button className=" rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]">
              Submit
            </button>
            <p
              className="cursor-pointer rounded bg-gradient-to-tr from-red-600 to-red-500 px-4 py-2 text-sm  font-[600] text-white hover:from-red-600 hover:to-red-600"
              onClick={async () => {
                reset();
                setFilterConditions([]);
                getData(1, 10);
              }}
            >
              Clear
            </p>
          </div>
        </form>

        <div className="">
          <h4
            className="mb-3 text-xl font-medium"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Remove All Precincts
          </h4>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <StateCountySelect
              selected_county={selectedCounty}
              selected_states={selected_states}
              setSelected_county={setSelectedCounty}
              setSelected_states={setSelected_states}
              stateErrorMessage={stateErrorMessage}
              setStateErrorMessage={setStateErrorMessage}
              countyErrorMessage={countyErrorMessage}
              setCountyErrorMessage={setCountyErrorMessage}
              filtered_counties={filtered_counties}
              setFiltered_counties={setFiltered_counties}
              electionType={1}
            />
          </div>
          <button
            disabled={selectedCounty?.length === 0}
            className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91] disabled:cursor-not-allowed"
            onClick={() => setShowModal(true)}
          >
            Remove
          </button>
        </div>
      </FilterBoxBg>

      <div className="mb-5 flex w-full items-center justify-between text-center  ">
        <h4
          className="text-2xl font-medium"
          style={{ fontFamily: "Inter,sens-serif" }}
        >
          Precincts
        </h4>
        <div className="flex gap-2">
          <button
            disabled={downloading}
            onClick={() => setDownloadModalOpen(true)}
            className="group mx-1 flex cursor-pointer items-center gap-1 px-3  py-2 text-center text-sm font-medium text-[#3E8EE7] disabled:cursor-not-allowed "
          >
            <RxDownload className="text-xl" />{" "}
            {downloading ? (
              <span className="border-b border-b-transparent">
                Downloading...
              </span>
            ) : (
              <span className="border-b border-b-transparent group-hover:border-b-[#3E8EE7]">
                Download as Excel
              </span>
            )}
          </button>

          <label
            disabled={importLoading}
            className="group mx-1 flex cursor-pointer items-center gap-1 px-3  py-2 text-center text-sm font-medium text-[#3E8EE7] disabled:cursor-not-allowed "
          >
            <RxUpload className="text-xl" />{" "}
            {importLoading ? (
              <span className="border-b border-b-transparent">
                Uploading...
              </span>
            ) : (
              <span className="border-b border-b-transparent group-hover:border-b-[#3E8EE7]">
                Upload Excel File
              </span>
            )}
            <input
              type="file"
              name=""
              onChange={handleFileUpload}
              id=""
              accept=".xls, .xlsx, .csv"
              className="hidden"
              disabled={importLoading}
            />
          </label>

          {/* <ExportButton onClick={exportTable} className="mx-1" /> */}
        </div>
      </div>

      {!loading ? (
        <>
          <div className="overflow-x-auto  rounded">
            {currentTableData?.length > 0 ? (
              <MkdListTable
                onSort={onSort}
                columns={columns}
                tableRole={"official"}
                table={"precincts"}
                actionId={"id"}
                deleteItem={deleteItem}
                loading={loading}
                deleteLoading={deleteLoading}
                showDeleteModal={showDeleteModal}
                currentTableData={currentTableData}
                setShowDeleteModal={setShowDeleteModal}
                setCurrentTableData={setCurrentTableData}
                actions={{ delete: true }}
              />
            ) : (
              <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
                <span className="font-medium">No precincts found</span>
              </p>
            )}
          </div>
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
      {showModal ? (
        <ModalPrompt
          actionHandler={() => {
            deleteMultiplePrecincts();
          }}
          closeModalFunction={() => {
            setShowModal(false);
          }}
          title={`Delete Precincts`}
          message={`You are about to delete the precincts of the county, ${selectedCounty[0]?.label}. Note that, this action is irreversible`}
          acceptText={`REMOVE`}
          rejectText={`CANCEL`}
          loading={multipleDLTLoading}
        />
      ) : null}

      {isDownloadModalOpen ? (
        <ReportDownloadModal
          loading={downloading}
          setModalOpen={setDownloadModalOpen}
          downloadFunction={exportTable}
          withElectionType={false}
        />
      ) : null}
    </div>
  );
};

export default AdminListPrecinctPage;
