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
import { PageWrapper } from "Components/PageWrapper";
import { DetailPageHeader } from "Components/DetailPageHeader";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { ToggleButton } from "Components/ToggleButton";
import {
  deleteFileFromBucket,
  JsonParse,
  uploadFileAndGetNameAndUrl,
} from "Utils/utils";

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

export default function AdministratorEditLevelDetailsPage() {
  const fileInputRef = useRef(null);
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef();

  const [files, setFiles] = useState([]);
  const [prevFiles, setPrevFiles] = useState([]);
  const [removedPrevFiles, setRemovedPrevFiles] = useState([]);
  const [levelData, setLevelData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [levels, setLevels] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const {
    register,
    handleSubmit,

    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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
      const { data: level } = await supabase
        .from("level")
        .select("*")
        .eq("id", id)
        .single();

      const modifiedLevels = data?.map((level) => ({
        label: level?.name,
        value: level?.id,
      }));
      const modifiedTemplates = reportCardTemplates?.map((level) => ({
        label: level?.name,
        value: level?.id,
      }));

      const {
        name,
        description,
        min_percentage,
        next_recommended_level_id,
        report_card_template_id,
        status,
        file_urls,
      } = level;

      setLevelData(level);
      setLevels(modifiedLevels);
      setTemplates(modifiedTemplates);

      setValue("name", name);
      setValue("description", description);
      setValue("min_number", min_percentage);
      setValue("nextRecommendedLevel", next_recommended_level_id);
      setValue("selectedTemplate", report_card_template_id);
      setIsActive(() => status?.toLowerCase() === "active");
      setPrevFiles(JsonParse(file_urls));
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setIsFetching(false);
  };
  console.log(prevFiles);
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let payload = {
        status: isActive ? "active" : "inactive",
        name: data?.name,
        next_recommended_level_id: data?.nextRecommendedLevel,
        report_card_template_id: data?.selectedTemplate,
        description: data?.description,
        min_percentage: data?.min_number,
        file_urls: JSON.stringify([]),
      };

      // uploading files
      const fileUrls = await Promise.all(
        files.map((file) => uploadFileAndGetNameAndUrl(file))
      );
      payload["file_urls"] = JSON.stringify([...fileUrls, ...prevFiles]);
      console.log(fileUrls);

      // part: creating level
      const { data: updatedLevel, error } = await supabase
        .from("level")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();
      if (error) throw error;

      //   deleting files from bucket
      await Promise.all(files.map((file) => deleteFileFromBucket(file?.name)));

      showToast(globalDispatch, "Level updated successfully");
      navigate(`/administrator/edit-level/${id}`);
    } catch (error) {
      console.log("Error in onSubmit:", error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to update",
        4000,
        "error"
      );
    }
    setIsLoading(false);
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
  const handleRemovePrevFile = async (name) => {
    try {
      //   await deleteFileFromBucket(name);
      const file = prevFiles?.find((item) => item?.name === name);
      setRemovedPrevFiles((prev) => [...prev, file]);
      setPrevFiles((prev) => prev.filter((file) => file.name !== name));
    } catch (error) {
      console.log(error?.message);
    }
  };

  const handleFormSubmit = () => {
    if (formRef?.current) {
      formRef?.current?.requestSubmit();
    }
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <PageWrapper>
      <DetailPageHeader
        backLink={`/administrator/edit-level/${id}`}
        pageTitle={"Edit Level Details"}
        cancelFunction={() => navigate(`/administrator/edit-level/${id}`)}
        isLoading={isLoading}
        submitFunction={handleFormSubmit}
      />

      {isFetching ? (
        <div className="h-full w-full py-10 grid place-content-center">
          <MoonLoader color={"#000"} loading={true} size={100} />
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
                className={"mb-10"}
              />
              <MkdInput
                type={"number"}
                name={"min_number"}
                page={"add-level"}
                errors={errors}
                label={"Minimum Percentage Required to Pass (Total 100%)"}
                placeholder={""}
                register={register}
                className={"mb-10"}
              />

              <div className="mb-10">
                <div className="mb-5 flex justify-between items-center gap-5">
                  <h4 className="text-accent font-semibold text-lg">
                    Attachments
                  </h4>
                  <button
                    onClick={handleTriggerFileSelection}
                    className="flex bg-input-bg p-2 rounded items-center gap-1 text-[#545F71] hover:text-accent"
                  >
                    <span className="] text-sm font-normal">
                      Add Attachments
                    </span>
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
                  {prevFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex  items-center justify-between text-[#545F71] border rounded-lg px-3 gap-5 py-2"
                    >
                      <span className="truncate text-sm">{file.name}</span>
                      <FaTrashAlt
                        onClick={() => handleRemovePrevFile(file.name)}
                        className="hover:text-red-500 cursor-pointer"
                      />
                    </div>
                  ))}
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
                className={"mb-10"}
              />
              <MkdInput
                type={"textarea"}
                name={"description"}
                errors={errors}
                label={"Description"}
                placeholder={""}
                register={register}
                className={"mb-10"}
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
                className={"mb-10"}
              />

              <ToggleButton
                withLabel={true}
                value={isActive}
                onChangeFunction={setIsActive}
              />
            </div>
          </div>
        </form>
      )}
    </PageWrapper>
  );
}
