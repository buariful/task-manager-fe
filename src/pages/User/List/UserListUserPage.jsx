import React from "react";
import { UserNavBar } from "Components/NavBar";
import { SearchInput } from "Components/SearchInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { IoFilterCircle } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { MkdListTable } from "Components/MkdListTable";
import { PaginationBar } from "Components/PaginationBar";
import { GlobalContext, showToast } from "Context/Global";
import { useNavigate } from "react-router";
import { AddUserModal, EditUserModal } from "Components/AdministratorUser";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { createClient } from "@supabase/supabase-js";
import { ImportData } from "Components/Import";
import { UserFilterDrawer } from "Components/User";
import { Pagination } from "Components/Pagination";
import { usePermissionFetcher } from "Src/hooks/useSinglePermissionFetch";
import { PageWrapper } from "Components/PageWrapper";
import { Spinner } from "Assets/svgs";
import { PermissionWarning } from "Components/PermissionWarning";

const columns = [
  {
    header: "User ID",
    accessor: "id",
    sortingKey: "id",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "First Name",
    accessor: "first_name",
    sortingKey: "first_name",
    isSorted: true,
    isSortedDesc: true,
  },
  {
    header: "Last Name",
    accessor: "last_name",
    sortingKey: "last_name",
    isSorted: true,
    isSortedDesc: true,
  },
  {
    header: "Email",
    accessor: "email",
    sortingKey: "email",
    isSorted: true,
    isSortedDesc: true,
  },
  {
    header: "Role",
    accessor: "role_modified",
    sortingKey: "role_modified",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "Status",
    accessor: "statusModified",
    // sortingKey: "status",
    // isSorted: true,
    // isSortedDesc: true,
    showDot: true,
  },

  {
    header: "",
    accessor: "statusBoolean",
    toggle_button: true,
  },

  {
    header: "Action",
    accessor: "",
    action: { edit: true, delete: true },
  },
];

const sampleUsers = [
  {
    first_name: "John",
    last_name: "Doe",
    email: "ariful.islam@example.com",
    role: "developer",
  },
  {
    first_name: "Json",
    last_name: "Steve",
    email: "kson.steve@example.com",
    role: "manager",
  },
];

const defaultFilters = {
  roleIds: [],
  statuses: [],
  sortBy: "id",
  isOrderDesc: true,
};

const UserListUserPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { state } = React.useContext(AuthContext);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [tableColumns, setTableColumns] = React.useState(columns);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [filters, setFilters] = React.useState(defaultFilters);

  const { data: permission, loading: permissionLoading } =
    usePermissionFetcher("user");

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

  const getData = async ({
    searchTerm = "",
    page = 1,
    limit = 10,
    filters = {},
  } = {}) => {
    setLoading(true);
    try {
      const validPage = Math.max(page || 1, 1);
      const from = (validPage - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("user_profile")
        .select(
          `
            *,
            roles (
              id,
              name
            )
          `,
          { count: "exact" }
        )
        .eq("organization_id", state?.organization_id)
        .eq("role", "user");

      // 🔍 Search filter
      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      // 🎛 Filters
      if (filters?.roleIds?.length)
        query = query.in("role_id", filters.roleIds);
      if (filters?.statuses?.length)
        query = query.in("status", filters.statuses);

      // 🪄 Regular sorting (non-role columns)
      if (filters?.sortBy && filters?.sortBy !== "role_modified") {
        query = query.order(filters.sortBy, {
          ascending: !filters?.isOrderDesc,
        });
      } else {
        query = query.order("id", { ascending: false });
      }

      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      // ✨ Modify and format data
      let dataModified = (data || []).map((item) => {
        const isActive = item?.status?.toLowerCase() === "active";
        return {
          ...item,
          role_modified: item?.roles?.name || "",
          statusModified: isActive ? "Enabled" : "Disabled",
          statusBoolean: isActive,
        };
      });

      // ✅ Update UI
      setCurrentTableData(dataModified);
      setPageSize(limit);
      setPageCount(Math.ceil((count || 0) / limit));
      setTotalRecords(count || 0);
    } catch (error) {
      console.error("Failed to get:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSort = async (key, isOrderDesc, accessor) => {
    try {
      const filter = { ...filters, sortBy: key, isOrderDesc };
      const newTableColumns = tableColumns?.map((cl) => {
        if (cl?.accessor === accessor) {
          return { ...cl, isSortedDesc: isOrderDesc };
        }
        return cl;
      });

      // 🔠 Role name sorting (alphabetical)
      if (key === "role_modified") {
        setLoading(true);
        const data = [...currentTableData]?.sort((a, b) => {
          const nameA = (a?.role_modified || "").trim().toLowerCase();
          const nameB = (b?.role_modified || "").trim().toLowerCase();

          if (nameA < nameB) return isOrderDesc ? 1 : -1;
          if (nameA > nameB) return isOrderDesc ? -1 : 1;
          return 0;
        });
        await new Promise((resolve) => setTimeout(resolve, 100));

        setTableColumns(newTableColumns);
        setCurrentTableData(data);
        setLoading(false);
        setFilters(filter);
        return;
      }

      setTableColumns(newTableColumns);
      getData({ page: currentPage, limit: pageSize, filters: filter });
    } catch (error) {
      console.log(error?.message);
    }
  };

  const onSubmit = async (formData) => {
    // Reset to first page when searching
    getData({ searchTerm: formData?.searchText, page: 1, limit: pageSize });
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    getData({ page: 1, limit: pageSize, filters: defaultFilters });
  };

  const handleFilter = () => {
    getData({ page: 1, limit: pageSize, filters });
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const user = currentTableData?.find((user) => user?.id === id);
      console.log({
        a: import.meta.env.VITE_SUPABASE_URL,
        b: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        user,
      });

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
      await getData();
    } catch (error) {
      console.error("Failed to delete user:", error?.message);
      showToast(globalDispatch, error.message || "Failed to delete the user");
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const handleToggleButton = async (value, id) => {
    try {
      let tableDataCopy = currentTableData.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            statusBoolean: value,
            statusModified: value ? "Enabled" : "Disabled",
            status: value ? "active" : "inactive",
          };
        }
        return item;
      });

      const { data: result, error } = await supabase
        .from("user_profile")
        .update({
          status: value ? "Enabled" : "Disabled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      setCurrentTableData(tableDataCopy);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImportUsers = async (data) => {
    try {
      const rolesFromFile = [];
      data?.forEach((item) => {
        const role = item?.role?.trim();
        if (role && !rolesFromFile.includes(role)) {
          rolesFromFile.push(role);
        }
      });

      const filters = rolesFromFile?.map((r) => `name.ilike.${r}`).join(",");

      const { data: userRoles } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("access_type", "user")
        .or(filters);

      if (!userRoles?.length) {
        showToast(
          globalDispatch,
          "No roles found, please first create one.",
          4000,
          "error"
        );
        return;
      }
      const firstRole = userRoles[0];

      const payload = data?.map((item) => {
        const matchedRole = userRoles?.find(
          (role) =>
            role?.name?.trim().toLowerCase() ===
            item?.role?.trim().toLowerCase()
        );

        return {
          ...item,
          role: "user",
          role_id: matchedRole?.id || firstRole?.id,
          organization_id: state?.organization_id,
        };
      });

      const { data: result, error } = await supabase.functions.invoke(
        "create-users-bulk",
        { body: JSON.stringify({ users: payload }) }
      );
      if (!result?.success) {
        throw new Error(result.error || "Failed to create users");
      }

      showToast(globalDispatch, "Users created successfully");
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const refetchData = () => {
    getData();
  };

  const handleOpenEditModal = (id) => {
    try {
      const selectedUser = currentTableData?.find((item) => item?.id === id);
      setSelectedUserToEdit(selectedUser);
    } catch (error) {
      console.log("handleOpenEditModal->>", error?.message);
    }
  };
  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters: filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "user",
      },
    });

    getData({ page: 1, limit: pageSize, filters: defaultFilters });
  }, []);

  return (
    <div className="">
      <UserNavBar />

      {permissionLoading ? (
        <div className="flex items-center justify-center my-10">
          <Spinner size={100} />
        </div>
      ) : permission?.view ? (
        <PageWrapper>
          {/* Bottom search bar */}
          <div className="flex mb-7 items-center gap-5 justify-between">
            <div className="flex  flex-1 max-w-xl items-center gap-5">
              <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
                <SearchInput
                  errors={errors}
                  register={register}
                  name={"searchText"}
                  placeholder={"Search by user name"}
                />
              </form>

              <InteractiveButton
                type={"button"}
                // className={"hover:!border-secondary hover:!text-secondary"}
                isSecondaryBtn={true}
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                <p className="flex items-center gap-2">
                  <span>Filter</span>
                  <IoFilterCircle className="" size={25} />
                </p>
              </InteractiveButton>
            </div>

            <div className="flex items-center gap-2">
              {permission?.import ? (
                <ImportData
                  importDataFunction={handleImportUsers}
                  title={"Import User"}
                  refetch={refetchData}
                  sampleData={sampleUsers}
                />
              ) : null}

              {permission?.add ? (
                <InteractiveButton
                  onClick={() => setShowAddModal(true)}
                  className={"!px-10"}
                  type={"button"}
                >
                  <span className="flex items-center gap-3">
                    {" "}
                    <FaPlus />
                    <span>New User</span>
                  </span>
                </InteractiveButton>
              ) : null}
            </div>
          </div>

          {/* table */}
          <MkdListTable
            columns={tableColumns}
            tableRole={"user"}
            table={"user"}
            actionId={"id"}
            onSort={onSort}
            deleteItem={handleDeleteItem}
            loading={loading}
            deleteLoading={deleteLoading}
            showDeleteModal={showDeleteModal}
            currentTableData={currentTableData}
            setShowDeleteModal={setShowDeleteModal}
            setCurrentTableData={setCurrentTableData}
            handleEditFunction={handleOpenEditModal}
            toggleBtnOnchangeFn={handleToggleButton}
            actions={{ delete: permission?.delete, edit: permission?.add }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            totalRecords={totalRecords}
            limit={pageSize}
            onPageChange={handlePagination}
          />
        </PageWrapper>
      ) : (
        <PermissionWarning />
      )}

      <AddUserModal
        refetch={getData}
        setShowModal={setShowAddModal}
        showModal={showAddModal}
      />
      <EditUserModal
        refetch={getData}
        selectedRecord={selectedUserToEdit}
        setSelectedRecord={setSelectedUserToEdit}
        showModal={selectedUserToEdit?.id}
        handleToggleButton={handleToggleButton}
      />

      <UserFilterDrawer
        isOpen={isFilterDrawerOpen}
        setIsOpen={setIsFilterDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        handleClearFilters={handleClearFilters}
        handleFilter={handleFilter}
      />
    </div>
  );
};

export default UserListUserPage;
