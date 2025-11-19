import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { excelFileMake, getNonNullValue } from "Utils/utils";
import { PaginationBar } from "Components/PaginationBar";
import { AddButton } from "Components/AddButton";
import { MkdListTable } from "Components/MkdListTable";
import { ExportButton } from "Components/ExportButton";
import { MkdInput } from "Components/MkdInput";
import { SkeletonLoader } from "Components/Skeleton";
import { BiFilterAlt, BiSearch } from "react-icons/bi";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import TreeSDK from "Utils/TreeSDK";
import { SectionTitle } from "Components/SectionTitle";
import { CustomButton } from "Components/CustomButton";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { AdminPartyFilter } from "Components/AdminParty";
import { ReportDownloadModal } from "Components/ReportDownloadModal";
import { DownloadButton } from "Components/DownloadButton";

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
    header: "State",
    accessor: "state",
  },
  {
    header: "County",
    accessor: "county",
  },
  {
    header: "Logo",
    accessor: "image",
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

const AdminListPartyPage = () => {
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
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openFilter, setOpenFilter] = React.useState(false);
  const [showFilterOptions, setShowFilterOptions] = React.useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState([]);
  const [filterConditions, setFilterConditions] = useState("");
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);

  const schema = yup.object({
    name: yup.string(),
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

  function onSort(columnIndex) {
    console.log(columns[columnIndex]);
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
  const exportTable = async (type, state, county) => {
    setDownloading(true);
    try {
      const filter = [`election_type,eq,${type}`, `state,eq,'${state}'`];
      if (county) filter.push(`county,eq,'${county}'`);

      const result = await new TreeSDK().getList("parties", { filter });

      let newDocdtype = [];
      result?.list?.map((item) => {
        newDocdtype.push({
          Id: item?.id,
          Name: item?.name,
          "Election Type":
            Number(item?.election_type) === 1 ? "County" : "State",
          State: item?.state,
          County: item?.county,
        });
      });
      if (result?.list?.length === newDocdtype.length) {
        excelFileMake(newDocdtype, "Parties");
      }
    } catch (error) {
      tokenExpireError(dispatch, error?.message);
    }
    setDownloading(false);
    setDownloadModalOpen(false);
  };

  async function getData(pageNum, limitNum, filter = []) {
    let tdk = new TreeSDK();
    setLoading(true);
    try {
      let sortField = columns.filter((col) => col.isSorted);

      const result = await tdk.getPaginate("parties", {
        page: pageNum,
        size: limitNum,
        order: sortField.length ? sortField[0].accessor : "",
        direction: "DESC",
        filter,
      });
      const { list, total, limit, num_pages, page } = result;
      const list_mod = list?.map((party) => {
        return { ...party, image: party?.logo };
      });
      setCurrentTableData(list_mod);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  }

  const deleteItem = async (id) => {
    try {
      sdk.setTable("parties");
      setDeleteLoading(true);
      const result = await sdk.callRestAPI({ id }, "DELETE");
      if (!result?.error) {
        const tempData = currentTableData;
        const newData = tempData.filter((x) => Number(x.id) !== Number(id));
        if (newData?.length) {
          setCurrentTableData(() => newData);
        } else {
          setCurrentTableData(() => []);
        }
        getData(currentPage, pageSize, filterConditions);
        showToast(globalDispatch, "Party deleted successfully");
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

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "party",
      },
    });

    (async function () {
      getData(1, pageSize);
    })();
  }, []);

  const onSubmit = (data) => {
    setFilterConditions([`name,cs,${data?.name}`]);
    getData(1, pageSize, [`name,cs,${data?.name}`]);
  };

  return (
    <div className="p-5 sm:p-10">
      <AdminPartyFilter
        getData={getData}
        pageSize={pageSize}
        setFilter={setFilterConditions}
      />
      {/* <FilterBoxBg className="mb-10">
        <form
          action=""
          onSubmit={handleSubmit(onSubmit)}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <SectionTitle
            className="mb-5"
            text={"Search Parties"}
            fontRoboto={true}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <MkdInput
              type={"text"}
              name={"name"}
              errors={errors}
              label={"Party Name"}
              placeholder={"Party Name"}
              register={register}
              className={"box-shadow"}
            />
          </div>
          <CustomButton
            callBackFn={async () => {
              reset();
              setFilterConditions("");
              getData(1, 10);
            }}
            isForFilter={true}
          />
        </form>
      </FilterBoxBg> */}
      {/* </div> */}
      {!loading ? (
        <>
          <div className="overflow-x-auto">
            <div className="mb-5 flex w-full justify-between text-center  ">
              {/* <h4 className="text-2xl font-medium">Parties</h4> */}
              <SectionTitle text={"Parties"} />
              <div className="flex">
                <DownloadButton
                  callBackFn={() => setDownloadModalOpen(true)}
                  downloading={false}
                />
                <AddButton
                  text={"Create Party"}
                  withIcon={false}
                  link={"/admin/add-party"}
                />
              </div>
            </div>
            <MkdListTable
              onSort={onSort}
              columns={columns}
              tableRole={"admin"}
              table={"party"}
              actionId={"id"}
              deletingNameAccessor={"name"}
              deleteItem={deleteItem}
              loading={loading}
              deleteLoading={deleteLoading}
              showDeleteModal={showDeleteModal}
              currentTableData={currentTableData}
              setShowDeleteModal={setShowDeleteModal}
              setCurrentTableData={setCurrentTableData}
              actions={{ edit: true, delete: true }}
            />
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

export default AdminListPartyPage;
