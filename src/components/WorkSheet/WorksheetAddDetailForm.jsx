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
import moment from "moment";

export default function WorksheetAddDetailForm({
  formRef,
  onSubmitFn = () => {},
  reportTemplate = {},
  setSelectedTab = () => {},
}) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isFetching, setIsFetching] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [levels, setLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [instructors, setInstructors] = useState([]);

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

      // Set state
      setLevels(modifiedLevels);
      setLocations(modifiedLocations);
      setSeasons(modifiedSeasons);
      setInstructors(modifiedInstructors);

      console.log("allInstructors", allInstructors);
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = (data) => {
    try {
      const days = selectedDays?.map((day) => day?.value);
      const selectedInstructor = instructors?.find(
        (item) => item?.value === Number(data?.instructor)
      );
      const selectedSeason = seasons?.find(
        (item) => item?.value === Number(data?.season)
      );
      const selectedLocation = locations?.find(
        (item) => item?.value === Number(data?.location)
      );
      const selectedLevel = locations?.find(
        (item) => item?.value === Number(data?.levelName)
      );

      const reportHeader = [];

      if (reportTemplate?.instructor) {
        reportHeader?.push({
          title: "Instructor",
          value: selectedInstructor?.label,
          id: selectedInstructor?.value,
        });
      }
      if (reportTemplate?.location) {
        reportHeader?.push({
          title: "Location",
          value: selectedLocation?.label,
          id: selectedLocation?.value,
        });
      }
      if (reportTemplate?.season) {
        reportHeader?.push({
          title: "Season",
          value: selectedSeason?.label,
          id: selectedSeason?.value,
        });
      }
      if (reportTemplate?.start_date_time) {
        reportHeader?.push({
          title: "Start Date/Time",
          value: moment(`${data?.startDate}T${data?.startTime}:00Z`).format(
            "DD MMM YYYY, hh:mm A"
          ),
          // value: `${data?.startDate}T${data?.startTime}:00Z`,
          id: 1,
        });
      }
      // if (reportTemplate?.days_of_week) {
      //   reportHeader?.push({
      //     title: "Selected Days",
      //     value: days?.join(","),
      //     id: 1,
      //   });
      // }
      if (reportTemplate?.days_of_week) {
        const capitalizedDays = days?.map(
          (day) => day.charAt(0).toUpperCase() + day.slice(1)
        );
        reportHeader?.push({
          title: "Selected Days",
          value: capitalizedDays?.join(", "),
          id: 1,
        });
      }

      if (new Date() > new Date(data?.publishDate)) {
        setError("publishDate", {
          message: "Publish date must be in future",
          type: "manual",
        });
        return;
      }

      const dataModified = {
        ...data,
        selectedDays: days?.join(","),
        reportCardHeader: reportHeader,
        next_recommended_level_id: selectedLevel?.next_recommended_level_id,
      };

      onSubmitFn(dataModified);
    } catch (error) {
      console.log(error?.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (Object.keys(errors)?.length) {
      setSelectedTab(1);
    }
  }, [errors]);

  return isFetching ? (
    <div className="h-full w-full py-10 grid place-content-center">
      <MoonLoader color={"#000"} loading={true} size={100} />
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
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
  );
}
