import { FullPageLoader } from "Components/FullPageLoader";
import { InteractiveButton } from "Components/InteractiveButton";
import { PageWrapper } from "Components/PageWrapper";
import {
  EditReportPageHeader,
  EditReportPageRightBar,
  EditReportPageSideBar,
  EditRportParicipantResult,
} from "Components/Report";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { supabase } from "Src/supabase";
import { participantReportCardStatus, worksheetStatus } from "Utils/utils";

export default function AdministratorEditReportCardPage() {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [worksheet, setWorksheet] = useState({});
  const [allParticipants, setAllParticipants] = useState([]);
  const [activeParticipant, setActiveParticipant] = useState({});
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState({});
  const [template, setTemplate] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("worksheet")
        .select("*, level: level_id(id,name)")
        // .select(
        //   "id,course_code,status, name, level_id, status, level: level_id(id,name)"
        // )
        .eq("id", id)
        .eq("organization_id", state?.organization_id)
        .single();

      const { data: participants } = await supabase
        .from("worksheet_participant_map")
        .select("*, user: participant_id(*), level: level_id(id, name)")
        .order("id", { ascending: false })
        .eq("worksheet_id", id);

      const { data: levels } = await supabase
        .from("level")
        .select("*")
        .order("id", { ascending: false })
        .eq("status", "active")
        .neq("id", data?.level_id)
        .eq("organization_id", state?.organization_id);

      const { data: report_template } = await supabase
        .from("report_card_template")
        .select("*")
        .order("id", { ascending: false })
        .eq("status", "active")
        .eq("organization_id", state?.organization_id);

      const levelsMod = levels?.map((item) => ({
        ...item,
        label: item?.name,
        value: item?.id,
      }));
      const participantsMod = participants?.map((item) => ({
        ...item,
        isEdited: false,
      }));
      setWorksheet(data);
      // setTemplate(data?.report_template);
      setTemplate(report_template?.[0] || {});
      setAllParticipants(participantsMod || []);
      setLevels(levelsMod || []);
    } catch (error) {
      console.log(error?.message);
    }
    setIsFetching(false);
  };
  console.log("template", template);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const newStatus =
        worksheetStatus?.inProgress?.toLocaleLowerCase() === worksheet?.status
          ? worksheetStatus?.inReview
          : worksheetStatus?.published;

      const { error } = await supabase
        .from("worksheet")
        .update({
          status: newStatus,
        })
        .eq("id", id);

      if (error) throw error;

      if (newStatus === worksheetStatus?.published) {
        await supabase
          .from("worksheet_participant_map")
          .update({ status: newStatus })
          .eq("worksheet_id", worksheet?.id);
      }

      showToast(globalDispatch, `Status updated to ${newStatus}`);
      // navigate("/administrator/report");
      getData();
    } catch (error) {
      console.log("error", error?.message);
      showToast(
        globalDispatch,
        error?.message || `Failed to update the status`,
        4000,
        "error"
      );
    }
    setIsLoading(false);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const { comment, id, status, next_recommend_level_id, skill_result } =
        activeParticipant;

      const { data: participants } = await supabase
        .from("worksheet_participant_map")
        .update({
          skill_result: skill_result,
          comment: comment,
          next_recommend_level_id: next_recommend_level_id,
        })
        .eq("id", id);
    } catch (error) {
      console.log("error", error?.message);
    }
    setIsSaving(false);
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <PageWrapper>
      {isFetching ? (
        <FullPageLoader />
      ) : (
        <>
          <EditReportPageHeader
            backLink={`/administrator/report`}
            subTitle={`${worksheet?.course_code} ${worksheet?.level?.name}`}
            status={worksheet?.status}
            isLoading={isLoading}
            submitFunction={handleSubmit}
            reportPermisstion={{ review: true, publish: true }}
          />

          <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-10">
            <div className="col-span-3">
              <EditReportPageSideBar
                data={allParticipants}
                setActiveParticipant={setActiveParticipant}
                acitveParticipant={activeParticipant}
                setAllParticipants={setAllParticipants}
              />
            </div>

            <div className="col-span-6">
              <EditRportParicipantResult
                setActiveParticipant={setActiveParticipant}
                activeParticipant={activeParticipant}
                allParticipants={allParticipants}
                setAllParticipants={setAllParticipants}
                handleSaveChanges={handleSaveChanges}
                isLoading={isSaving}
                template={template}
                isEditable={
                  worksheet?.status?.toLocaleLowerCase() !==
                  worksheetStatus?.published
                }
              />
            </div>

            <div className="col-span-5">
              {activeParticipant?.id ? (
                <EditReportPageRightBar
                  levels={levels}
                  setActiveParticipant={setActiveParticipant}
                  activeParticipant={activeParticipant}
                  allParticipants={allParticipants}
                  setAllParticipants={setAllParticipants}
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  template={template}
                />
              ) : null}
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
