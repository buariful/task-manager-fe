import { PageWrapper } from "Components/PageWrapper";
import { SearchInput } from "Components/SearchInput";
import React from "react";
import { Menu } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaChevronDown } from "react-icons/fa6";
import { MkdListTable } from "Components/MkdListTable";
import { Pagination } from "Components/Pagination";
import { supabase } from "Src/supabase";
import moment from "moment";
import { useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import { ParentTopHeader } from "Components/TopHeader";
import { FullPageLoader } from "Components/FullPageLoader";
import { ReportCardView, ReportCardViewModal } from "Components/Report";

const columns = [
  {
    header: "Report Card ID",
    accessor: "id",
  },
  {
    header: "Level",
    accessor: "level_name",
  },
  {
    header: "Instructor Name",
    accessor: "instructor_name",
  },

  {
    header: "Season",
    accessor: "season_name",
  },
  {
    header: "Location",
    accessor: "location_name",
  },
  {
    header: "Start Date",
    accessor: "start_date",
  },
  {
    header: "Day(s) of the Week",
    accessor: "days_of_week",
  },

  {
    header: "Issued Date",
    accessor: "created_at_modified",
  },
  {
    header: "Action",
    accessor: "",
  },
];

const DropdownMenu = ({ handleSorting, selectedValue }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger Button */}
      <Menu.Button>
        <button className="text-sm bg-[#f5f5f5] px-4 py-2 rounded text-accent flex items-center gap-3">
          <span className="text-nowrap">Sort By</span>{" "}
          <FaChevronDown className="text-xs" />
        </button>
      </Menu.Button>

      {/* Dropdown Menu */}
      <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black text-accent ring-opacity-5 focus:outline-none z-10  p-3">
        <div className="py-1 space-y-2">
          <Menu.Item className="block">
            <button
              className={`${
                selectedValue === "id" ? "text-primary" : ""
              }  hover:text-primary`}
              onClick={() => handleSorting("id")}
            >
              Id
            </button>
          </Menu.Item>
          <Menu.Item className="block">
            <button
              className={`${
                selectedValue === "level_name" ? "text-primary" : ""
              }  hover:text-primary`}
              onClick={() => handleSorting("level_name")}
            >
              Level Name
            </button>
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

const schema = yup
  .object({
    searchText: yup.string(),
  })
  .required();

const primaryFilters = {
  levelName: "",
  sortBy: "id",
  participantId: null,
};

export default function ParentDashboard() {
  const { state } = useContext(AuthContext);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [participants, setParticipants] = React.useState([]);
  const [selectedParticipant, setSelectedParticipant] = React.useState({});
  const [filters, setFilters] = React.useState(primaryFilters);
  const [selectedReportId, setSelectedReportId] = React.useState(null);

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
        .from("v_worksheet_participant_full")
        .select("*", { count: "exact" })
        .eq("participant_id", filters?.participantId)
        .eq("organization_id", state?.organization_id)
        .lte("publish_date_time", new Date().toISOString());

      if (filters?.levelName) {
        query = query.ilike("level_name", `%${filters?.levelName || ""}%`);
      }

      query = query
        .range(from, to)
        .order(filters?.sortBy || "id", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const dataModified = data?.map((item) => ({
        ...item,
        instructor_name:
          item?.instructor_first_name + " " + item?.instructor_last_name,
        location_name: item?.location_name,
        season_name: item?.season_name,
        start_date: moment(item?.start_date_time).format("DD MMM YYYY"),
        created_at_modified: moment(item?.created_at).format(
          "MMM DD, YYYY hh:mm A"
        ),
      }));

      setPageSize(limit);
      setPageCount(Math.ceil((count || 0) / limit));
      setDataTotal(count || 0);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error(error?.message);
    }
    setLoading(false);
  };

  const handleSearch = (data) => {
    try {
      const filtersMod = { ...filters, levelName: data?.searchText || "" };
      setFilters(filtersMod);

      getData({ page: 1, limit: pageSize, filters: filtersMod });
    } catch (error) {}
  };
  const handleSorting = (value) => {
    try {
      const filtersMod = { ...filters, sortBy: value || "id" };
      setFilters(filtersMod);

      getData({ page: 1, limit: pageSize, filters: filtersMod });
    } catch (error) {}
  };
  const handleSelectParticipant = (value) => {
    try {
      const filtersMod = { ...filters, participantId: value };
      const participant = participants?.find((item) => item?.id === value);

      getData({ page: 1, limit: pageSize, filters: filtersMod });
      setFilters(filtersMod);
      setSelectedParticipant(participant);
    } catch (error) {}
  };

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("participant")
        .select(
          `
          *
        `
        ) // fetch count too
        .eq("status", "active")
        .eq("organization_id", state?.organization_id)
        .eq("parent_id", state?.user_profile_id);

      if (error) throw error;

      setParticipants(data);

      if (data?.length) {
        setFilters({ ...filters, participantId: data?.[0]?.id });
        setSelectedParticipant(data?.[0]);
        getData({
          page: 1,
          limit: pageSize,
          filters: { ...filters, participantId: data?.[0]?.id },
        });
      }
    } catch (error) {
      console.error("fetchData->>", error?.message);
    }
    setIsFetching(false);
  };

  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {isFetching ? (
        <FullPageLoader />
      ) : (
        <>
          <ParentTopHeader
            participants={participants}
            handleSelect={handleSelectParticipant}
            selectedValue={selectedParticipant}
          />

          <PageWrapper>
            {/*header */}
            <div className="flex items-center gap-5 justify-between mb-10">
              <h2 className="text-xl font-semibold text-accent">
                My Report Cards
              </h2>

              <div className="flex items-center gap-16">
                <form onSubmit={handleSubmit(handleSearch)}>
                  <SearchInput
                    errors={errors}
                    register={register}
                    name={"searchText"}
                    placeholder={"Search by Level Name"}
                  />
                </form>

                <DropdownMenu
                  handleSorting={handleSorting}
                  selectedValue={filters?.sortBy}
                />
              </div>
            </div>

            <div>
              {/* table */}
              <MkdListTable
                columns={columns}
                tableRole={"parent"}
                table={"report"}
                actionId={"id"}
                loading={loading}
                currentTableData={currentTableData}
                setCurrentTableData={setCurrentTableData}
                handleViewFunction={(id) => setSelectedReportId(id)}
                actions={{ view: true }}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={pageCount}
                totalRecords={dataTotal}
                limit={pageSize}
                onPageChange={handlePagination}
              />
            </div>

            <ReportCardViewModal
              handleClose={() => setSelectedReportId(null)}
              reportCardId={selectedReportId}
            />
          </PageWrapper>
        </>
      )}
    </div>
  );
}
