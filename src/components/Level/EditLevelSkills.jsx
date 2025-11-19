import React from "react";
import LevelSkills from "./LevelSkills";
import { useLevel } from "Context/Level/LevelContext";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { useEffect } from "react";
import { AuthContext } from "Context/Auth";
import { FullPageLoader } from "Components/FullPageLoader";
import { DetailPageHeader } from "Components/DetailPageHeader";
import { GlobalContext, showToast } from "Context/Global";

export default function EditLevelSkills({ hasAddSkillPermission = true }) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { selectedSkills, setSelectedSkills } = useLevel();

  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prevSelectedSkills, setPrevSelectedSkills] = useState({}); // {3: {level_skill_map_id:1, ...skill_data}}  {skill_id:{}}

  const { id } = useParams();
  const navigate = useNavigate();

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("level")
        .select(
          `
              id,
              name,
              description,
              min_percentage,
              organization_id,
              level_skill_map (
              id,
                skill (
                  id,
                  name,
                  category_id,
                  type,
                  status
                )
              )
            `
        )
        .eq("organization_id", state?.organization_id)
        .eq("id", id)
        .single();

      let skillObj = {};
      const skillList = data?.level_skill_map?.map((skill) => {
        skillObj[skill?.skill?.id] = {
          ...skill?.skill,
          level_skill_map_id: skill?.id,
        };

        return skill?.skill;
      });

      setPrevSelectedSkills(skillObj);
      setSelectedSkills(skillList);
    } catch (error) {}
    setIsFetching(false);
  };

  const handleSaveSkills = async () => {
    setIsLoading(true);

    try {
      //  Step 1: Map current selected skills by ID for quick lookup
      const selectedSkillsMod = {};
      const newAddedSkillIds = [];

      selectedSkills?.forEach((skill) => {
        if (!prevSelectedSkills?.[skill.id]) {
          newAddedSkillIds.push(skill.id);
        }
        selectedSkillsMod[skill.id] = skill;
      });

      //  Step 2: Find removed skills by comparing previous map
      const removedSkillLevelMapIds = [];
      Object.keys(prevSelectedSkills || {}).forEach((key) => {
        if (!selectedSkillsMod[key]) {
          removedSkillLevelMapIds.push(
            prevSelectedSkills[key]?.level_skill_map_id
          );
        }
      });

      //  Step 3: Add new skills to level_skill_map
      if (newAddedSkillIds.length > 0) {
        const levelSkills = newAddedSkillIds.map((skill_id) => ({
          skill_id,
          level_id: id,
        }));

        const { error: insertError } = await supabase
          .from("level_skill_map")
          .insert(levelSkills);

        if (insertError) throw insertError;
      }

      //  Step 4: Remove unselected skills from level_skill_map
      if (removedSkillLevelMapIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("level_skill_map")
          .delete()
          .in("id", removedSkillLevelMapIds);

        if (deleteError) throw deleteError;
      }
      showToast(globalDispatch, "Level skills are updated successfully");
    } catch (error) {
      showToast(
        globalDispatch,
        error?.message || "Failed to update",
        4000,
        "error"
      );
      console.error("handleSaveSkills ->", error?.message);
    } finally {
      setIsLoading(false);
      navigate(`/${state?.role}/edit-level/${id}`);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {isFetching ? (
        <FullPageLoader />
      ) : (
        <>
          <DetailPageHeader
            backLink={`/${state?.role}/edit-level/${id}`}
            pageTitle={"Edit Skills"}
            cancelFunction={() => navigate(`/${state?.role}/edit-level/${id}`)}
            isLoading={isLoading}
            submitBtnText="Save Changes"
            showSubmitButton={true}
            submitFunction={handleSaveSkills}
          />
          <LevelSkills hasAddSkillPermission={hasAddSkillPermission} />
        </>
      )}
    </div>
  );
}
