import { Modal } from "Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { supabase } from "Src/supabase";
import { RadioInput } from "Components/RadioInput";
import { useState, useEffect } from "react";
import { GlobalContext, showToast } from "Context/Global";
import { useContext } from "react";
import { ToggleButton } from "Components/ToggleButton";

export default function AdministratorEditSkillModal({
  showModal,
  setShowModal,
  skillId,
  refetch,
  fnParams,
  isWithEnableDisableToggle = true,
}) {
  const [isLoading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [skillData, setSkillData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(false);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const schema = yup
    .object({
      name: yup.string().required("Skill name is a required field."),
      category: yup.string().required("Category is a required field."),
      description: yup.string(),
      assistance: yup.string().required("Assistance is a required field."),
    })
    .required();

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

  const fetchSkillData = async () => {
    if (!skillId) return;

    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from("skill")
        .select("*, skill_category(id, name)")
        .eq("id", skillId)
        .single();

      if (error) {
        console.error("Error fetching skill:", error);
        showToast(globalDispatch, "Error fetching skill data", "error");
        return;
      }

      setSkillData(data);

      // Populate form fields
      setValue("name", data?.name);
      setValue("category", data?.category_id?.toString());
      setValue("description", data.description || "");
      setValue("assistance", data?.type?.toString() || "");
      setStatus(data?.status === 1);
    } catch (error) {
      console.error("Error fetching skill:", error);
      showToast(globalDispatch, "Error fetching skill data", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("skill_category")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("skill")
        .update({
          name: data?.name,
          category_id: parseInt(data?.category),
          type: parseInt(data?.assistance),
          description: data?.description,
          status: status ? 1 : 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", skillId)
        .select();

      if (error) {
        console.error("Error updating skill:", error);
        showToast(globalDispatch, "Error updating skill", "error");
        return;
      }

      reset();
      setShowModal(false);
      showToast(globalDispatch, "Skill updated successfully");

      // Refresh the list
      if (refetch) {
        refetch(fnParams);
      }
    } catch (error) {
      console.error("Error updating skill:", error);
      showToast(globalDispatch, "Error updating skill", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset();
    setSkillData(null);
  };

  const assistanceTypes = [
    { label: "None", value: "0" },
    { label: "Assisted", value: "1" },
    { label: "Unassisted", value: "2" },
  ];

  const getData = async () => {
    try {
      await fetchCategories();
      fetchSkillData();
    } catch (error) {}
  };

  // Fetch skill data when modal opens and skillId changes
  useEffect(() => {
    if (showModal && skillId) {
      getData();
    }
  }, [showModal, skillId]);

  return (
    <div>
      <Modal
        title={"Edit Skill"}
        isOpen={showModal}
        modalCloseClick={handleModalClose}
        modalHeader={true}
        classes={{ modalDialog: " max-h-[92vh] overflow-auto" }}
      >
        <div className="w-[10rem] sm:w-[25rem] lg:w-[30rem]">
          {fetchLoading ? (
            <div className="space-y-5">
              LOADING....
              {/* <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-7">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div> */}
            </div>
          ) : (
            <form className="" onSubmit={handleSubmit(onSubmit)}>
              <MkdInput
                type={"text"}
                name={"name"}
                errors={errors}
                label={"Skill Name"}
                placeholder={"Enter skill name"}
                register={register}
                className={"mb-5"}
              />

              <MkdInput
                type={"select"}
                name={"category"}
                options={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id.toString(),
                }))}
                errors={errors}
                label={"Skill Category"}
                placeholder={"Select category"}
                register={register}
                className={"mb-5"}
              />

              <MkdInput
                type={"textarea"}
                name={"description"}
                rows="3"
                errors={errors}
                label={"Skill Description"}
                placeholder={"Enter skill description"}
                register={register}
                className={"mb-5"}
              />

              {/* Assistance Type */}
              <div className="mb-5">
                <div className="flex flex-wrap items-center gap-3 lg:gap-10">
                  {assistanceTypes?.map((item, i) => (
                    <RadioInput
                      key={i}
                      label={item?.label}
                      value={item?.value}
                      name={"assistance"}
                      register={register}
                    />
                  ))}

                  {isWithEnableDisableToggle ? (
                    <ToggleButton
                      value={status}
                      onChangeFunction={(v) => {
                        setStatus(v);
                        console.log(v);
                      }}
                      withLabel={true}
                    />
                  ) : null}
                </div>
                {errors.assistance && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.assistance.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-7 mt-5">
                <InteractiveButton
                  className={
                    "!border-transparent flex-1 hover:!border-secondary"
                  }
                  isSecondaryBtn={true}
                  onClick={handleModalClose}
                  type="button"
                >
                  Cancel
                </InteractiveButton>
                <InteractiveButton
                  loading={isLoading}
                  disabled={isLoading}
                  type={"submit"}
                  className="flex-1"
                >
                  Update Skill
                </InteractiveButton>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
