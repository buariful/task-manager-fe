import DateRangeSelector from "Components/DateRangeSelector/DateRangeSelector";
import { MultiSelectDropdown } from "Components/MultiSelectDropdown";
import React from "react";
import { useState } from "react";
import AnalyticsGenerateExportButtons from "./AnalyticsGenerateExportButtons";
import { useEffect } from "react";
import { FullPageLoader } from "Components/FullPageLoader";
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import Chart from "react-apexcharts";
import { Spinner } from "Assets/svgs";
import { generatePDF } from "Utils/utils";
import { useRef } from "react";

export default function LevelAnalytics() {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [levelPassFailStats, setLevelPassFailStats] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
  });

  const reportRef = useRef();

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const transformSeasonStats = (data) => {
    const categories = data.map((d) => d?.level_name);
    const passData = data.map((d) => d?.total_pass || 0);
    const failData = data.map((d) => d?.total_fail || 0);
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

  const handleGetReportData = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.rpc(
        "get_pass_fail_stats_by_level",
        {
          org_id: state?.organization_id,
          start_date: filters?.startDate,
          end_date: filters?.endDate,
          level_ids: selectedLevels?.map((item) => item?.value),
          location_ids: selectedLocation?.map((item) => item?.value),
          season_ids: selectedSeason?.map((item) => item?.value),
        }
      );

      // 🧩 Transform for graph
      if (data && Array.isArray(data)) {
        const graphData = transformSeasonStats(data);
        setLevelPassFailStats(graphData);
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setIsFetching(false);
  };

  const getData = async () => {
    setLoading(true);

    try {
      const organizationId = state?.organization_id;
      // Run all three queries in parallel
      const [levelResult, seasonResult, locationResult] = await Promise.all([
        supabase
          .from("level")
          .select("*")
          .eq("organization_id", organizationId),
        supabase
          .from("season")
          .select("*")
          .eq("organization_id", organizationId),
        supabase
          .from("location")
          .select("*")
          .eq("organization_id", organizationId),
      ]);

      if (levelResult.error) throw levelResult.error;
      if (seasonResult.error) throw seasonResult.error;
      if (locationResult.error) throw locationResult.error;

      setLevels(
        levelResult?.data?.map((item) => ({
          ...item,
          label: item?.name,
          value: item?.id,
        })) || []
      );
      setSeasons(
        seasonResult?.data?.map((item) => ({
          ...item,
          label: item?.name,
          value: item?.id,
        })) || []
      );
      setLocations(
        locationResult?.data?.map((item) => ({
          ...item,
          label: item?.name,
          value: item?.id,
        })) || []
      );
    } catch (err) {
      console.log(err?.message);
    }
    setLoading(false);
  };

  const handleExportPdf = async () => {
    try {
      await generatePDF({ ref: reportRef, reportName: "level_report.pdf" });
    } catch (error) {
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const allFilled =
      filters.startDate &&
      filters.endDate &&
      selectedSeason.length > 0 &&
      selectedLevels.length > 0 &&
      selectedLocation.length > 0;

    setIsReady(allFilled);
  }, [filters, selectedSeason, selectedLevels, selectedLocation]);

  return loading ? (
    <FullPageLoader />
  ) : (
    <div className="min-h-screen">
      <div className="grid grid-cols-3 mt-8 mb-10 gap-10">
        {/* first column */}
        <div>
          <div className="mb-5">
            <label className="mb-2 block cursor-pointer text-accent text-sm font-[400]">
              Select Date
            </label>
            <div className="flex items-center gap-1 ">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span>To</span>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <MultiSelectDropdown
            label="Select Seasons"
            options={seasons}
            selected={selectedSeason}
            onChange={setSelectedSeason}
            parentClassName={"mb-5"}
          />
        </div>

        {/* second column */}
        <div>
          <MultiSelectDropdown
            label="Select Levels"
            options={levels}
            selected={selectedLevels}
            onChange={setSelectedLevels}
            parentClassName={"mb-5"}
          />
          <MultiSelectDropdown
            label="Select Locations"
            options={locations}
            selected={selectedLocation}
            onChange={setSelectedLocation}
            parentClassName={"mb-5"}
            enableSelectAll={true}
          />
        </div>

        <div>
          <AnalyticsGenerateExportButtons
            handleGenerateFn={handleGetReportData}
            handleExportPdfFn={handleExportPdf}
            showExportButton={levelPassFailStats}
            disabledGenerateButton={!isReady}
          />
        </div>
      </div>

      {/* Chart */}
      {isFetching ? (
        <div className="grid place-content-center">
          <Spinner size={50} />
        </div>
      ) : levelPassFailStats ? (
        <div ref={reportRef}>
          <Chart
            options={levelPassFailStats?.options || []}
            series={levelPassFailStats?.series || []}
            type="bar"
            height={320}
          />
        </div>
      ) : null}
    </div>
  );
}
