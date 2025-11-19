import { LicnseListTable } from "Components/LicenseListTable";
import { MkdListTable } from "Components/MkdListTable";
import { SuperAdminNavBar } from "Components/NavBar";
import { PageWrapper } from "Components/PageWrapper";
import { SuperAdminReportStats } from "Components/SuperAdminReportStats";
import { GlobalContext } from "Context/Global";
import React from "react";
import { supabase } from "Src/supabase";

const columns = [
  {
    header: "Organization Name",
    accessor: "organization_name",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },

  {
    header: "Organization Address",
    accessor: "organization_address",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "No of License",
    accessor: "no_of_license",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Joined Date",
    accessor: "joined_date",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    showDot: true,
    mappings: {},
  },

  {
    header: "Expiry Date",
    accessor: "expire_at",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
  {
    header: "Status",
    accessor: "status",
    isSorted: false,
    isSortedDesc: false,
    mappingExist: false,
    mappings: {},
  },
];

const data = [
  {
    organization_name: "TechNova Solutions",
    organization_address: "123 Innovation Road, San Francisco, CA",
    no_of_license: 25,
    joined_date: "2023-05-14",
    expire_at: "2026-05-13",
    status: "Active",
  },
  {
    organization_name: "GreenLeaf Systems",
    organization_address: "42 Maple Street, Seattle, WA",
    no_of_license: 12,
    joined_date: "2022-08-10",
    expire_at: "2025-08-09",
    status: "Inactive",
  },
  {
    organization_name: "Apex Analytics",
    organization_address: "89 Market Avenue, Chicago, IL",
    no_of_license: 40,
    joined_date: "2021-11-01",
    expire_at: "2024-11-01",
    status: "Active",
  },
  {
    organization_name: "SkyBridge Networks",
    organization_address: "77 Cloud Blvd, Austin, TX",
    no_of_license: 18,
    joined_date: "2023-02-22",
    expire_at: "2026-02-21",
    status: "Pending",
  },
  {
    organization_name: "NextGen HealthTech",
    organization_address: "15 Horizon Street, Boston, MA",
    no_of_license: 30,
    joined_date: "2020-09-12",
    expire_at: "2025-09-12",
    status: "Suspended",
  },
];

const defaultStats = {
  users: {
    active: 0,
    inactive: 0,
  },
  license: {
    active: 0,
    inactive: 0,
  },
  worksheets: 0,
  report_cards: 0,
};

const daysOptions = [
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
  { label: "90 Days", value: 90 },
  { label: "120 Days", value: 120 },
];

export default function SuperAdminDashboard() {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedDaysAhead, setSelectedDaysAhead] = React.useState(30);

  const getData = async (page = 1, limit = 10, daysAhead = 120) => {
    try {
      setLoading(true);

      const offset = (page - 1) * limit;

      const { data, error } = await supabase.rpc("get_licenses_expiring", {
        days_ahead: daysAhead,
        limit_count: limit,
        offset_count: offset,
      });

      if (error) throw error;

      // compute pagination info
      const totalRecords = data?.[0]?.total_records || 0;
      const totalPages = Math.ceil(totalRecords / limit);

      // update states
      setCurrentPage(page);
      setTotalRecords(totalRecords);
      setPageSize(limit);
      setPageCount(totalPages);
      setCurrentTableData(data || []);
    } catch (error) {
      console.error("Error fetching expiring licenses:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDaysFilter = (daysAhead) => {
    getData(1, 10, daysAhead);
    setSelectedDaysAhead(daysAhead);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "dashboard",
      },
    });

    getData();
  }, []);

  return (
    <PageWrapper>
      <SuperAdminNavBar />

      {/* stats */}
      <SuperAdminReportStats />

      {/* Table */}
      <div className="flex items-center gap-5 justify-between mb-5">
        <p className="text-accent text-sm font-semibold">
          Licenses up for Renewal
        </p>
        <div className="">
          <select
            value={selectedDaysAhead}
            onChange={(e) => handleDaysFilter(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent min-w-36 cursor-pointer"
          >
            {daysOptions.map((d) => (
              <option key={d.value} value={d.value} className="cursor-pointer">
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <LicnseListTable data={currentTableData} isLoading={loading} />
    </PageWrapper>
  );
}
