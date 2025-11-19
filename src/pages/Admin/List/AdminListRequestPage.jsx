import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue } from "Utils/utils";
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
import { ModificationFilter, ModificationTable } from "Components/Modification";

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
    header: "Candidate Name",
    accessor: "candidate_name",
  },
  {
    header: "Race Name",
    accessor: "race_name",
  },
  {
    header: "Status",
    accessor: "status",
  },

  {
    header: "Action",
    accessor: "",
  },
];

const AdminListRequestPage = () => {
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
  const [filterConditions, setFilterConditions] = useState({});
  const navigate = useNavigate();

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

  async function getData(pageNum, limitNum, filter = {}) {
    setLoading(true);
    try {
      // where, where2, where3, limit, page, orderBy, direction
      const result = await sdk.getModificationRequests({
        page: pageNum,
        limit: limitNum,
        orderBy: "staci_j_modification.id",
        direction: "DESC",
        ...filter,
      });

      const { list, total, limit, num_pages, page } = result;

      setCurrentTableData(list);
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

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "request",
      },
    });

    (async function () {
      getData(1, pageSize);
    })();
  }, []);

  return (
    <div className="p-5 sm:p-10">
      <ModificationFilter
        getDataFn={getData}
        setFilterConditions={setFilterConditions}
      />

      {!loading ? (
        <>
          <div className="overflow-x-auto">
            <div className="mb-5 flex w-full justify-between text-center  ">
              {/* <h4 className="text-2xl font-medium">Parties</h4> */}
              <SectionTitle text={"Modification Requests"} />
            </div>

            <ModificationTable
              tableData={currentTableData}
              tableRole={"admin"}
              loading={loading}
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
    </div>
  );
};

export default AdminListRequestPage;
