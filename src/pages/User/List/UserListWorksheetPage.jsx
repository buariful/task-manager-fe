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
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import moment from "moment";
import { Pagination } from "Components/Pagination";
import { WorksheetFilterDrawer } from "Components/WorkSheet";
import {
  downloadCsv,
  parseCsvData,
  parseExcelData,
  worksheetStatus,
} from "Utils/utils";
import { useRef } from "react";
import { ImportWorksheet } from "Components/Import";
import { generateWorksheetsPdf } from "Utils/generateWorksheetsPdf";
import { usePermissionFetcher } from "Src/hooks/useSinglePermissionFetch";

const columns = [
  {
    header: "",
    accessor: "id",
    select: true,
  },
  {
    header: "Worksheet Id",
    // accessor: "course_code",
    accessor: "id",
    sortingKey: "id",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "Worksheet Name",
    accessor: "name",
    sortingKey: "name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Level",
    accessor: "level_name",
    sortingKey: "level_name",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Season",
    accessor: "season_name",
    sortingKey: "season_name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Instructor Name",
    accessor: "instructor_name",
    sortingKey: "instructor_name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Location",
    accessor: "location_name",
    sortingKey: "location_name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Day(s) of the Week",
    accessor: "days_of_week",
    // sortingKey: "days_of_week",
    // isSorted: true,
    // isSortedDesc: false,
  },
  {
    header: "Start Date",
    accessor: "start_date",
    sortingKey: "start_date",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status_modified",

    mappings: {},
  },

  {
    header: "Created Date",
    accessor: "created_at",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Action",
    accessor: "",
  },
];

const tabs = [
  { lable: "All", value: 1 },
  { lable: "My Workplace", value: 2 },
];

const primaryFilters = {
  selectedTab: 1,
  name: "",
  levelIds: [],
  instructorIds: [],
  created_at_after: "",
  created_at_before: "",
  locationIds: [],
  seasonIds: [],
  days_of_week: [],
  start_date_after: "",
  start_date_before: "",
  sortBy: "id",
  isOrderDesc: true,
};

