import { Spinner } from "Assets/svgs";
import { FullPageLoader } from "Components/FullPageLoader";
import { AdministratorNavBar } from "Components/NavBar";
import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";
import React from "react";
import { useState } from "react";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import { supabase } from "Src/supabase";

export default function Dashboard() {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { state } = React.useContext(AuthContext);

  const [levelCount, setLevelCount] = useState(0);
  const [worksheetStats, setWorksheetStats] = useState(null);
  const [reportCardStats, setReportCardStats] = useState(null);
  const [reportOpenedStats, setReportOpenedStats] = useState(null);
  const [participantStats, setParticipantStats] = useState(null);
  const [participantCount, setParticipantCount] = useState({});
  const [levelPassFailStats, setLevelPassFailStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [seasonDataLoading, setSeasonDataLoading] = useState(false);

  const getSeasonData = async (year) => {
    setSeasonDataLoading(true);
    try {
      const { data: seasonStats } = await supabase.rpc(
        "get_pass_fail_stats_by_season_year",
        { org_id: state?.organization_id, year_param: year }
      );

      // 🧩 Transform for graph
      if (seasonStats && Array.isArray(seasonStats)) {
        const graphData = transformSeasonStats(seasonStats);
        setLevelPassFailStats(graphData);
      }
    } catch (error) {
      console.log(error?.message);
    }
    setSeasonDataLoading(false);
  };

  const getData = async () => {
    setIsLoading(true);
    try {
      const orgId = state?.organization_id;

      const [
        { data: level, count: levleCount },
        { data: worksheetStats },
        { data: reportCardStats },
        { data: reportOpenedStats },
        { data: participantStats },
      ] = await Promise.all([
        supabase
          .from("level")
          .select("id,name", { count: "exact" })
          .eq("organization_id", orgId),
        // .single(),
        supabase.rpc("get_worksheet_stats", { org_id: orgId }),
        supabase.rpc("get_participant_report_stats", {
          org_id: orgId,
          start_date: null,
          end_date: null,
        }),
        supabase.rpc("get_opened_report_percentage", {
          org_id: orgId,
          start_date: null,
          end_date: null,
        }),
        supabase.rpc("get_participant_stats_with_locations", { org_id: orgId }),
        getSeasonData(new Date().getFullYear()),
      ]);

      setLevelCount(levleCount || 0);
      setWorksheetStats(worksheetStats?.[0] || {});
      setReportCardStats(reportCardStats || {});
      setReportOpenedStats(reportOpenedStats || {});
      setParticipantCount(participantStats?.overall || {});

      if (
        participantStats?.by_location &&
        Array.isArray(participantStats?.by_location)
      ) {
        const chartData = transformParticipantStats(
          participantStats?.by_location
        );
        setParticipantStats(chartData);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error.message);
    }
    setIsLoading(false);
  };

  const getRandomColor = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
  const predefinedColors = [
    "#67C090",
    "#56b381",
    "#26667F",
    "#DDF4E7",
    "#21272A",
    "#222222",
    "#545F71",
    "#9ca3af",
    "#F2F4F8",
  ];

  const transformParticipantStats = (data) => {
    const series = [];
    const labels = [];
    const colors = [];

    try {
      data?.forEach((item, index) => {
        series.push(
          item?.active_participants + item?.inactive_participants || 0
        );
        labels.push(item?.location_name || "Unknown");

        // Use predefined colors first, then random
        if (index < predefinedColors.length) {
          colors.push(predefinedColors[index]);
        } else {
          colors.push(getRandomColor());
        }
      });
    } catch (error) {
      console.error(error);
    }

    return {
      series,
      options: {
        labels,
        chart: { type: "donut" },
        dataLabels: { enabled: false },
        legend: { position: "right" },
        colors,
      },
    };
  };

  //  Convert season stats → ApexCharts format
  const transformSeasonStats = (data) => {
    const categories = data.map((d) => d.season_name);
    const passData = data.map((d) => d.total_pass || 0);
    const failData = data.map((d) => d.total_fail || 0);

    return {
      series: [
        { name: "Pass", data: passData },
        { name: "Fail", data: failData },
      ],
      options: {
        chart: { type: "bar" },
        plotOptions: { bar: { columnWidth: "40%", borderRadius: 4 } },
        xaxis: { categories },
        yaxis: { labels: { formatter: (val) => val.toLocaleString() } },
        legend: { position: "top" },
        fill: { opacity: 1 },
        colors: ["#1E40AF", "#CBD5E1"],
      },
    };
  };
  const years = Array.from(
    { length: new Date().getFullYear() - 2000 + 1 },
    (_, i) => 2000 + i
  );

  const handleYearChange = (e) => {
    try {
      const value = e.target?.value;

      setSelectedYear(value);
      getSeasonData(value);
    } catch (error) {}
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
    <div>
      <AdministratorNavBar />
      {isLoading ? (
        <FullPageLoader />
      ) : (
        <div className="p-6 space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Level */}
            <Link
              to={"/administrator/level"}
              className="bg-white shadow rounded-lg p-4 border border-gray-100"
            >
              <h3 className="text-gray-500 text-sm">Level</h3>
              <p className="text-2xl font-semibold">{levelCount}</p>
            </Link>
            {/* Worksheet */}
            <Link
              to={"/administrator/worksheet"}
              className="bg-white shadow rounded-lg p-4 border border-gray-100"
            >
              <h3 className="text-gray-500 text-sm">Worksheet Generated</h3>
              <div className="flex items-end gap-5 justify-between text-center">
                <div className="flex flex-col items-end">
                  <p className="text-2xl font-semibold">
                    {worksheetStats?.total}
                  </p>
                  <span className="text-[10px]">TOTAL</span>
                </div>
                <div className="mt-2 text-gray-500 flex items-center gap-4">
                  <div>
                    <p className="text-lg">{worksheetStats?.active}</p>
                    <p className="text-[10px] font-medium">ACTIVE</p>
                  </div>
                </div>
                <div className="mt-2 text-gray-500 flex items-center gap-4">
                  <div>
                    <p className="text-lg">{worksheetStats?.in_progress}</p>
                    <p className="text-[10px] font-medium">COMPLETED</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Report card */}
            <Link
              to={"/administrator/report"}
              className="bg-white text-nowrap flex-1 shadow rounded-lg p-4 border border-gray-100"
            >
              <h3 className="text-gray-500 text-sm">Report Card Generated</h3>
              <div className="flex items-end gap-5 justify-between">
                <div className="flex flex-col items-end">
                  <p className="text-2xl font-semibold">
                    {reportCardStats?.total}
                  </p>
                  <span className="text-[10px]">TOTAL</span>
                </div>
                <div className="mt-2 text-gray-500 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg">{reportCardStats?.in_progress}</p>
                    <p className="text-[10px] font-medium">IN PROGRESS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg">{reportCardStats?.in_review}</p>
                    <p className="text-[10px] font-medium">IN REVIEW</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg">{reportCardStats?.published}</p>
                    <p className="text-[10px] font-medium">PUBLISHED</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Open Rates */}
            <Link
              to={"/administrator/report"}
              className="bg-white shadow rounded-lg p-4 border border-gray-100"
            >
              <h3 className="text-gray-500 text-sm">Report Card Open Rates</h3>
              <p className="text-2xl font-semibold">
                {reportOpenedStats?.opened_percentage}%
              </p>
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Participants Donut */}
            <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
              <h3 className="text-gray-600 font-medium mb-4">Participants</h3>

              {participantStats ? (
                <Chart
                  options={participantStats?.options || {}}
                  series={participantStats?.series || []}
                  type="donut"
                  height={320}
                />
              ) : null}
              <div className="flex justify-between mt-4 text-sm text-gray-500">
                <p>Total: {participantCount?.total_participants}</p>
                <p>Active: {participantCount?.active_participants}</p>
                <p>Inactive: {participantCount?.inactive_participants}</p>
              </div>
            </div>

            {/* Level Completion Bar Chart */}
            <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 font-medium">Level Completion</h3>
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="bg-transparent text-sm text-slate-700 focus:outline-none focus:ring-0 appearance-none cursor-pointer !border-none"
                >
                  {years.map((year) => (
                    <option key={year} value={year} className="text-slate-700">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {seasonDataLoading ? (
                <div className="grid place-content-center">
                  <Spinner size={100} />
                </div>
              ) : levelPassFailStats ? (
                <Chart
                  options={levelPassFailStats?.options || []}
                  series={levelPassFailStats?.series || []}
                  type="bar"
                  height={320}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
