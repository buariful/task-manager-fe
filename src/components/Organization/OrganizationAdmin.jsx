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
import { createClient } from "@supabase/supabase-js";
import { useParams } from "react-router-dom";

const columns = [
  {
    header: "User ID",
    accessor: "id",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "First Name",
    accessor: "first_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Last Name",
    accessor: "last_name",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Email",
    accessor: "email",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "Contact",
    accessor: "phone",
    isSorted: false,
    isSortedDesc: false,
  },
  {
    header: "",
    accessor: "statusBoolean",
    toggle_button: true,
  },
  {
    header: "Action",
    accessor: "",
  },
];

export default function OrganizationAdmin() {
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
  const { id: organizationId } = useParams();

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
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("user_profile")
        .select("*", { count: "exact" })
        .ilike("role", "administrator")
        .eq("organization_id", organizationId);
      // 🔍 Search by first_name OR last_name (case-insensitive)
      if (filters?.searchText) {
        const search = `%${filters.searchText}%`;
        query = query.or(
          `first_name.ilike.${search},last_name.ilike.${search}`
        );
      }

      const {
        data,
        error,
        count: totalCount,
      } = await query.range(from, to).order("id", { ascending: false });

      if (error) throw error;

      const dataModified = data?.map((item) => ({
        ...item,
        statusBoolean: item?.status?.toLowerCase() === "active",
      }));

      setPageSize(limit);
      setPageCount(Math.ceil(totalCount / limit));
      setTotalRecords(totalCount);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setFilters((prev) => ({ ...prev, searchText: data?.searchText?.trim() }));
    getData({
      page: 1,
      limit: pageSize,
      filters: {
        ...filters,
        searchText: data?.searchText?.trim(),
      },
    });
  };

  const handleToggleButton = async (value, id) => {
    try {
      let tableDataCopy = currentTableData.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            statusBoolean: value,
          };
        }
        return item;
      });

      const { data: result, error } = await supabase
        .from("user_profile")
        .update({
          status: value ? "active" : "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      setCurrentTableData(tableDataCopy);
    } catch (error) {
      console.error(error);
    }
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
      const user = currentTableData?.find((user) => user?.id === id);

      //  Delete the user_profile record
      const { error: profileError } = await supabase
        .from("user_profile")
        .delete()
        .eq("id", id);

      if (profileError) throw profileError;

      // Delete the user from Auth (requires service role)
      const supabaseAdmin = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      );

      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        user?.user_id
      );
      if (authError) throw authError;

      showToast(globalDispatch, "User deleted successfully");
      await getData({ page: 1, limit: 10, filters: filters });
    } catch (error) {
      console.error("Failed to delete user:", error?.message);
      showToast(globalDispatch, error.message || "Failed to delete the user");
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  React.useEffect(() => {
    if (organizationId) {
      getData({ page: 1, limit: pageSize, filters: {} });
    }
  }, [organizationId]);

  return (
    <PageWrapper>
      {/* table */}
      <MkdListTable
        columns={columns}
        tableRole={"super-admin"}
        table={"organization-admin"}
        actionId={"id"}
        deleteItem={handleDeleteItem}
        loading={loading}
        deleteLoading={deleteLoading}
        showDeleteModal={showDeleteModal}
        currentTableData={currentTableData}
        setShowDeleteModal={setShowDeleteModal}
        setCurrentTableData={setCurrentTableData}
        toggleBtnOnchangeFn={handleToggleButton}
        actions={{ delete: true, edit: true }}
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
