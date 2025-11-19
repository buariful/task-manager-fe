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
import { AuthContext } from "Context/Auth";

export default function AddLocationModal({ showModal, setShowModal, refetch }) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setLoading] = useState(false);

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
      console.log({
        ...data,
        added_by: state?.user,
        organization_id: state?.organization_id,
      });
      const { data: result, error } = await supabase
        .from("location")
        .insert([
          {
            ...data,
            added_by: state?.user,
            organization_id: state?.organization_id,
          },
        ])
        .select();

      reset();
      setShowModal(null);
      showToast(globalDispatch, `Location added successfully`);

      // Refresh the list
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.log(error?.message);
    }
    setLoading(false);
  };

  return (
    <div>
      {" "}
      <Modal
        title={`Add New Location`}
        isOpen={showModal}
        modalCloseClick={() => setShowModal(null)}
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
                  setShowModal(null);
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
                Add Location
              </InteractiveButton>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
