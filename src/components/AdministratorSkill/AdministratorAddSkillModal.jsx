import { Modal } from "Components/Modal";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { supabase } from "Src/supabase";
import { RadioInput } from "Components/RadioInput";
import { useState } from "react";
import { GlobalContext, showToast } from "Context/Global";
import { useContext } from "react";
import { useEffect } from "react";
import { AuthContext } from "Context/Auth";
import { Spinner } from "Assets/svgs";

const assistanceTypes = [
  { label: "None", value: "0" },
  { label: "Assisted", value: "1" },
  { label: "Unassisted", value: "2" },
];

export default function AdministratorAddSkillModal({
  showModal,
  refetch,
  setShowModal,
  fnParams = {},
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);

  const [isLoading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [categories, setCategories] = useState([]);

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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      assistance: "0",
    },
  });
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from("skill")
        .insert([
          {
            name: data?.name,
            category_id: data?.category,
            type: Number(data?.assistance),
            status: 1,
            description: data?.description,
            organization_id: 1,
          },
        ])
        .select();

      reset();
      setShowModal(false);
      showToast(globalDispatch, "Skill added successfully");

      // Refresh the list
      if (refetch) {
        refetch(fnParams);
      }
    } catch (error) {
      console.log(error?.message);
    }
    setLoading(false);
  };

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("skill_category")
        .select("*")
        .eq("organization_id", state?.organization_id);

      const dataModified = data?.map((item) => ({
        ...item,
        label: item?.name,
        value: item?.id,
      }));

      setCategories(dataModified);
    } catch (error) {
      console.log(error?.message);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {" "}
      <Modal
        title={"Add New Skill"}
        isOpen={showModal}
        modalCloseClick={() => {
          setShowModal(false), reset();
        }}
        modalHeader={true}
        classes={{ modalDialog: " max-h-[92vh] overflow-auto" }}
      >
        <div className="w-[10rem] sm:w-[25rem] lg:w-[30rem]">
          {isFetching ? (
            <div className="grid place-content-center w-full min-h-32">
              <Spinner size={30} />
            </div>
          ) : (
            <form className="" onSubmit={handleSubmit(onSubmit)}>
              <MkdInput
                type={"text"}
                name={"name"}
                errors={errors}
                label={"Skill Name"}
                placeholder={""}
                register={register}
                className={"mb-5"}
              />
              <MkdInput
                type={"select"}
                name={"category"}
                options={categories || []}
                errors={errors}
                label={"Skill Category"}
                placeholder={""}
                register={register}
                className={"mb-5"}
              />
              <MkdInput
                type={"textarea"}
                name={"description"}
                rows="2"
                errors={errors}
                label={"Skill Description"}
                placeholder={""}
                register={register}
                className={"mb-5"}
              />

              {/* Assistence */}
              <div>
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
                </div>
                {errors.assistance && (
                  <p className="text-red-500">{errors.assistance.message}</p>
                )}
              </div>

              <div className="flex items-center gap-7 mt-5">
                <InteractiveButton
                  className={
                    "!border-transparent flex-1 hover:!border-secondary"
                  }
                  isSecondaryBtn={true}
                  onClick={() => {
                    setShowModal(false);
                  }}
                >
                  Cancel
                </InteractiveButton>
                <InteractiveButton
                  loading={isLoading}
                  disabled={isLoading}
                  type={"submit"}
                  className="flex-1"
                >
                  Add Skill
                </InteractiveButton>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
