import { FullPageLoader } from "Components/FullPageLoader";
import { MkdListTable } from "Components/MkdListTable";
import { AuthContext } from "Context/Auth";
import moment from "moment";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { supabase } from "Src/supabase";
import EditNameStatusModal from "./EditNameStatusModal";
import AddRecordWithNameModal from "./AddRecordWithNameModal";
import { InteractiveButton } from "Components/InteractiveButton";
import { FaPlus } from "react-icons/fa6";
import { GlobalContext, showToast } from "Context/Global";
import { Card } from "Components/Card";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";

const schema = yup
  .object({
    dashboard: yup.string().required("Dashboard is a required field."),
    level: yup.string().required("Level is a required field."),
    skill: yup.string().required("Skills is a required field."),
    worksheet: yup.string().required("Worksheet is a required field."),
    report_card: yup.string().required("Report Card is a required field."),
    participant: yup.string().required("Participant is a required field."),
    user: yup.string().required("User is a required field."),
    analytics: yup.string().required("Analytics is a required field."),
    pass: yup.string().required("Pass is a required field."),
    fail: yup.string().required("Fail is a required field."),
  })
  .required();

export default function OrganizationLables() {
  const { dispatch: globalDispatch, setLabels: setMenuLinks } =
    useContext(GlobalContext);

  const { state } = useContext(AuthContext);
  const { organization_id } = state;

  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [areFieldsActive, setAreFieldsActive] = useState(false);
  const [labels, setLabels] = useState({});

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("organization_labels")
        .select("*")
        .eq("organization_id", organization_id)
        .single();

      setLabels(data);

      const fields = [
        "dashboard",
        "level",
        "skill",
        "worksheet",
        "report_card",
        "participant",
        "user",
        "analytics",
        "pass",
        "fail",
      ];

      if (data) {
        fields.forEach((field) => {
          setValue(field, data[field] || "");
        });
      }
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setIsFetching(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!labels?.id) {
        const { data: result, error } = await supabase
          .from("organization_labels")
          .insert([
            {
              ...data,
              organization_id: state?.organization_id,
            },
          ])
          .select()
          .single();

        showToast(globalDispatch, "Labels updated successfully");
        setLabels(result);
        setMenuLinks(result);
      } else {
        const { data: updateResult, error: updateError } = await supabase
          .from("organization_labels")
          .update({
            ...data,
            updated_at: new Date(),
          })
          .eq("organization_id", organization_id)
          .select()
          .single();

        if (updateError) {
          showToast(
            globalDispatch,
            updateError?.message || "Failed to update",
            4000,
            "error"
          );
        } else {
          setMenuLinks(updateResult);
          showToast(globalDispatch, "Labels updated successfully");
        }
      }

      setAreFieldsActive(false);
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to update lables",
        4000,
        "error"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (organization_id) {
      getData();
    }
  }, [organization_id]);

  return (
    <Card>
      <form
        onFocus={() => setAreFieldsActive(true)}
        className=""
        onSubmit={handleSubmit(onSubmit)}
      >
        {areFieldsActive ? (
          <div className="flex items-center gap-3 justify-end">
            <InteractiveButton
              isSecondaryBtn={true}
              onClick={() => setAreFieldsActive(false)}
            >
              Cancel
            </InteractiveButton>

            <InteractiveButton type="submit" loading={loading}>
              Save Changes
            </InteractiveButton>
          </div>
        ) : null}

        <h3 className="mb-5">Menu Labels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-5">
          <MkdInput
            type={"text"}
            name={"dashboard"}
            errors={errors}
            placeholder={"Dashboard"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"level"}
            errors={errors}
            placeholder={"Level"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"skill"}
            errors={errors}
            placeholder={"Skill"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"worksheet"}
            errors={errors}
            placeholder={"Worksheet"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"report_card"}
            errors={errors}
            placeholder={"Report Card"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"participant"}
            errors={errors}
            placeholder={"Participant"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"user"}
            errors={errors}
            placeholder={"User Management"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"analytics"}
            errors={errors}
            placeholder={"Analytics"}
            register={register}
            className={"mb-5"}
          />
        </div>

        <h3 className="mb-5">Grading</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-5">
          <MkdInput
            type={"text"}
            name={"pass"}
            errors={errors}
            placeholder={"Pass"}
            register={register}
            className={"mb-5"}
          />
          <MkdInput
            type={"text"}
            name={"fail"}
            errors={errors}
            placeholder={"Fail"}
            register={register}
            className={"mb-5"}
          />
        </div>
      </form>
    </Card>
  );
}
