import { Card } from "Components/Card";
import { PageWrapper } from "Components/PageWrapper";
import {
  WorksheetAddDetailForm,
  WorksheetAddHeader,
  WorksheetParticipants,
} from "Components/WorkSheet";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "Src/supabase";

export default function UserAddWorksheetPage() {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [selectedTab, setSelectedTab] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [reportTemplate, setReportTemplate] = useState({});
  const [orgLabels, setOrgLabels] = useState({});

  const formRef = useRef();
  const navigate = useNavigate();

  const handleExternalSubmit = async () => {
    try {
      if (formRef?.current) {
        formRef?.current?.requestSubmit();
      }
    } catch (error) {}
  };
  const handleCreateWorksheet = async (data) => {
    if (!reportTemplate?.id) {
      showToast(
        globalDispatch,
        "No active report template found.",
        4000,
        "error."
      );
      return;
    }

    setIsLoading(true);
    try {
      const {
        courseCode,
        instructor,
        levelName,
        location,
        name,
        season,
        startDate,
        startTime,
        publishDate,
        publishTime,

        selectedDays,
        reportCardHeader,
        next_recommended_level_id,
      } = data;

      // get selected level skills
      const { data: levelSkills } = await supabase
        .from("level_skill_map")
        .select("*, skill: skill_id(id, name, type)")
        .eq("level_id", levelName);

      if (!levelSkills?.length) {
        showToast(
          globalDispatch,
          "No skills found attched to this level.",
          4000,
          "error"
        );
        setIsLoading(false);
        return;
      }
      const skill_modified = levelSkills?.map((item) => ({
        name: item?.skill?.name,
        skill_id: item?.id,
        is_required: item?.is_required,
        pass: false,
        is_assisted: item?.skill?.type === 1,
      }));

      const worksheetPyalod = {
        name: name,
        level_id: levelName,
        location_id: location,
        season_id: season,
        instructor_id: instructor,
        days_of_week: selectedDays || "",
        start_date_time: `${startDate}T${startTime}:00Z`,
        publish_date_time: `${publishDate}T${publishTime}:00Z`,
        course_code: courseCode,
        status: "active",
        organization_id: state?.organization_id,
        report_template_id: reportTemplate?.id,
        heading_items: reportCardHeader,
        added_by: state?.user,
      };

      // creating worksheet
      const { data: worksheetData, error } = await supabase
        .from("worksheet")
        .insert([worksheetPyalod])
        .select()
        .single();

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to create worksheet",
          4000,
          "error"
        );
        setIsLoading(false);
        return;
      }
      const worksheetId = worksheetData?.id;

      const participantMap = selectedParticipants?.map((item) => ({
        worksheet_id: worksheetId,
        participant_id: item?.id,
        skill_result: skill_modified,
        level_id: levelName,
        next_recommend_level_id: next_recommended_level_id || null,
        pass_label: orgLabels?.pass,
        fail_label: orgLabels?.fail,
        comment: "",
        heading_items: reportCardHeader,
        result_in_percentage: 0,
        result: "fail",
        organization_id: state?.organization_id,
      }));

      const { error: participantError } = await supabase
        .from("worksheet_participant_map")
        .insert(participantMap)
        .select();

      if (participantError) {
        showToast(globalDispatch, participantError?.message, 4000, "error");
      } else {
        showToast(globalDispatch, "Worksheet created successfully");
        navigate("/user/worksheet");
      }
    } catch (error) {
      console.log(error?.message);
    }
    setIsLoading(false);
  };

  const getData = async () => {
    try {
      const { data: report_card_template } = await supabase
        .from("report_card_template")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("status", "active")
        .single();

      setReportTemplate(report_card_template);

      const { data: labels } = await supabase
        .from("organization_labels")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .single();

      setOrgLabels(labels);
    } catch (error) {}
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <PageWrapper>
      <WorksheetAddHeader
        backLink={"/user/worksheet"}
        handleExternalSubmit={handleExternalSubmit}
        isLoading={isLoading}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <div className={` ${selectedTab === 1 ? "block" : "hidden"}`}>
        <WorksheetAddDetailForm
          formRef={formRef}
          onSubmitFn={handleCreateWorksheet}
          reportTemplate={reportTemplate}
          setSelectedTab={setSelectedTab}
        />
      </div>
      <div className={`${selectedTab === 2 ? "block" : "hidden"}`}>
        <WorksheetParticipants
          selectedParticipants={selectedParticipants}
          setSelectedParticipants={setSelectedParticipants}
        />
      </div>
    </PageWrapper>
  );
}
