import React from "react";
import { AdministratorNavBar } from "Components/NavBar";
import { SearchInput } from "Components/SearchInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdListTable } from "Components/MkdListTable";
import { GlobalContext, showToast } from "Context/Global";
import { useNavigate } from "react-router";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import {
  AddParticipantModal,
  EditParticipantModal,
} from "Components/Administrator";
import moment from "moment";
import { ParticipantFilterDrawer } from "Components/ParticipantFilterDrawer";
import { Pagination } from "Components/Pagination";
import { ParticipantPageHeader } from "Components/ParticipantPageHeader";

const columns = [
  {
    header: "",
    accessor: "id",
    sortingKey: "id",
    isSorted: true,
    isSortedDesc: true,
    select: true,
  },
  {
    header: "Unique ID",
    accessor: "unique_id",
    sortingKey: "unique_id",
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
    accessor: "parent_email",
    sortingKey: "parent_email",
    isSorted: true,
    isSortedDesc: true,
  },
  {
    header: "Created Date",
    accessor: "created_at_modified",
    sortingKey: "created_at",
    isSorted: true,
    isSortedDesc: true,
  },
  // {
  //   header: "Contact",
  //   accessor: "contact_number",
  // },

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
  {
    header: "",
    accessor: "",

    customLinkComponent: true,
    link: "/administrator/participant-reports", // the link will convert into /administrator/participant-reports/:id
    text: "Report card logs",
  },
];

const defaultFilters = {
  name: "",
  statuses: [],
  updatedAfter: "",
  updatedBefore: "",
  searchTerm: "",
  sortBy: "id",
  isOrderDesc: true,
};

const AdministratorListParticipantPage = () => {
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [tableColumns, setTableColumns] = React.useState(columns);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = React.useState(defaultFilters);
  const [selectedParticipants, setSelectedParticipants] = React.useState([]);

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { state } = React.useContext(AuthContext);
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
    reset,
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
        .from("participant")
        .select("*", { count: "exact" })
        .eq("organization_id", state?.organization_id);

      // Add search filter if searchTerm is provided
      if (filters?.searchTerm) {
        query = query.or(
          `unique_id.ilike.%${filters?.searchTerm}%,parent_email.ilike.%${filters?.searchTerm}%,first_name.ilike.%${filters?.searchTerm}%,last_name.ilike.%${filters?.searchTerm}%`
        );
      }
      if (filters?.statuses?.length) {
        query = query.in("status", filters.statuses);
      }
      if (filters?.updatedAfter) {
        query = query.gte("updated_at", filters.updatedAfter);
      }
      if (filters?.updatedBefore) {
        query = query.lte("updated_at", filters.updatedBefore);
      }
      query = query
        .range(from, to)
        .order(filters?.sortBy, { ascending: !filters?.isOrderDesc });
      // query = query.order("id", { ascending: false });

      const { data, error, count } = await query;

      const dataModified = data?.map((item) => {
        const isActive = item?.status?.toLowerCase() === "active";
        return {
          ...item,
          statusModified: isActive ? "Enabled" : "Disabled",
          statusBoolean: isActive,
          created_at_modified: moment(item?.created_at).format("MMM DD, YYYY"),
        };
      });

      setPageSize(limit);
      setPageCount(Math.ceil((count || 0) / limit));
      setTotalRecords(count || 0);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setLoading(false);
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

      setFilters(filter);
      setTableColumns(newTableColumns);
      getData({ page: currentPage, limit: pageSize, filters: filter });
    } catch (error) {
      console.log(error?.message);
    }
  };

  const handleSearchFn = async (data) => {
    setFilters((prev) => ({ ...prev, searchTerm: data?.searchText?.trim() }));
    getData({
      page: 1,
      limit: pageSize,
      filters: {
        ...filters,
        searchTerm: data?.searchText?.trim(),
      },
    });
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const user = currentTableData?.find((user) => user?.id === id);
      const { error, data } = await supabase
        .from("participant")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the participant.",
          4000,
          "error"
        );
      }
      getData({ page: currentPage, limit: pageSize, filters: filters });

      showToast(globalDispatch, "Participant deleted successfully");
    } catch (error) {
      console.error("Failed to delete participant:", error?.message);
      showToast(
        globalDispatch,
        error.message || "Failed to delete the participant"
      );
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
        .from("participant")
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

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    reset();
    getData({ page: 1, limit: pageSize, filters: defaultFilters });
  };
  const handleFilter = () => {
    getData({ page: 1, limit: pageSize, filters: filters });
  };

  const refetchData = (page = currentPage) => {
    getData({ page: page, limit: pageSize, filters: filters });
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "participant",
      },
    });

    getData({ page: currentPage, limit: pageSize, filters: filters });
  }, []);

  return (
    <div className="">
      <AdministratorNavBar />

      <div className="px-7">
        <ParticipantPageHeader
          handleSearchFn={handleSearchFn}
          refetchData={refetchData}
          setShowAddModal={setShowAddModal}
          setIsFilterDrawerOpen={setIsFilterDrawerOpen}
          register={register}
          handleSubmit={handleSubmit}
          selectedParticipants={selectedParticipants}
          setSelectedParticipants={setSelectedParticipants}
        />

        {/* table */}
        <MkdListTable
          columns={tableColumns}
          tableRole={"administrator"}
          table={"participant"}
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
          actions={{ delete: true, edit: true, select: true }}
          selectedItems={selectedParticipants}
          setSelectedItems={setSelectedParticipants}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={pageCount}
          totalRecords={totalRecords}
          limit={pageSize}
          onPageChange={handlePagination}
        />
      </div>

      <AddParticipantModal
        refetch={refetchData}
        setShowModal={setShowAddModal}
        showModal={showAddModal}
      />
      <EditParticipantModal
        refetch={refetchData}
        selectedRecord={selectedUserToEdit}
        setSelectedRecord={setSelectedUserToEdit}
        showModal={selectedUserToEdit?.id}
        handleToggleButton={handleToggleButton}
      />
      <ParticipantFilterDrawer
        isOpen={isFilterDrawerOpen}
        setIsOpen={setIsFilterDrawerOpen}
        handleFilter={handleFilter}
        handleClearFilters={handleClearFilters}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default AdministratorListParticipantPage;
