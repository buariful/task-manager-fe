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
import { GlobalContext } from "Context/Global";
import { supabase } from "Src/supabase";
import { Pagination } from "Components/Pagination";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import moment from "moment";
import { worksheetStatus } from "Utils/utils";
import { WorksheetFilterDrawer } from "Components/WorkSheet";
import { ReportFilterDrawer, ReportTemplateCard } from "Components/Report";
import { LuPencilLine } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "Assets/svgs";

const columns = [
  {
    header: "Worksheet Id",
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
    accessor: "status",
    // sortingKey: "status",
    // isSorted: true,
    // isSortedDesc: false,
  },

  {
    header: "Created Date",
    accessor: "created_at_modified",
    sortingKey: "created_at",

    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Action",
    accessor: "",
  },
];

const primaryFilters = {
  name: "",
  levelIds: [],
  instructorIds: [],
  modified_at_after: "",
  modified_at_before: "",
  locationIds: [],
  seasonIds: [],
  days_of_week: [],
  start_date_after: "",
  start_date_before: "",
  sortBy: "id",
  isOrderDesc: true,
};

const ReportWorksheetList = ({
  filters,
  setFilters,
  isFilterDrawerOpen,
  setIsFilterDrawerOpen,
  role = "user",
  isWithEdit = true,
}) => {
  const { state } = useContext(AuthContext);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [tableColumns, setTableColumns] = React.useState(columns);
  const [currentTableData, setCurrentTableData] = React.useState([]);

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
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
  //       )
  //       .eq("organization_id", state?.organization_id)
  //       .neq("status", "active");

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
  //     if (filters?.modified_at_after) {
  //       query = query.gte("updated_at", filters?.modified_at_after);
  //     }
  //     if (filters?.modified_at_before) {
  //       query = query.lte("updated_at", filters?.modified_at_before);
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
  //       level_name: item?.level?.name,
  //       location_name: item?.location?.name,
  //       season_name: item?.season?.name,
  //       start_date: moment(item?.start_date_time).format("DD MMM YYYY"),
  //       created_at_modified: moment(item?.created_at).format(
  //         "MMM DD, YYYY hh:mm A"
  //       ),
  //     }));

  //     setPageSize(limit);
  //     setPageCount(Math.ceil((count || 0) / limit));
  //     setDataTotal(count || 0);
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

      const filter = {
        ...cleanedFilters,
        statuses: ["in progress", "in review", "published"],
      };

      const { data, error } = await supabase.rpc("get_worksheets", {
        p_organization_id: state?.organization_id,
        p_page: page,
        p_limit: limit,
        p_filters: filter || {},
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
        created_at_modified: moment(item?.created_at).format(
          "MMM DD, YYYY hh:mm A"
        ),
      }));

      const totalCount = data?.[0]?.total_count || 0;
      setPageCount(Math.ceil((totalCount || 0) / limit));
      setDataTotal(totalCount || 0);
      setPageSize(limit);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error(error?.message);
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

  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  const handleClearFilters = () => {
    setFilters(primaryFilters);
    getData({ page: 1, limit: pageSize, filters: primaryFilters });
  };

  const handleFilter = () => {
    getData({ page: 1, limit: pageSize, filters: filters });
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "report card",
      },
    });

    getData({ page: currentPage, limit: pageSize, filters: filters });
  }, []);

  return (
    <div className="">
      {/* table */}
      <MkdListTable
        tableRole={role}
        table={"report"}
        actionId={"id"}
        columns={tableColumns}
        onSort={onSort}
        loading={loading}
        showDeleteModal={showDeleteModal}
        currentTableData={currentTableData}
        setShowDeleteModal={setShowDeleteModal}
        setCurrentTableData={setCurrentTableData}
        actions={{ edit: isWithEdit }}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={pageCount}
        totalRecords={dataTotal}
        limit={pageSize}
        onPageChange={handlePagination}
      />

      <ReportFilterDrawer
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

export default ReportWorksheetList;
