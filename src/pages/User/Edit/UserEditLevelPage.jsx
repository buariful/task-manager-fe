import { Card } from "Components/Card";
import { FullPageLoader } from "Components/FullPageLoader";
import {
  EditLevelPageHeader,
  LevelDetails,
  LevelDetailsSkillList,
} from "Components/Level";
import { ModalPrompt } from "Components/Modal";
import { PageWrapper } from "Components/PageWrapper";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useParams } from "react-router";
import { supabase } from "Src/supabase";
import { useNavigate } from "react-router-dom";
import { usePermission } from "Context/Custom";
import { usePermissionFetcher } from "Src/hooks/useSinglePermissionFetch";

export default function UserEditLevelPage() {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [levelData, setLevelData] = useState({});
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { data: permission } = usePermissionFetcher("level");

  const fetchData = async () => {
    setIsFetching(true);
    try {
      // level data
      const { data } = await supabase
        .from("level")
        .select(
          `*,
            next_recommended_level:next_recommended_level_id (
              id,
              name
            ),
            report_card_template:report_card_template_id (
              id,
              name
            )
              
            `
        )
        .eq("id", id)
        .eq("organization_id", state?.organization_id)
        .single();

      const { data: skill } = await supabase
        .from("level_skill_map")
        .select(
          `*,
            skill(*)
          `
        )
        .eq("level_id", id)
        .order("serial");

      setLevelData(data);
      setAllSkills(skill);
    } catch (error) {
      console.log("fetchData->>", error?.message);
    }
    setIsFetching(false);
  };

  const handleDeleteLevel = async () => {
    if (!permission?.add) {
      showToast(globalDispatch, "Permission not found", 4000, "error");
      setShowDeleteModal(false);
      return;
    }
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("level")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the level.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Level deleted successfully.");
      navigate("/user/level");
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the level.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  return (
    <PageWrapper>
      {/* Header */}
      <EditLevelPageHeader
        backLink={"/user/level"}
        deleteLoading={false}
        pageTitle={levelData?.name}
        handleDeleteFunction={() => setShowDeleteModal(true)}
        editDetailBtnFunction={() => navigate(`/user/edit-level-details/${id}`)}
        editSkillBtnFunction={() => navigate(`/user/edit-level-skills/${id}`)}
        isWithDelete={permission?.delete}
        isWithEdit={permission?.add}
      />

      {isFetching ? (
        <FullPageLoader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <LevelDetailsSkillList
            skills={allSkills}
            setSkills={setAllSkills}
            updatedAt={levelData?.updated_at}
            hasEditPermission={permission?.add}
          />
          <LevelDetails data={levelData} />
        </div>
      )}

      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={() => {
            handleDeleteLevel();
          }}
          closeModalFunction={() => {
            setShowDeleteModal(false);
          }}
          title={`Delete Level `}
          message={`You are about to delete level, ${id}. Note that this action is irreversible`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}
    </PageWrapper>
  );
}
