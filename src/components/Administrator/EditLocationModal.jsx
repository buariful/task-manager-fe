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
import { ToggleButton } from "Components/ToggleButton";
import { useEffect } from "react";

export default function EditLocationModal({
  showModal,
  refetch,
  selectedRecord,
  setSelectedRecord,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState();

  const schema = yup
    .object({
      name: yup.string().required("Name is a required field."),
      street: yup.string().required("Street is a required field."),
      city: yup.string().required("City is a required field."),
      province: yup.string().required("Province is a required field."),
      postal_code: yup.string().required("Postal Code is a required field."),
      phone: yup.string().required("Phone is a required field."),
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
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const id = selectedRecord?.id;
      const { data: result, error } = await supabase
        .from("location")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      reset();
      setSelectedRecord({});
      showToast(globalDispatch, `Location updated successfully`);

      // Refresh the list
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, `Location failed to update`);
    }
    setLoading(false);
  };

  const handleSetValues = () => {
    try {
      const fields = [
        "name",
        "street",
        "city",
        "province",
        "postal_code",
        "phone",
      ];

      fields?.map((field) => setValue(field, selectedRecord[field]));
    } catch (error) {}
  };

  useEffect(() => {
    if (selectedRecord?.id) {
      handleSetValues();
    }
  }, [selectedRecord?.id]);

  return (
    <div>
      {" "}
      <Modal
        title={`Edit Location`}
        isOpen={showModal}
        modalCloseClick={() => setSelectedRecord({})}
        modalHeader={true}
        classes={{ modalDialog: " max-h-[92vh] overflow-auto" }}
      >
        <div className="w-[10rem] sm:w-[25rem] lg:w-[30rem]">
          <form className="" onSubmit={handleSubmit(onSubmit)}>
            <MkdInput
              type={"text"}
              name={"name"}
              errors={errors}
              label={"Location Name"}
              placeholder={""}
              register={register}
              className={"mb-5"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <MkdInput
                type={"text"}
                name={"street"}
                errors={errors}
                label={"Street"}
                placeholder={""}
                register={register}
              />
              <MkdInput
                type={"text"}
                name={"city"}
                errors={errors}
                label={"City"}
                placeholder={""}
                register={register}
              />
              <MkdInput
                type={"text"}
                name={"province"}
                errors={errors}
                label={"Province"}
                placeholder={""}
                register={register}
              />
              <MkdInput
                type={"text"}
                name={"postal_code"}
                errors={errors}
                label={"Postal Code"}
                placeholder={""}
                register={register}
              />
            </div>

            <MkdInput
              type={"text"}
              name={"phone"}
              errors={errors}
              label={"Phone Number"}
              placeholder={""}
              register={register}
              className={"mb-5"}
            />

            <div className="flex items-center gap-7 mt-5">
              <InteractiveButton
                className={
                  "!border-transparent flex-1 hover:!border-secondary px-5"
                }
                isSecondaryBtn={true}
                onClick={() => {
                  setSelectedRecord({});
                }}
              >
                Cancel
              </InteractiveButton>
              <InteractiveButton
                loading={isLoading}
                disabled={isLoading}
                type={"submit"}
                className="flex-1 px-5"
              >
                Save Changes
              </InteractiveButton>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
