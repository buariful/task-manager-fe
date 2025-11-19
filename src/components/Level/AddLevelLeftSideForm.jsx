import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";
import { useRef } from "react";
import { FaPlus } from "react-icons/fa6";
import { useLevel } from "Context/Level/LevelContext";
import { FaTrashAlt } from "react-icons/fa";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import { GlobalContext, showToast } from "Context/Global";
import { useEffect } from "react";
import { Loader } from "Components/Loader";
import MoonLoader from "react-spinners/MoonLoader";
import { FullPageLoader } from "Components/FullPageLoader";

export default function AddLevelLeftSideForm({
  errors,
  register,
  documentUpload = true,
}) {
  const { files, setFiles, setLevelData, levelData } = useLevel();
  const fileInputRef = useRef(null);
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isFetching, setIsFetching] = useState(false);
  const [levels, setLevels] = useState([]);
  const [templates, setTemplates] = useState([]);

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data: reportCardTemplates } = await supabase
        .from("report_card_template")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("status", "active");

      const { data } = await supabase
        .from("level")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("status", "active");

      const modifiedLevels = data?.map((level) => ({
        label: level?.name,
        value: level?.id,
      }));
      const modifiedTemplates = reportCardTemplates?.map((level) => ({
        label: level?.name,
        value: level?.id,
      }));

      setLevels(modifiedLevels);
      setTemplates(modifiedTemplates);
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setIsFetching(false);
  };

  const handleTriggerFileSelection = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);

    // Append new files to state (avoid duplicates by name)
    setFiles((prev) => {
      const existingNames = prev.map((f) => f.name);
      const newFiles = selected.filter((f) => !existingNames.includes(f.name));
      return [...prev, ...newFiles];
    });

    // reset input so same file can be selected again if needed
    e.target.value = null;
  };
  const handleRemove = (name) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const recommendation = [
    { label: "Level 1", value: "Level 1" },
    { label: "Level 2", value: "Level 2" },
    { label: "Level 3", value: "Level 3" },
    { label: "Level 4", value: "Level 4" },
    { label: "Level 5", value: "Level 5" },
  ];
  const reportCardTemplate = [
    { label: "Level 1", value: "Level 1" },
    { label: "Level 2", value: "Level 2" },
    { label: "Level 3", value: "Level 3" },
    { label: "Level 4", value: "Level 4" },
    { label: "Level 5", value: "Level 5" },
  ];

  useEffect(() => {
    getData();
  }, []);
  return isFetching ? (
    <div className="h-full w-full py-10 grid place-content-center">
      <MoonLoader color={"#000"} loading={true} size={100} />
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-10">
      <div>
        <MkdInput
          type={"text"}
          name={"name"}
          errors={errors}
          page={"add-level"}
          label={"Level Name"}
          placeholder={""}
          register={register}
          parentClassNames={"mb-10"}
        />
        <MkdInput
          type={"number"}
          name={"min_number"}
          page={"add-level"}
          errors={errors}
          label={"Minimum Percentage Required to Pass (Total: 100%)"}
          placeholder={""}
          register={register}
          parentClassNames={"mb-10"}
        />

        {documentUpload ? (
          <div className="mb-10">
            <div className="mb-5 flex justify-between items-center gap-5">
              <h4 className="text-accent font-semibold text-lg">Attachments</h4>
              <button
                onClick={handleTriggerFileSelection}
                className="flex bg-input-bg p-2 rounded items-center gap-1 text-[#545F71] hover:text-accent"
              >
                <span className="] text-sm font-normal">Add Attachments</span>
                <FaPlus className="text-lg" />
              </button>
              <input
                type="file"
                accept=".pdf"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div className="flex items-center flex-wrap gap-5">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex  items-center justify-between text-[#545F71] border rounded-lg px-3 gap-5 py-2"
                >
                  <span className="truncate text-sm">{file.name}</span>
                  <FaTrashAlt
                    onClick={() => handleRemove(file.name)}
                    className="hover:text-red-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* right side */}
      <div>
        <MkdInput
          type={"select"}
          name={"nextRecommendedLevel"}
          errors={errors}
          label={"Next Recommended Level"}
          placeholder={""}
          register={register}
          options={levels}
          parentClassNames={"mb-10"}
        />
        <MkdInput
          type={"textarea"}
          name={"description"}
          errors={errors}
          label={"Description"}
          placeholder={""}
          register={register}
          parentClassNames={"mb-10"}
          rows="5"
        />

        <MkdInput
          type={"select"}
          name={"selectedTemplate"}
          errors={errors}
          label={"Select Report Card Template"}
          placeholder={""}
          register={register}
          options={templates}
          parentClassNames={"mb-10"}
        />
      </div>
    </div>
  );
}
