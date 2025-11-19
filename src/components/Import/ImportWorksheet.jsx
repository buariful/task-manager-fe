import { InteractiveButton } from "Components/InteractiveButton";
import { Modal } from "Components/Modal";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useRef } from "react";
import { parseCsvData, parseExcelData } from "Utils/utils";
import ImportModal from "./ImportModal";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useEffect } from "react";

const sampleData = [
  {
    name: "Worksheet 1",
    level_id: 21,
    recommended_level_id: 5,
    location_id: 5,
    season_id: 4,
    instructor_id: 14,
    days_of_week: "sunday, monday, tuesday",
    start_date: "2025-09-20",
    start_time: "14:30",
    course_code: "a1d2e",
    participant_ids: "10, 11",
  },
];

export default function ImportWorksheet({
  refetchFn,
  setFailedWorksheetsCodes,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);

  const [worksheetFile, setWorksheetFile] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [fileData, setFileData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportTemplate, setReportTemplate] = useState({});
  const [orgLabels, setOrgLabels] = useState({});

  const [allInstructors, setAllInstructors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [levelSkills, setLevelSkills] = useState([]);

  const fileRef = useRef();

  function excelDateToISOString(excelDate, excelTime) {
    // Excel's date system starts on 1900-01-01
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));

    // Combine date and time
    const totalDays = Number(excelDate) + Number(excelTime);
    const dateTime = new Date(
      excelEpoch.getTime() + totalDays * 24 * 60 * 60 * 1000
    );

    // Convert to ISO format (e.g., "2025-09-15T14:30:00Z")
    return dateTime.toISOString();
  }

  const handleFileChange = async (e) => {
    setIsParsingFile(true);
    setFailedWorksheetsCodes([]);
    try {
      setErrorMessage("");
      const file = e.target.files?.[0];
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!file) {
        setWorksheetFile(null);
        setIsParsingFile(false);
        return;
      }
      // ✅ Check file type
      if (!allowedTypes.includes(file.type)) {
        showToast(
          globalDispatch,
          "Please upload a valid CSV or Excel file!",
          4000,
          "error"
        );
        e.target.value = ""; // clear input
        setIsParsingFile(false);
        return;
      }
      setWorksheetFile(file);

      let parsedData = [];
      if (file.type === "text/csv") {
        parsedData = await parseCsvData(file);
      } else {
        parsedData = await parseExcelData(file);
      }

      // ✅ Validate parsed data against required fields
      const requiredFields = Object.keys(sampleData[0] || {});
      const missingFields = [];

      const firstRow = parsedData[0];
      if (firstRow) {
        requiredFields.forEach((field) => {
          if (!Object.prototype.hasOwnProperty.call(firstRow, field)) {
            missingFields.push(field);
          }
        });
      }

      if (missingFields.length > 0) {
        setErrorMessage(
          `The uploaded file is missing required fields: ${missingFields.join(
            ", "
          )}`
        );
        setWorksheetFile([]);
        e.target.value = "";
        setIsParsingFile(false);
        return;
      }

      console.log("parsed data", parsedData);
      setFileData(parsedData);

      // fetching data
      const locationIds = [];
      const seasonIds = [];
      const instructorIds = [];
      const levelSkillIds = [];

      fileData?.forEach((item) => {
        locationIds.push(item?.location_id);
        seasonIds.push(item?.season_id);
        instructorIds.push(item?.instructor_id);
        levelSkillIds.push(item?.level_id);
      });

      const [
        { data: locations },
        { data: seasons },
        { data: instructors },
        { data: levelSkills },
      ] = await Promise.all([
        supabase.from("location").select("*").in("id", locationIds),
        supabase.from("season").select("*").in("id", seasonIds),
        supabase.from("user_profile").select("*").in("id", instructorIds),
        supabase
          .from("level")
          .select(
            `
            id,
            level_skill_map(
              *,
              skill (
                id, name, type, description
              )
            )
          `
          )
          .in("id", levelSkillIds),
      ]);

      const locationsMod = {};
      const seasonsMod = {};
      const instructorsMod = {};
      const levelSkillMod = {};

      locations?.forEach((item) => {
        locationsMod[item.id] = item;
      });
      seasons?.forEach((item) => {
        seasonsMod[item.id] = item;
      });
      instructors?.forEach((item) => {
        instructorsMod[item.id] = item;
      });
      levelSkills?.forEach((item) => {
        levelSkillMod[item.id] = item?.level_skill_map;
      });
      console.log("levelSkillMod", levelSkillMod);
      setLocations(locationsMod);
      setSeasons(seasonsMod);
      setAllInstructors(instructorsMod);
      setLevelSkills(levelSkillMod);
    } catch (error) {
      console.log("handleFileChange->>", error?.message);
    }
    e.target.value = "";
    setIsParsingFile(false);
  };

  const getReportCardHeader = (element) => {
    const reportHeader = [];

    if (reportTemplate?.instructor) {
      const fullName =
        allInstructors[element?.instructor_id]?.first_name +
        " " +
        allInstructors[element?.instructor_id]?.last_name;

      reportHeader?.push({
        title: "Instructor",
        value: fullName,
        id: element?.instructor_id,
      });
    }
    if (reportTemplate?.location) {
      reportHeader?.push({
        title: "Location",
        value: locations[element?.location_id]?.name,
        id: element?.location_id,
      });
    }
    if (reportTemplate?.season) {
      reportHeader?.push({
        title: "season",
        value: seasons[element?.season_id]?.name,
        id: element?.season_id,
      });
    }

    if (reportTemplate?.start_date_time) {
      reportHeader?.push({
        title: "Start Date/Time",
        value: excelDateToISOString(element?.start_date, element?.start_time),
        id: 1,
      });
    }
    if (reportTemplate?.days_of_week) {
      reportHeader?.push({
        title: "Selected Days",
        value: element?.days_of_week,
        id: 1,
      });
    }

    return reportHeader;
  };

  const handleBulkCreateWorksheets = async () => {
    setIsImporting(true);

    try {
      for (let i = 0; i < fileData.length; i++) {
        const element = fileData[i];
        const reportHeader = getReportCardHeader(element);

        const payload = {
          name: element?.name,
          level_id: element?.level_id,
          location_id: element?.location_id,
          season_id: element?.season_id,
          instructor_id: element?.instructor_id,
          days_of_week: element?.days_of_week || "",
          course_code: element?.course_code,
          next_recommend_level_id: element?.recommended_level_id || null,
          start_date_time: excelDateToISOString(
            element?.start_date,
            element?.start_time
          ),
          status: "active",
          organization_id: state?.organization_id,
          report_template_id: reportTemplate?.id,
          report_template: reportTemplate,
          added_by: state?.user,

          heading_items: reportHeader,
        };

        const { data: worksheetData, error } = await supabase
          .from("worksheet")
          .insert([payload])
          .select()
          .single();

        if (error) {
          setFailedWorksheetsCodes((prev) => [...prev, element?.course_code]);
          continue;
        }

        const worksheetId = worksheetData?.id;
        if (worksheetId) {
          const skill_modified = levelSkills[element?.level_id]?.map(
            (item) => ({
              name: item?.skill?.name,
              skill_id: item?.skill?.id,
              is_required: item?.is_required,
              pass: false,
              is_assisted: item?.skill?.type === 1,
              description: item?.skill?.description,
            })
          );

          const participantMap = element?.participant_ids
            ?.split(",")
            ?.map((participantId) => ({
              worksheet_id: worksheetId,
              participant_id: participantId?.trim(),
              skill_result: skill_modified,
              level_id: element?.level_id,
              next_recommend_level_id: element?.recommended_level_id || null,
              pass_label: orgLabels?.pass,
              fail_label: orgLabels?.fail,
              comment: "",
              heading_items: reportHeader,
              result_in_percentage: 0,
              result: "fail",
              organization_id: state?.organization_id,
            }));

          const { error: participantError } = await supabase
            .from("worksheet_participant_map")
            .insert(participantMap)
            .select();
        }
      }
      showToast(globalDispatch, "Worksheets are created successfully");
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, "Failed to create worksheets", 4000, "error");
    }
    setIsImporting(false);
    setWorksheetFile(null); // to close the modal
    refetchFn();
  };

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const { data: reportCardTemplate } = await supabase
        .from("report_card_template")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("status", "active")
        .single();
      setReportTemplate(reportCardTemplate || {});

      const { data: labels } = await supabase
        .from("organization_labels")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .single();

      setOrgLabels(labels);
    } catch (error) {
      console.log("fetchData->>", error?.message);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <InteractiveButton
        disabled={isFetching}
        onClick={() => fileRef.current?.click()}
        type={"button"}
        isSecondaryBtn={true}
      >
        <span className="flex items-center gap-3">
          {" "}
          <span>Import Worksheet</span>
        </span>
      </InteractiveButton>
      <input
        type="file"
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        name=""
        id=""
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* <ImportModal
        fileName={worksheetFile?.name}
        isOpen={worksheetFile}
        handleModalCloseFn={() => setWorksheetFile(null)}
        title="Import Worksheet"
      /> */}

      <ImportModal
        fileName={worksheetFile?.name}
        isOpen={worksheetFile}
        title="Import Worksheet"
        handleModalCloseFn={() => {
          setWorksheetFile(null);
          setErrorMessage("");
        }}
        importDataFunction={handleBulkCreateWorksheets}
        isLoading={isImporting}
        errorMessage={errorMessage}
        data={sampleData}
        isParsingFile={isParsingFile}
      />
    </>
  );
}
