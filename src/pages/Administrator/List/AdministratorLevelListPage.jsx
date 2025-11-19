import React from "react";
import { AdministratorNavBar } from "Components/NavBar";
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
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import AdministratorLevelFilter from "Components/Level/LevelFilterDrawer";
import { LevelFilterDrawer } from "Components/Level";
import moment from "moment";
import { Pagination } from "Components/Pagination";

const columns = [
  {
    header: "Level ID",
    accessor: "id",
    sortingKey: "id",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "Level Name",
    accessor: "name",
    sortingKey: "name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Description",
    accessor: "description",
    sortingKey: "description",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status_modified",
    // sortingKey: "status",
    // isSorted: true,
    // isSortedDesc: false,

    showDot: true,
  },

  {
    header: "Last Modified",
    accessor: "updated_at_modified",
    sortingKey: "updated_at",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Action",
    accessor: "",
    sortingKey: "",
  },
];

const defaultFilters = {
  name: "",
  levelIds: [],
  statuses: [],
  updatedAfter: "",
  updatedBefore: "",
  sortBy: "id",
  isOrderDesc: true,
};

const AdministratorLevelListPage = () => {
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [filters, setFilters] = React.useState(defaultFilters);
  const [tableColumns, setTableColumns] = React.useState(columns);

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
        .from("level")
        .select("*", { count: "exact" }) // fetch count too
        .eq("organization_id", state?.organization_id);

      // Apply filters
      if (filters?.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%`);
      }
      if (filters?.levelIds?.length) {
        query = query.in("id", filters.levelIds);
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

      const { data, error, count } = await query;

      if (error) throw error;

      const dataModified = data?.map((item) => ({
        ...item,
        status_modified:
          item?.status?.toLowerCase() === "active" ? "Enabled" : "Disabled",
        updated_at_modified: moment(item?.updated_at).format(
          "MMM DD, YYYY hh:mm A"
        ),
      }));

      setPageSize(limit);
      setPageCount(Math.ceil((count || 0) / limit));
      setTotalRecords(count || 0);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onSort = (key, isOrderDesc, accessor) => {
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
        .from("level")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the level.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Level deleted successfully.");
      getData({ page: currentPage, limit: pageSize, filters: filters });
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the level.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
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
  const handleClearFilters = () => {
    setFilters(defaultFilters);
    getData({ page: 1, limit: pageSize, filters: defaultFilters });
  };
  const handleFilter = () => {
    getData({ page: 1, limit: pageSize, filters: filters });
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "level",
      },
    });
    getData({ page: currentPage, limit: pageSize, filters: defaultFilters });
  }, []);

  return (
    <div className="">
      <AdministratorNavBar />

      <div className="px-7">
        {/* Bottom search bar */}
        <div className="flex mb-7 items-center gap-5 justify-between">
          <div className="flex  flex-1 max-w-xl items-center gap-5">
            <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
              <SearchInput
                errors={errors}
                register={register}
                name={"searchText"}
                placeholder={"Search by Level Name"}
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

          <InteractiveButton
            onClick={() => navigate("/administrator/add-level")}
            className={"!px-10"}
            type={"button"}
          >
            <span className="flex items-center gap-3">
              {" "}
              <FaPlus />
              <span>New Level</span>
            </span>
          </InteractiveButton>
        </div>

        {/* table */}
        <MkdListTable
          columns={tableColumns}
          tableRole={"administrator"}
          table={"level"}
          actionId={"id"}
          onSort={onSort}
          deleteItem={handleDeleteItem}
          loading={loading}
          deleteLoading={deleteLoading}
          showDeleteModal={showDeleteModal}
          currentTableData={currentTableData}
          setShowDeleteModal={setShowDeleteModal}
          setCurrentTableData={setCurrentTableData}
          actions={{ delete: true, edit: true }}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={pageCount}
          totalRecords={totalRecords}
          limit={pageSize}
          onPageChange={handlePagination}
        />
      </div>

      <LevelFilterDrawer
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

export default AdministratorLevelListPage;
