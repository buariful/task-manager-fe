import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { MkdInput } from "Components/MkdInput";
import { useState } from "react";
import { FaSearch, FaTrashAlt } from "react-icons/fa";
import { useRef } from "react";
import AlphabetFilter from "./AlphabetFilter";
import SkillList from "./SkillList";
import { IoFilterCircle } from "react-icons/io5";
import { Link } from "react-router-dom";
import { InteractiveButton } from "Components/InteractiveButton";
import LevelSkills from "./LevelSkills";
import AddLevelLeftSideForm from "./AddLevelLeftSideForm";
import { useLevel } from "Context/Level/LevelContext";
import { AuthContext } from "Context/Auth";
import { uploadFileAndGetNameAndUrl, uploadFileAndGetUrl } from "Utils/utils";
import { supabase } from "Src/supabase";
import { GlobalContext, showToast } from "Context/Global";
import { useEffect } from "react";

export default function AdministratorLevelForm({}) {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState(1);
  const formRef = useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const {
    levelData,
    setLevelData,
    files,
    setFiles,
    selectedSkills,
    setSelectedSkills,
    allSkills,
    setAllSkills,
  } = useLevel();

  const schema = yup
    .object({
      name: yup.string().required("Level name is required"),
      min_number: yup
        .number("Minimum number is required")
        .transform((value, originalValue) => {
          // if the user leaves the field empty, treat it as undefined
          return originalValue === "" ? undefined : value;
        })
        .required("Minimum number is required")
        .min(33, "Minimum number is 33")
        .max(100, "Maximum number is 100"),
      nextRecommendedLevel: yup
        .string()
        .required("Next recommended level is required"),
      description: yup
        .string()
        .required("Description recommended level is required"),
      selectedTemplate: yup
        .string()
        .required("Next recommended level is required"),
      // electionType: yup.string(),
      // state: yup.string(),
      // county: yup.string(),
    })
    .required();

  const {
    register,
    handleSubmit,

    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const handleExternalSubmit = () => {
    formRef?.current?.requestSubmit(); // triggers native submit
  };

  const onSubmit = async (data) => {
    if (!selectedSkills?.length) {
      showToast(globalDispatch, "No skills are selected", 4000, "error");
      return;
    }

    setIsLoading(true);
    try {
      let payload = {
        status: "active",
        name: data?.name,
        next_recommended_level_id: data?.nextRecommendedLevel,
        report_card_template_id: data?.selectedTemplate,
        description: data?.description,
        min_percentage: data?.min_number,
        added_by: state?.user,
        organization_id: state?.organization_id,
        file_urls: JSON.stringify([]),
      };

      // uploading files
      const fileUrls = await Promise.all(
        files.map((file) => uploadFileAndGetNameAndUrl(file))
      );
      payload["file_urls"] = JSON.stringify(fileUrls);
      console.log(fileUrls);
      console.log("Payload ready:", payload);

      // part: creating level
      const { data: insertedLevel, error } = await supabase
        .from("level")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;

      // part: creating skill level map
      const levelSkills = selectedSkills?.map((item) => ({
        skill_id: item?.id,
        level_id: insertedLevel?.id,
      }));
      const { error: skillLevelError } = await supabase
        .from("level_skill_map")
        .insert(levelSkills);
      if (skillLevelError) throw skillLevelError;

      showToast(globalDispatch, "Level created successfully");
      navigate("/administrator/level");
    } catch (error) {
      console.log("Error in onSubmit:", error?.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (Object.keys(errors)?.length) {
      setSelectedTab(1);
      showToast(
        globalDispatch,
        "Please fill up the required fields.",
        4000,
        "error"
      );
    }
  }, [errors]);

  return (
    <div className="">
      {/* Header */}
      <div className="flex  justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link to="/administrator/level" className="text-accent">
            <FaArrowLeft />
          </Link>
          <h2 className="text-xl font-semibold text-accent">Create Level</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 border-b-2 border-[#1e1e1e] pb-1`}
            onClick={() => setSelectedTab(1)}
          >
            <span className="text-[#757575] font-thin text-sm">Step 1</span>
            <span className="text-[#1e1e1e] font-medium text-base">
              Level Details
            </span>
          </button>
          <button
            className={`flex items-center gap-1 border-b-2 ${
              selectedTab === 2 ? "border-b-[#1e1e1e]" : "border-b-[#757575]"
            } pb-1`}
            onClick={() => setSelectedTab(2)}
          >
            <span className="text-[#757575] font-thin text-sm">Step 2</span>
            <span
              className={`${
                selectedTab === 2 ? "text-[#1e1e1e]" : "text-[#757575]"
              } font-medium text-base`}
            >
              Add Skills
            </span>
          </button>
        </div>

        <div className="flex gap-3">
          <InteractiveButton
            onClick={() => navigate("/administrator/level")}
            // className=" !bg-white !text-accent   !px-12 !border hover:!border-secondary !border-white"
            isSecondaryBtn={true}
          >
            Cancel
          </InteractiveButton>
          {selectedTab === 1 ? (
            <InteractiveButton
              onClick={() => setSelectedTab(2)}
              className="bg-primary hover:bg-accent text-white !px-12"
            >
              Next
            </InteractiveButton>
          ) : (
            <InteractiveButton
              loading={isLoading}
              onClick={handleExternalSubmit}
              className="bg-primary hover:bg-accent text-white !px-12"
            >
              Create Level
            </InteractiveButton>
          )}
        </div>
      </div>

      {/* Form */}
      <div className=" p-10">
        {/* {selectedTab === 1 ? (
        ) : (
        )} */}
        <form
          className={` ${selectedTab === 1 ? "block" : "hidden"}`}
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
        >
          <AddLevelLeftSideForm errors={errors} register={register} />
        </form>
        <div className={`${selectedTab === 2 ? "block" : "hidden"}`}>
          <LevelSkills />
        </div>
      </div>
    </div>
  );
}
