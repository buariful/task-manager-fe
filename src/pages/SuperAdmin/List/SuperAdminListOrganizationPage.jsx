import { InteractiveButton } from "Components/InteractiveButton";
import { SuperAdminNavBar } from "Components/NavBar";
import { PageWrapper } from "Components/PageWrapper";
import { SearchInput } from "Components/SearchInput";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { FaPlus } from "react-icons/fa6";
import { IoFilterCircle } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { supabase } from "Src/supabase";
import moment from "moment";
import { MkdListTable } from "Components/MkdListTable";
import { Pagination } from "Components/Pagination";
import { useNavigate } from "react-router";

const columns = [
  {
    header: "Organization Name",
    accessor: "organization_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Joined Date",
    accessor: "license_joined_at_modified",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Expiry Date",
    accessor: "license_expiry_date_modified",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Total Users",
    accessor: "user_count",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Admins",
    accessor: "admin_count",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Participants",
    accessor: "participant_count",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Report Cards",
    accessor: "report_card_count",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Worksheets",
    accessor: "worksheet_count",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status_modified",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Action",
    accessor: "",
  },
];

export default function SuperAdminListOrganizationPage() {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [filters, setFilters] = React.useState({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();

  const schema = yup
    .object({
      searchText: yup.string(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getData = async ({ page = 1, limit = 10, filters = {} }) => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const searchTerm = filters?.name || "";

      // Call the Supabase RPC
      const { data, error } = await supabase.rpc(
        "get_organization_dashboard_data",
        {
          limit_count: limit,
          offset_count: offset,
          search_term: searchTerm,
        }
      );

      if (error) throw error;

      // Total count is same for all rows (from function)
      const totalCount = data?.[0]?.total_count || 0;

      // Modify and format data
      const dataModified = data?.map((item) => ({
        ...item,
        status_modified:
          item?.status?.toLowerCase() === "active" ? "Enabled" : "Disabled",
        license_joined_at_modified: item?.license_joined_at
          ? moment(item.license_joined_at).format("MMM DD, YYYY")
          : "-",
        license_expiry_date_modified: item?.license_expiry_date
          ? moment(item.license_expiry_date).format("MMM DD, YYYY")
          : "-",
      }));

      // Pagination setup
      setPageSize(limit);
      setPageCount(Math.ceil(totalCount / limit));
      setTotalRecords(totalCount);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error("Error fetching organization dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setFilters((prev) => ({ ...prev, name: data?.searchText?.trim() }));
    getData({
      page: 1,
      limit: pageSize,
      filters: {
        ...filters,
        name: data?.searchText?.trim(),
      },
    });
  };

  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters: filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("organization")
        .delete()
        .eq("id", id);

      if (error) {
        console.log("error->>", error?.message);
        showToast(
          globalDispatch,
          "Failed to delete the organization.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Organization deleted successfully.");
      getData({ page: currentPage, limit: pageSize, filters: filters });
    } catch (error) {
      console.log("catch error->>", error?.message);
      showToast(
        globalDispatch,
        "Failed to delete the organization.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "organization",
      },
    });

    getData({ page: 1, limit: pageSize, filters: {} });
  }, []);

  return (
    <PageWrapper>
      <SuperAdminNavBar />

      {/* search bar */}
      <div className="flex mb-7 items-center gap-5 justify-between">
        <div className="flex  flex-1 max-w-xl items-center gap-5">
          <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
            <SearchInput
              errors={errors}
              register={register}
              name={"searchText"}
              placeholder={"Search by Organization Name"}
            />
          </form>
        </div>

        <InteractiveButton
          onClick={() => navigate("/super-admin/add-organization")}
          className={"!px-10"}
          type={"button"}
        >
          <span className="flex items-center gap-3">
            {" "}
            <FaPlus />
            <span>New Organization</span>
          </span>
        </InteractiveButton>
      </div>

      {/* table */}
      <MkdListTable
        columns={columns}
        tableRole={"super-admin"}
        table={"organization"}
        actionId={"id"}
        deleteItem={handleDeleteItem}
        loading={loading}
        deleteLoading={deleteLoading}
        showDeleteModal={showDeleteModal}
        currentTableData={currentTableData}
        setShowDeleteModal={setShowDeleteModal}
        setCurrentTableData={setCurrentTableData}
        actions={{ delete: true, view: true }}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={pageCount}
        totalRecords={totalRecords}
        limit={pageSize}
        onPageChange={handlePagination}
      />
    </PageWrapper>
  );
}
