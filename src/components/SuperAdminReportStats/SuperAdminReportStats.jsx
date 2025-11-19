import { Spinner } from "Assets/svgs";
import { GlobalContext } from "Context/Global";
import React from "react";
import { supabase } from "Src/supabase";

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

export default function SuperAdminReportStats() {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [stats, setStats] = React.useState(defaultStats);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(null);

  const currentYear = new Date().getFullYear();
  const startYear = 2020; // you can adjust this
  const years = [];

  for (let y = currentYear; y >= startYear; y--) {
    let label;
    if (y === currentYear) label = "Current Year";
    else if (y === currentYear - 1) label = "Last Year";
    else label = y.toString();

    years.push({ label, value: y });
  }

  const getStats = async (year) => {
    setStatsLoading(true);

    try {
      const targetYear = year || new Date().getFullYear();
      const startOfYear = `${targetYear}-01-01`;
      const endOfYear = `${targetYear}-12-31`;

      // Run all requests in parallel
      const [
        { data: userStats, error: userError },
        { data: licenseStats, error: licenseError },
        { count: worksheetCount, error: worksheetError },
        { count: reportCount, error: reportError },
      ] = await Promise.all([
        supabase.rpc("get_user_status_counts", { year: targetYear }),
        supabase.rpc("get_license_status_counts", { year: targetYear }),
        supabase
          .from("worksheet")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfYear)
          .lte("created_at", endOfYear),
        supabase
          .from("worksheet_participant_map")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfYear)
          .lte("created_at", endOfYear),
      ]);

      // Check for errors
      if (userError) throw userError;
      if (licenseError) throw licenseError;
      if (worksheetError) throw worksheetError;
      if (reportError) throw reportError;

      // Update state
      setStats({
        users: {
          active: userStats?.active_count || 0,
          inactive: userStats?.inactive_count || 0,
        },
        license: {
          active: licenseStats?.active_count || 0,
          inactive: licenseStats?.inactive_count || 0,
        },
        worksheets: worksheetCount || 0,
        report_cards: reportCount || 0,
      });
    } catch (err) {
      console.log("❌ Error fetching stats:", err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleYearFilter = async (year) => {
    setSelectedYear(year);
    getStats(year);
  };

  React.useEffect(() => {
    getStats();
  }, []);

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        <Spinner size={50} />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-2">
          <select
            value={selectedYear}
            onChange={(e) => handleYearFilter(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent min-w-36 cursor-pointer"
          >
            {years.map((y) => (
              <option key={y.value} value={y.value} className="cursor-pointer">
                {y.label}
              </option>
            ))}
          </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-10">
        {/* Users */}
        <div className="bg-white flex flex-col justify-between shadow rounded-lg p-4 border border-gray-100">
          <h3 className="text-gray-500 text-xl font-normal">Users</h3>
          <div className="flex items-end gap-5 justify-between text-center">
            <div className="mt-2 text-gray-500 flex items-center gap-4">
              <div>
                <p className="text-4xl font-medium text-accent">
                  {stats?.users?.active}
                </p>
                <p className="text-xs font-normal">ACTIVE</p>
              </div>
            </div>
            <div className="mt-2 text-gray-500 flex items-center gap-4">
              <div>
                <p className="text-4xl font-medium text-accent">
                  {stats?.users?.inactive}
                </p>
                <p className="text-xs font-normal">INACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* License */}
        <div className="bg-white shadow rounded-lg p-4 border border-gray-100  flex flex-col justify-between">
          <h3 className="text-gray-500 text-xl font-normal">License</h3>
          <div className="flex items-end gap-5 justify-between text-center">
            <div className="mt-2 text-gray-500 flex items-center gap-4">
              <div>
                <p className="text-4xl font-medium text-accent">
                  {stats?.license?.active}
                </p>
                <p className="text-xs font-normal">ACTIVE</p>
              </div>
            </div>
            <div className="mt-2 text-gray-500 flex items-center gap-4">
              <div>
                <p className="text-4xl font-medium text-accent">
                  {stats?.license?.inactive}
                </p>
                <p className="text-xs font-normal">INACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Cards */}
        <div className="bg-white text-nowrap flex-1  flex flex-col justify-between shadow rounded-lg p-4 border border-gray-100">
          <h3 className="text-gray-500 text-xl font-normal">
            Total Report Cards
          </h3>
          <div className="flex items-end gap-5 justify-between">
            <div className="">
              <p className="text-4xl font-medium text-accent">
                {stats?.report_cards}
              </p>
              <p> </p>
            </div>
          </div>
        </div>

        {/* Worksheets */}
        <div className="bg-white shadow rounded-lg p-4  flex flex-col justify-between border border-gray-100">
          <h3 className="text-gray-500 text-xl font-normal">
            Total Worksheets
          </h3>
          <div>
            <p className="text-4xl font-medium text-accent">
              {stats?.worksheets}
            </p>
            <p> </p>
          </div>
        </div>
      </div>
    </>
  );
}
