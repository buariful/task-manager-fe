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

export default function AddRecordWithNameModal({
  showModal,
  setShowModal,
  refetch,
  table,
  modalName,
}) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState();

  const schema = yup
    .object({
      name: yup.string().required("Name is a required field."),
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
      if (!table) {
        showToast(globalDispatch, "Table name was not found", 4000, "error");
        setLoading(false);
        return;
      }
      const { data: result, error } = await supabase
        .from(table)
        .insert([
          {
            name: data?.name,
            status: "active",
            added_by: state?.user,
            organization_id: state?.organization_id,
          },
        ])
        .select();

      reset();
      setShowModal(null);
      showToast(globalDispatch, `${modalName} added successfully`);

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
        title={`Add New ${modalName}`}
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
              label={"Category Name"}
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
                Add {modalName}
              </InteractiveButton>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