const UserListWorksheetPage = () => {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [filters, setFilters] = React.useState(primaryFilters);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [selectedWorksheets, setSelectedWorksheets] = React.useState([]);
  const [failedWorksheetsCodes, setFailedWorksheetsCodes] = React.useState([]);
  const [importing, setImporting] = React.useState(false);
  const [tableColumns, setTableColumns] = React.useState(columns);

  const { data: permission, loading: permissionLoading } =
    usePermissionFetcher("worksheet");

  const navigate = useNavigate();

  const schema = yup
    .object({
      searchText: yup.string(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // const getData = async ({ page = 1, limit = 10, filters = {} }) => {
  //   setLoading(true);
  //   try {
  //     const from = (page - 1) * limit;
  //     const to = from + limit - 1;

  //     let query = supabase
  //       .from("worksheet")
  //       .select(
  //         `
  //         *,
  //         level: level_id(id, name),
  //         season: season_id(id, name),
  //         location: location(id, name),
  //         instructor: instructor_id(id, first_name, last_name)
  //         `,
  //         { count: "exact" }
  //       ) // fetch count too
  //       .eq("organization_id", state?.organization_id);

  //     if (filters?.selectedTab === 2) {
  //       query = query.eq(`added_by`, state?.user);
  //     }
  //     if (filters?.name) {
  //       query = query.or(`name.ilike.%${filters.name}%`);
  //     }
  //     if (filters?.levelIds?.length) {
  //       query = query.in("level_id", filters.levelIds);
  //     }

  //     if (filters?.instructorIds?.length) {
  //       query = query.in("instructor_id", filters?.instructorIds);
  //     }
  //     if (filters?.locationIds?.length) {
  //       query = query.in("location_id", filters?.locationIds);
  //     }
  //     if (filters?.seasonIds?.length) {
  //       query = query.in("season_id", filters?.seasonIds);
  //     }
  //     if (filters?.days_of_week?.length) {
  //       const conditions = filters.days_of_week.map(
  //         (day) => `days_of_week.ilike.%${day}%`
  //       );
  //       query = query.or(conditions.join(","));
  //     }
  //     if (filters?.created_at_after) {
  //       query = query.gte("created_at", filters?.created_at_after);
  //     }
  //     if (filters?.created_at_before) {
  //       query = query.lte("created_at", filters?.created_at_before);
  //     }
  //     if (filters?.start_date_after) {
  //       query = query.gte("start_date_time", filters?.start_date_after);
  //     }
  //     if (filters?.start_date_before) {
  //       query = query.lte("start_date_time", filters?.start_date_before);
  //     }

  //     query = query.range(from, to).order("id", { ascending: false });

  //     const { data, error, count } = await query;

  //     if (error) throw error;

  //     const dataModified = data?.map((item) => ({
  //       ...item,
  //       instructor_name:
  //         item?.instructor?.first_name + " " + item?.instructor?.last_name,
  //       status_modified:
  //         item?.status?.toLowerCase() === worksheetStatus?.inProgress
  //           ? "Completed"
  //           : item?.status,
  //       level_name: item?.level?.name,
  //       location_name: item?.location?.name,
  //       season_name: item?.season?.name,
  //       start_date: moment(item?.start_date_time).format("DD MMM YYYY"),
  //       created_at: moment(item?.created_at).format("MMM DD, YYYY hh:mm A"),
  //     }));

  //     setPageSize(limit);
  //     setPageCount(Math.ceil((count || 0) / limit));
  //     setTotalRecords(count || 0);
  //     setPage(page);
  //     setCurrentTableData(dataModified);
  //   } catch (error) {
  //     console.error(error?.message);
  //   }
  //   setLoading(false);
  // };

  const getData = async ({ page = 1, limit = 10, filters = {} }) => {
    setLoading(true);

    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters)
          .map(([key, value]) => {
            if (Array.isArray(value))
              return [key, value.length ? value : undefined];
            if (typeof value === "string")
              return [key, value.trim() ? value : undefined];
            return [key, value];
          })
          .filter(([_, v]) => v !== undefined)
      );

      if (filters?.selectedTab === 2) {
        cleanedFilters["added_by"] = state?.user;
      }

      const { data, error } = await supabase.rpc("get_worksheets", {
        p_organization_id: state?.organization_id,
        p_page: page,
        p_limit: limit,
        p_filters: cleanedFilters || {},
        p_sort_by: filters?.sortBy || "id",
        p_is_order_desc: !!filters?.isOrderDesc,
      });

      if (error) throw error;

      const dataModified = data?.map((item) => ({
        ...item,
        instructor_name: item?.instructor_name,
        status_modified:
          item?.status?.toLowerCase() === worksheetStatus?.inProgress
            ? "Completed"
            : item?.status,
        level_name: item?.level_name,
        location_name: item?.location_name,
        season_name: item?.season_name,
        start_date: moment(item?.start_date_time).format("DD MMM YYYY"),
        created_at: moment(item?.created_at).format("MMM DD, YYYY hh:mm A"),
      }));
      const totalCount = data?.[0]?.total_count;

      setPageCount(Math.ceil((totalCount || 0) / limit));
      setTotalRecords(totalCount || 0);
      setPageSize(limit);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error(error?.message);
    }
    setLoading(false);
  };

  const onSubmit = async (data) => {
    const newFilterObj = { ...filters, name: data?.searchText };

    setFilters(newFilterObj);
    getData({ page: 1, limit: pageSize, filters: newFilterObj });
  };

  const handleClearFilters = () => {
    setValue("searchText", "");
    setFilters(primaryFilters);
    getData({ page: 1, limit: pageSize, filters: primaryFilters });
  };

  const handleFilter = () => {
    getData({ page: 1, limit: pageSize, filters: filters });
  };

  const refetch = () => {
    getData({ page: 1, limit: pageSize, filters: {} });
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("worksheet")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the worksheet.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Worksheet deleted successfully.");
      getData({ page: currentPage, limit: pageSize, filters: filters });
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the worksheet.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
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

  const handleTabClick = (value) => {
    try {
      setFilters((prev) => ({ ...prev, selectedTab: value }));
      getData({
        page: 1,
        limit: pageSize,
        filters: { ...filters, selectedTab: value },
      });
    } catch (error) {}
  };

  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  const downloadWorksheetsAsExcel = () => {
    try {
      const modifiedList = selectedWorksheets?.map((item) => ({
        "Worksheet Id": item?.course_code || "",
        Name: item?.name || "",
        Level: item?.level?.name || "",
        Season: item?.season?.name || "",
        Instructor: item?.instructor_name || "",
        Location: item?.location?.name || "",
        "Day(s)": item?.days_of_week || "",
        "Start Date": item?.start_date || "",
        "Created At": item?.created_at,
      }));

      downloadCsv(modifiedList, "Worksheet.csv");
    } catch (error) {
      console.log("downloadWorksheetsAsExcel->>", error?.message);
    }
  };

  const handleDownloadAll = async () => {
    await generateWorksheetsPdf(
      selectedWorksheets?.map((item) => item?.id),
      setImporting
    );
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "worksheet",
      },
    });

    getData({ page: 1, limit: 10, filters: primaryFilters });
  }, []);

  return (
    <div className="">
      <UserNavBar />

      <div className="px-7">
        {/* Bottom filter bar */}
        <div className="flex mb-7 items-center justify-between gap-5">
          <div className="flex-1 flex items-center gap-5">
            <div className="flex items-center">
              {tabs?.map((tab) => (
                <InteractiveButton
                  key={tab.value}
                  className={`!text-base !border-none font-normal !px-10 ${
                    // selectedTab === tab.value
                    filters?.selectedTab === tab.value
                      ? "!bg-light-info !text-accent"
                      : "!bg-[#f5f5f5] !text-accent"
                  }`}
                  onClick={() => handleTabClick(tab.value)}
                >
                  {tab.lable}
                </InteractiveButton>
              ))}
            </div>

            <div className="flex  flex-1 w-full items-center gap-5">
              <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
                <SearchInput
                  errors={errors}
                  register={register}
                  name={"searchText"}
                  placeholder={"Search by Name"}
                />
              </form>

              <InteractiveButton
                type={"button"}
                className={""}
                isSecondaryBtn={true}
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                <p className="flex items-center gap-2">
                  <span>Filter</span>
                  <IoFilterCircle className="" size={25} />
                </p>
              </InteractiveButton>
            </div>
          </div>

          {permission?.export && selectedWorksheets?.length ? (
            <div className="flex items-center gap-3">
              <InteractiveButton
                onClick={downloadWorksheetsAsExcel}
                type={"button"}
              >
                <span>Export</span>
              </InteractiveButton>
              <InteractiveButton
                disable={importing}
                loading={importing}
                onClick={handleDownloadAll}
                type={"button"}
              >
                <span>Export as PDF</span>
              </InteractiveButton>
            </div>
          ) : (
            <>
              {permission?.import ? (
                <ImportWorksheet
                  refetchFn={refetch}
                  setFailedWorksheetsCodes={setFailedWorksheetsCodes}
                />
              ) : null}

              {permission?.add ? (
                <InteractiveButton
                  onClick={() => navigate("/user/add-worksheet")}
                  className={"!px-10"}
                  type={"button"}
                >
                  <span className="flex items-center gap-3">
                    {" "}
                    <FaPlus />
                    <span>New Worksheet</span>
                  </span>
                </InteractiveButton>
              ) : null}
            </>
          )}
        </div>

        {/* worksheet import failed error */}
        {failedWorksheetsCodes?.length ? (
          <div className="my-3 bg-red-200  text-red-500 py-2 px-4 border border-red-300 rounded-md flex items-center gap-3 justify-between">
            <p>
              Failed to create these worksheets:
              {failedWorksheetsCodes?.map((code, i) => (
                <span key={i}>
                  {i + 1}. {code}
                  {"  "}
                </span>
              ))}
              .
            </p>
            <button
              onClick={() => setFailedWorksheetsCodes([])}
              className="text-white hover:text-red-500"
            >
              X
            </button>
          </div>
        ) : null}

        {/* table */}
        <MkdListTable
          columns={tableColumns}
          tableRole={"user"}
          table={"worksheet"}
          actionId={"id"}
          onSort={onSort}
          deleteItem={handleDeleteItem}
          loading={loading}
          deleteLoading={deleteLoading}
          showDeleteModal={showDeleteModal}
          currentTableData={currentTableData}
          setShowDeleteModal={setShowDeleteModal}
          setCurrentTableData={setCurrentTableData}
          selectedItems={selectedWorksheets}
          setSelectedItems={setSelectedWorksheets}
          actions={{
            delete: permission?.delete,
            edit: permission?.add,
            select: true,
          }}
        />
        {console.log("pageCount->>", pageCount)}
        <Pagination
          currentPage={currentPage}
          totalPages={pageCount}
          totalRecords={totalRecords}
          limit={pageSize}
          onPageChange={handlePagination}
        />
      </div>

      <WorksheetFilterDrawer
        filters={filters}
        setFilters={setFilters}
        handleClearFilters={handleClearFilters}
        handleFilter={handleFilter}
        isOpen={isFilterDrawerOpen}
        setIsOpen={setIsFilterDrawerOpen}
      />
    </div>
  );
};

export default UserListWorksheetPage;
