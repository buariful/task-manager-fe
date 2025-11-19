import { InteractiveButton } from "Components/InteractiveButton";
import { PageWrapper } from "Components/PageWrapper";
import { ToggleButton } from "Components/ToggleButton";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useRef } from "react";
import { useContext } from "react";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "Src/supabase";
import { reportCardNameOptions } from "Utils/utils";

const defaultValues = {
  days_of_week: true,
  instructor: true,
  location: true,
  season: true,
  start_date_time: true,
  comment: true,
  ai_comment: true,
  next_level_recommendation: true,
};

export default function AdministratorAddReportTemplatePage() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);

  const [nameError, setNameError] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateValues, setTemplateValues] = useState(defaultValues);
  const [templateCreatingMode, setTemplateCreatingMode] = useState("");
  const [selectedNameOption, setSelectedNameOption] = useState(1);

  const navigate = useNavigate();
  const formRef = useRef();

  const handleToggleButton = (fieldName, value) => {
    try {
      setTemplateValues((prev) => ({ ...prev, [fieldName]: value }));
    } catch (error) {
      console.log("handleToggleButton->>", error?.message);
    }
  };

  const handleNameOptionSelect = (e) => {
    try {
      setSelectedNameOption(Number(e.target.value));
    } catch (error) {
      console.log("handleNameOptionSelect->>", error?.message);
    }
  };

  const onSubmit = async (mode) => {
    if (!templateName) {
      setNameError("Name is required");
      return;
    }
    setTemplateCreatingMode(mode);
    try {
      const { data, error } = await supabase
        .from("report_card_template")
        .insert([
          {
            ...templateValues,
            name: templateName,
            published: mode !== "draft",
            status: "inactive",
            organization_id: state?.organization_id,
            added_by: state?.user,
            name_option: selectedNameOption,
          },
        ])
        .select();

      if (error) {
        setTemplateCreatingMode("");
        showToast(
          globalDispatch,
          error?.message || "Failed to create template",
          4000,
          "error"
        );
        return;
      }

      console.log(data);
      showToast(globalDispatch, "Template created successfully");
      navigate("/administrator/report");
    } catch (error) {
      console.log("onSubmit->>", error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to create template",
        4000,
        "error"
      );
    }
    setTemplateCreatingMode(null);
  };

  return (
    <PageWrapper>
      {/* header */}
      <div className="flex  justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link to={"/administrator/report"} className="text-accent">
            <FaArrowLeft />
          </Link>
          <h2 className="text-xl font-semibold text-accent">Create Template</h2>
        </div>

        <div className="flex gap-3">
          <InteractiveButton
            onClick={() => navigate("/administrator/report")}
            // className=" !bg-white !text-accent   !px-12 !border hover:!border-secondary !border-white"
            isSecondaryBtn={true}
          >
            Cancel
          </InteractiveButton>

          <InteractiveButton
            onClick={() => onSubmit("draft")}
            className=" !border !border-accent"
            isSecondaryBtn={true}
            loading={templateCreatingMode === "draft"}
            color="#000"
          >
            Save as Draft
          </InteractiveButton>

          <InteractiveButton
            loading={templateCreatingMode === "create"}
            onClick={() => {
              onSubmit("create");
            }}
          >
            Create
          </InteractiveButton>
        </div>
      </div>

      {/* Input */}
      <form ref={formRef} className="max-w-lg">
        <div className="mb-6">
          <label>Template Name</label>
          <input
            type={"text"}
            placeholder={"Name"}
            value={templateName}
            className={`focus:shadow-outline w-full resize-none appearance-none bg-input-bg px-4  py-2.5 text-sm leading-tight   outline-none focus:outline-none ${
              nameError
                ? "border-b border-red-500"
                : "border-b border-b-yellow-500"
            }`}
            onChange={(e) => {
              setNameError("");
              setTemplateName(e?.target?.value);
            }}
          />
          <p className="text-field-error italic text-red-500">{nameError}</p>
        </div>

        {/* Toggle buttons */}
        <div className="grid grid-cols-2 gap-5">
          <ToggleButton
            withLabel={true}
            activeLable="Days of week"
            disabledLabel="Days of week"
            value={templateValues?.days_of_week}
            onChangeFunction={(v) => handleToggleButton("days_of_week", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="Instructor"
            disabledLabel="Instructor"
            value={templateValues?.instructor}
            onChangeFunction={(v) => handleToggleButton("instructor", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="Location"
            disabledLabel="Location"
            value={templateValues?.location}
            onChangeFunction={(v) => handleToggleButton("location", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="Season"
            disabledLabel="Season"
            value={templateValues?.season}
            onChangeFunction={(v) => handleToggleButton("season", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="Start Date Time"
            disabledLabel="Start Date Time"
            value={templateValues?.start_date_time}
            onChangeFunction={(v) => handleToggleButton("start_date_time", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="Comment"
            disabledLabel="Comment"
            value={templateValues?.comment}
            onChangeFunction={(v) => handleToggleButton("comment", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="AI Comment"
            disabledLabel="AI Comment"
            value={templateValues?.ai_comment}
            onChangeFunction={(v) => handleToggleButton("ai_comment", v)}
          />
          <ToggleButton
            withLabel={true}
            activeLable="Next Recommended Level"
            disabledLabel="Next Recommended Level"
            value={templateValues?.next_level_recommendation}
            onChangeFunction={(v) =>
              handleToggleButton("next_level_recommendation", v)
            }
          />
        </div>
        <div className="mt-6">
          <label className={`mb-2 block  `}>Name Display Options</label>

          <div className="flex flex-wrap items-center gap-5 ">
            {/* {reportCardNameOptions?.map((item, i) => (
              <div className="flex items-center gap-2" key={i}>
               
                <input
                  type="radio"
                  name="name_option"
                  className={`cursor-pointer rounded border border-gray-300 text-primary 
    checked:bg-primary checked:border-primary focus:ring-primary focus:outline-none`}
                  value={item?.value}
                  checked={item?.value === selectedNameOption}
                  onChange={handleNameOptionSelect}
                />

                <label className="text-sm font-normal capitalize">
                  {item?.label}
                </label>
              </div>
            ))} */}
            {reportCardNameOptions.map((item) => (
              <label key={item.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="name_option"
                  value={item.value}
                  checked={item.value === selectedNameOption}
                  onChange={handleNameOptionSelect}
                  className="cursor-pointer  text-primary 
    checked:bg-primary checked:border-primary focus:ring-primary focus:outline-none"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      </form>
    </PageWrapper>
  );
}
