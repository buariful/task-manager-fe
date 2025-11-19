// import React from "react";
// import AnalyticsGenerateExportButtons from "./AnalyticsGenerateExportButtons";
// import { useState } from "react";
// import Chart from "react-apexcharts";
// import { supabase } from "Src/supabase";
// import {
//   transformParticipantStats,
//   transformReportCardStats,
// } from "Utils/utils";
// import { AuthContext } from "Context/Auth";
// import { Spinner } from "Assets/svgs";

// export default function ReportAnalytics() {
//   const { state } = React.useContext(AuthContext);

//   const [chartStats, setChartStats] = useState(null);
//   const [reportOpenedStats, setReportOpenedStats] = useState(null);
//   const [reportCardStats, setReportCardStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     startDate: null,
//     endDate: null,
//   });
//   console.log("reportOpenedStats", reportOpenedStats);
//   const handleChange = (e) => {
//     setFilters((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const getData = async () => {
//     setIsLoading(true);
//     try {
//       const orgId = state?.organization_id;

//       const [{ data: stats }, { data: reportOpenedStats }] = await Promise.all([
//         supabase.rpc("get_participant_report_stats", {
//           org_id: orgId,
//           start_date: filters?.startDate,
//           end_date: filters?.endDate,
//         }),
//         supabase.rpc("get_opened_report_percentage", {
//           org_id: orgId,
//           start_date: filters?.startDate,
//           end_date: filters?.endDate,
//         }),
//       ]);

//       const chartData = transformReportCardStats(stats);
//       setChartStats(chartData);
//       setReportCardStats(stats);
//       setReportOpenedStats(reportOpenedStats || {});
//     } catch (error) {
//       console.log("getData->>", error?.message);
//     }
//     setIsLoading(false);
//   };

//   return (
//     <div>
//       {/* Filter */}
//       <div className="flex items-center mb-10 gap-5 justify-between">
//         <div className="flex items-center gap-1">
//           <input
//             type="date"
//             name="startDate"
//             value={filters.startDate}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent "
//           />
//           <span>To</span>
//           <input
//             type="date"
//             name="endDate"
//             value={filters.endDate}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent"
//           />
//         </div>

//         <AnalyticsGenerateExportButtons handleGenerate={getData} />
//       </div>

//       <div>
//         {isLoading ? (
//           <div className="place-content-center grid">
//             <Spinner size={50} />
//           </div>
//         ) : chartStats ? (
//           <div className="grid grid-cols-12 text-accent">
//             <div className="col-span-6 space-y-10">
//               <p className="text-gray-500 text-sm ">Report Card Generated</p>
//               <div className=" space-y-10">
//                 <div className="">
//                   <h3 className="text-6xl font-medium">
//                     {reportCardStats?.total}
//                   </h3>
//                   <span className="text-sm text-neutral-gray">TOTAL</span>
//                 </div>

//                 <div className="mt-2 text-neutral-gray flex items-center gap-8 justify-between">
//                   <div className="text-center">
//                     <p className="text-2xl">{reportCardStats?.in_progress}</p>
//                     <p className="text-sm font-normal">IN PROGRESS</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-2xl">{reportCardStats?.in_review}</p>
//                     <p className="text-sm font-normal">IN REVIEW</p>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-2xl">{reportCardStats?.published}</p>
//                     <p className="text-sm font-normal">PUBLISHED</p>
//                   </div>
//                 </div>

//                 <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
//                   <p className="text-gray-500 text-sm mb-4">
//                     Report Card Open Rates
//                   </p>
//                   <p className="text-3xl font-semibold">
//                     {" "}
//                     {reportOpenedStats?.opened_percentage || 0}%
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-span-6">
//               <Chart
//                 options={chartStats?.options || {}}
//                 series={chartStats?.series || []}
//                 type="donut"
//                 height={320}
//               />
//             </div>
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }

import React, { useRef, useState, useContext } from "react";
import AnalyticsGenerateExportButtons from "./AnalyticsGenerateExportButtons";
import Chart from "react-apexcharts";
import { supabase } from "Src/supabase";
import {
  transformParticipantStats,
  transformReportCardStats,
} from "Utils/utils";
import { AuthContext } from "Context/Auth";
import { Spinner } from "Assets/svgs";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { GlobalContext, showToast } from "Context/Global";

export default function ReportAnalytics() {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const reportRef = useRef();

  const [chartStats, setChartStats] = useState(null);
  const [reportOpenedStats, setReportOpenedStats] = useState(null);
  const [reportCardStats, setReportCardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
  });

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getData = async () => {
    setIsLoading(true);
    try {
      const orgId = state?.organization_id;

      const [{ data: stats }, { data: reportOpenedStats }] = await Promise.all([
        supabase.rpc("get_participant_report_stats", {
          org_id: orgId,
          start_date: filters?.startDate,
          end_date: filters?.endDate,
        }),
        supabase.rpc("get_opened_report_percentage", {
          org_id: orgId,
          start_date: filters?.startDate,
          end_date: filters?.endDate,
        }),
      ]);

      const chartData = transformReportCardStats(stats);
      setChartStats(chartData);
      setReportCardStats(stats);
      setReportOpenedStats(reportOpenedStats || {});
    } catch (error) {
      console.log("getData->>", error?.message);
    }
    setIsLoading(false);
  };

  const generatePDF = async () => {
    try {
      if (!reportRef.current) return;

      const input = reportRef.current;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;

      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save("report-card.pdf");
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center mb-10 gap-5 justify-between">
        <div className="flex items-center gap-1">
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

        <div className="flex gap-2">
          <AnalyticsGenerateExportButtons
            handleGenerateFn={getData}
            handleExportPdfFn={generatePDF}
            showExportButton={chartStats}
            disabledGenerateButton={
              filters?.startDate && filters?.endDate ? false : true
            }
          />
        </div>
      </div>

      <div ref={reportRef}>
        {isLoading ? (
          <div className="place-content-center grid">
            <Spinner size={50} />
          </div>
        ) : chartStats ? (
          <div className="grid grid-cols-12 text-accent">
            <div className="col-span-6 space-y-10">
              <p className="text-gray-500 text-sm">Report Card Generated</p>
              <div className="space-y-10">
                <div>
                  <h3 className="text-6xl font-medium">
                    {reportCardStats?.total}
                  </h3>
                  <span className="text-sm text-neutral-gray">TOTAL</span>
                </div>

                <div className="mt-2 text-neutral-gray flex items-center gap-8 justify-between">
                  <div className="text-center">
                    <p className="text-2xl">{reportCardStats?.in_progress}</p>
                    <p className="text-sm font-normal">IN PROGRESS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl">{reportCardStats?.in_review}</p>
                    <p className="text-sm font-normal">IN REVIEW</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl">{reportCardStats?.published}</p>
                    <p className="text-sm font-normal">PUBLISHED</p>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-500 text-sm mb-4">
                    Report Card Open Rates
                  </p>
                  <p className="text-3xl font-semibold">
                    {reportOpenedStats?.opened_percentage || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-6">
              <Chart
                options={chartStats?.options || {}}
                series={chartStats?.series || []}
                type="donut"
                height={320}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
