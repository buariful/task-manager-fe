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
import { forwardRef } from "react";
import { useImperativeHandle } from "react";

const columns = [
  {
    header: "",
    accessor: "id",
    select: true,
  },
  {
    header: "Report Card No",
    accessor: "id",
    sortingKey: "id",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "Participant Reg No",
    accessor: "participant_unique_id",
    sortingKey: "participant_unique_id",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "First Name",
    accessor: "first_name",
    sortingKey: "participant_first_name",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Last Name",
    accessor: "last_name",
    sortingKey: "participant_last_name",
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
    header: "Created Date",
    accessor: "created_at_modified",
    sortingKey: "created_at",
    isSorted: true,
    isSortedDesc: false,
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

const PublishedReportCardList = React.forwardRef(
  (
    {
      filters,
      setFilters,
      isFilterDrawerOpen,
      setIsFilterDrawerOpen,
      role = "user",
      selectedCards = [],
      setSelectedCards = () => {},
    },
    ref
  ) => {
    const { state } = useContext(AuthContext);

    const [pageSize, setPageSize] = React.useState(10);
    const [pageCount, setPageCount] = React.useState(0);
    const [dataTotal, setDataTotal] = React.useState(0);
    const [currentPage, setPage] = React.useState(1);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [tableColumns, setTableColumns] = React.useState(columns);
    const [currentTableData, setCurrentTableData] = React.useState([]);
    // const [selectedCards, setSelectedCards] = React.useState([]);

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
    //           id`
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

    //     // query = query.range(from, to).order("id", { ascending: false });

    //     const { data: worksheets } = await query;

    //     const worksheetIds = worksheets.map((w) => w.id);

    //     // 2️⃣ Fetch participants belonging to these worksheets
    //     const {
    //       data: reportCards,
    //       count,
    //       error,
    //     } = await supabase
    //       .from("worksheet_participant_map")
    //       .select(
    //         `
    //         id,
    //         status,
    //         created_at,
    //         updated_at,
    //         participant:participant(id, first_name, last_name, unique_id),
    //         worksheet: worksheet_id(
    //                                 id, name,
    //                                 level: level_id(id, name),
    //                                 season: season_id(id, name),
    //                                 instructor: instructor_id(id, first_name, last_name)
    //                                 )
    //         `
    //       )
    //       .eq("status", "published")
    //       .in("worksheet_id", worksheetIds)
    //       .order("created_at", { ascending: false })
    //       .range(from, to)
    //       .order("id", { ascending: false });

    //     if (error) throw error;

    //     const dataModified = reportCards?.map((item) => ({
    //       ...item,
    //       instructor_name:
    //         item?.worksheet?.instructor?.first_name +
    //         " " +
    //         item?.worksheet?.instructor?.last_name,
    //       first_name: item?.participant?.first_name,
    //       last_name: item?.participant?.last_name,
    //       participant_unique_id: item?.participant?.unique_id,
    //       level_name: item?.worksheet?.level?.name,
    //       location_name: item?.worksheet?.location?.name,
    //       season_name: item?.worksheet?.season?.name,
    //       created_at_modified: moment(item?.created_at).format("MMM DD, YYYY"),
    //     }));
    //     console.log(dataModified);
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
        const { data, error } = await supabase.rpc(
          "get_report_cards_with_filtering_sorting",
          {
            p_organization_id: state?.organization_id,
            p_page: page,
            p_limit: limit,
            p_filters: filters || {},
            p_sort_by: filters?.sortBy || "id",
            p_is_order_desc: filters?.isOrderDesc,
          }
        );

        if (error) throw error;

        const totalCount = data?.[0]?.total_count || 0;

        const dataModified = data?.map((item) => ({
          ...item,
          instructor_name: item?.instructor_name || "",
          first_name: item?.participant_first_name || "",
          last_name: item?.participant_last_name || "",
          created_at_modified: moment(item?.created_at).format("MMM DD, YYYY"),
        }));

        setPageSize(limit);
        setPageCount(Math.ceil(totalCount / limit));
        setDataTotal(totalCount);
        setPage(page);
        setCurrentTableData(dataModified);
      } catch (error) {
        console.error(error.message);
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

    const refetch = () => {
      getData({ page: 1, limit: pageSize, filters: filters });
    };

    useImperativeHandle(ref, () => ({
      refetchPublishedReports: refetch,
    }));

    React.useEffect(() => {
      globalDispatch({
        type: "SETPATH",
        payload: {
          path: "report",
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
          currentTableData={currentTableData}
          setCurrentTableData={setCurrentTableData}
          actions={{ select: true }}
          selectedItems={selectedCards}
          setSelectedItems={setSelectedCards}
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
  }
);

export default PublishedReportCardList;
