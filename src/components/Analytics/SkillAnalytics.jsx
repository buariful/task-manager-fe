import { MultiSelectDropdown } from "Components/MultiSelectDropdown";
import React, { useState, useEffect, useContext, useRef } from "react";
import AnalyticsGenerateExportButtons from "./AnalyticsGenerateExportButtons";
import { FullPageLoader } from "Components/FullPageLoader";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import Chart from "react-apexcharts";
import { Spinner } from "Assets/svgs";
import { generatePDF } from "Utils/utils";

export default function SkillAnalytics() {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [skillPassFailStats, setSkillPassFailStats] = useState(null);
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

  const transformSkillStats = (data) => {
    const categories = data.map((d) => d?.skill_name);
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
        "get_pass_fail_stats_by_skill",
        {
          org_id: state?.organization_id,
          start_date: filters?.startDate,
          end_date: filters?.endDate,
          skill_ids: selectedSkills?.map((item) => item?.value),
          location_ids: selectedLocation?.map((item) => item?.value),
          season_ids: selectedSeason?.map((item) => item?.value),
        }
      );

      if (error) throw error;

      if (data && Array.isArray(data)) {
        const graphData = transformSkillStats(data);
        setSkillPassFailStats(graphData);
      }
    } catch (error) {
      console.error(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    } finally {
      setIsFetching(false);
    }
  };

  const getData = async () => {
    setLoading(true);
    try {
      const organizationId = state?.organization_id;

      const [skillResult, seasonResult, locationResult] = await Promise.all([
        supabase
          .from("skill")
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

      if (skillResult.error) throw skillResult.error;
      if (seasonResult.error) throw seasonResult.error;
      if (locationResult.error) throw locationResult.error;

      setSkills(
        skillResult?.data?.map((item) => ({
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
      console.error(err?.message);
      showToast(globalDispatch, err?.message, 4000, "error");
    }
    setLoading(false);
  };

  const handleExportPdf = async () => {
    try {
      await generatePDF({
        ref: reportRef,
        reportName: "Skill Report.pdf",
      });
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
      selectedSkills.length > 0 &&
      selectedLocation.length > 0;

    setIsReady(allFilled);
  }, [filters, selectedSeason, selectedSkills, selectedLocation]);

  return loading ? (
    <FullPageLoader />
  ) : (
    <div className="min-h-screen">
      <div className="grid grid-cols-3 mt-8 mb-10 gap-10">
        {/* First Column */}
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

        {/* Second Column */}
        <div>
          <MultiSelectDropdown
            label="Select Skills"
            options={skills}
            selected={selectedSkills}
            onChange={setSelectedSkills}
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

        {/* Third Column (Buttons) */}
        <div>
          <AnalyticsGenerateExportButtons
            handleGenerateFn={handleGetReportData}
            handleExportPdfFn={handleExportPdf}
            showExportButton={skillPassFailStats}
            disabledGenerateButton={!isReady}
          />
        </div>
      </div>

      {/* Chart Section */}
      {isFetching ? (
        <div className="grid place-content-center">
          <Spinner size={50} />
        </div>
      ) : skillPassFailStats ? (
        <div ref={reportRef}>
          <Chart
            options={skillPassFailStats?.options || []}
            series={skillPassFailStats?.series || []}
            type="bar"
            height={320}
          />
        </div>
      ) : null}
    </div>
  );
}
