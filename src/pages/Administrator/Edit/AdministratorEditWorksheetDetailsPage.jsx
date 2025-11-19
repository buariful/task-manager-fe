import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";
import { useRef } from "react";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import { GlobalContext, showToast } from "Context/Global";
import { useEffect } from "react";
import MoonLoader from "react-spinners/MoonLoader";
import { SearchDropdown } from "Components/SearchDropdown";
import { weekDays } from "Utils/utils";
import { useParams } from "react-router";
import { PageWrapper } from "Components/PageWrapper";
import { DetailPageHeader } from "Components/DetailPageHeader";
import { useNavigate } from "react-router-dom";

export default function AdministratorEditWorksheetDetailsPage({}) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isFetching, setIsFetching] = useState(false);
  const [worksheetData, setWorksheetData] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [levels, setLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [reportTemplate, setReportTemplate] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef();

  const schema = yup
    .object({
      name: yup.string().required("Worksheet name is required"),
      levelName: yup.string().required("Level is required"),
      location: yup.string().required("Location is required"),
      season: yup.string().required("Season is required"),
      instructor: yup.string().required("Instructor is required"),
      startDate: yup.string().required("Start date is required"),
      startTime: yup.string().required("Start time is required"),
      courseCode: yup.string().required("Course code is required"),
      publishDate: yup.string().required("Publish date is required"),
      publishTime: yup.string().required("Publish time is required"),
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

  const getData = async () => {
    setIsFetching(true);
    try {
      // Fetch levels, locations, seasons, instructor role in parallel
      const [
        { data: levelsData },
        { data: locationsData },
        { data: seasonsData },
        { data: instructorRoleData },
        { data: report_card_template },
        { data: worksheetData },
      ] = await Promise.all([
        supabase
          .from("level")
          .select("*")
          .eq("organization_id", state?.organization_id)
          .eq("status", "active"),
        supabase
          .from("location")
          .select("*")
          .eq("organization_id", state?.organization_id),
        supabase
          .from("season")
          .select("*")
          .eq("organization_id", state?.organization_id)
          .eq("status", "active"),
        supabase
          .from("roles")
          .select("*")
          .eq("organization_id", state?.organization_id)
          .eq("name", "instructor")
          .single(),

        supabase
          .from("report_card_template")
          .select("*")
          .eq("organization_id", state?.organization_id)
          .eq("status", "active")
          .single(),
        supabase.from("worksheet").select("*").eq("id", id).single(),
      ]);

      // Fetch all instructors if role exists
      const allInstructors = instructorRoleData?.id
        ? (
            await supabase
              .from("user_profile")
              .select("*")
              .eq("organization_id", state?.organization_id)
              .eq("role_id", instructorRoleData.id)
          ).data || []
        : [];

      // Map data to { label, value } format
      const modifiedLevels = levelsData?.map((item) => ({
        label: item.name,
        value: item.id,
        ...item,
      }));

      const modifiedLocations = locationsData?.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      const modifiedSeasons = seasonsData?.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      const modifiedInstructors = allInstructors?.map((item) => ({
        label: `${item.first_name} ${item.last_name}`,
        value: item.id,
      }));

      const selectedDaysModified = worksheetData?.days_of_week
        ?.split(",")
        ?.map((item) => ({ label: item, value: item }));

      const [date, time] = worksheetData?.start_date_time?.split("T");
      const [publishDate, publishTime] =
        worksheetData?.publish_date_time?.split("T");

      // Set state
      setLevels(modifiedLevels);
      setLocations(modifiedLocations);
      setSeasons(modifiedSeasons);
      setInstructors(modifiedInstructors);
      setReportTemplate(report_card_template);
      setSelectedDays(selectedDaysModified);
      setWorksheetData(worksheetData);

      setValue("courseCode", worksheetData?.course_code);
      setValue("instructor", worksheetData?.instructor_id);
      setValue("levelName", worksheetData?.level_id);
      setValue("location", worksheetData?.location_id);
      setValue("name", worksheetData?.name);
      setValue("season", worksheetData?.season_id);
      setValue("startDate", date || "");
      setValue("startTime", time?.split(":")?.slice(0, -1)?.join(":") || "");
      setValue("publishDate", publishDate || "");
      setValue(
        "publishTime",
        publishTime?.split(":")?.slice(0, -1)?.join(":") || ""
      );
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { courseCode, instructor, levelName, location, name, season } =
        data;

      const names = [];

      const payload = {
        course_code: courseCode,
        instructor_id: instructor,
        level_id: levelName,
        location_id: location,
        name: data?.name,
        season: data?.season_id,
        start_date_time: `${data?.startDate}T${data?.startTime}:00Z`,
        publish_date_time: `${data?.publishDate}T${data?.publishTime}:00Z`,
        days_of_week:
          selectedDays
            ?.map((item) => {
              return item?.label;
            })
            ?.join(", ") || "",
      };

      const { data: updatedData, error } = await supabase
        .from("worksheet")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) {
        console.log(error?.message);
        showToast(
          globalDispatch,
          error?.message || "Failed to update.",
          4000,
          "error"
        );
      } else {
        showToast(globalDispatch, "Worksheet updated successfully.");
        navigate(`/administrator/edit-worksheet/${id}`);
      }
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to update.",
        4000,
        "error"
      );
    }
    setIsLoading(false);
  };

  const handleTriggerSubmit = () => {
    try {
      if (formRef?.current) {
        formRef?.current?.requestSubmit();
      }
    } catch (error) {
      console.log("handleTriggerSubmit->>", error?.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <PageWrapper>
      <DetailPageHeader
        backLink={`/administrator/edit-worksheet/${id}`}
        pageTitle={"Edit Worksheet Details"}
        cancelBtnText="Cancel"
        cancelFunction={() => navigate(`/administrator/edit-worksheet/${id}`)}
        isLoading={isLoading}
        submitBtnText="Save Changes"
        submitFunction={handleTriggerSubmit}
        showSubmitButton={worksheetData?.status?.toLowerCase() === "active"}
      />

      {isFetching ? (
        <div className="h-full w-full py-10 grid place-content-center">
          <MoonLoader color={"#000"} loading={true} size={100} />
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-10 pb-20">
            <div>
              <MkdInput
                type={"text"}
                name={"name"}
                errors={errors}
                page={"add-level"}
                label={"Worksheet Name"}
                placeholder={""}
                register={register}
                className={"mb-10"}
              />
              <MkdInput
                type={"select"}
                name={"location"}
                errors={errors}
                label={"Location"}
                placeholder={""}
                register={register}
                options={locations}
                className={"mb-10"}
              />
              <MkdInput
                type={"select"}
                name={"instructor"}
                errors={errors}
                label={"Instructor"}
                placeholder={""}
                register={register}
                options={instructors}
                className={"mb-10"}
              />

              <div className="flex mb-10 items-center gap-10">
                <MkdInput
                  type={"date"}
                  name={"startDate"}
                  errors={errors}
                  label={"Start Date"}
                  placeholder={""}
                  register={register}
                />
                <MkdInput
                  type={"time"}
                  name={"startTime"}
                  errors={errors}
                  label={"Start Time"}
                  placeholder={""}
                  register={register}
                />
              </div>
              <div className="flex mb-10 items-center gap-10">
                <MkdInput
                  type={"date"}
                  name={"publishDate"}
                  errors={errors}
                  label={"Publish Date"}
                  placeholder={""}
                  register={register}
                />
                <MkdInput
                  type={"time"}
                  name={"publishTime"}
                  errors={errors}
                  label={"Publish Time"}
                  placeholder={""}
                  register={register}
                />
              </div>
            </div>

            {/* right side */}
            <div>
              <MkdInput
                type={"select"}
                name={"levelName"}
                errors={errors}
                label={"Level name"}
                placeholder={""}
                register={register}
                options={levels}
                className={"mb-10"}
              />
              <MkdInput
                type={"select"}
                name={"season"}
                errors={errors}
                label={"Season"}
                placeholder={""}
                register={register}
                options={seasons}
                className={"mb-10"}
              />
              <SearchDropdown
                options={weekDays}
                selected_states={selectedDays}
                label={"Days of Week(s) (Optional)"}
                lableFontLarge={false}
                stateChangeFn={setSelectedDays}
                className={"mb-10"}
                closeOnChangedValue={false}
              />
              <MkdInput
                type={"text"}
                name={"courseCode"}
                errors={errors}
                label={"Course Code"}
                placeholder={""}
                register={register}
                className={"mb-10"}
              />
            </div>
          </div>
        </form>
      )}
    </PageWrapper>
  );
}
