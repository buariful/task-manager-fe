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

export default function EditNameStatusModal({
  showModal,
  refetch,
  selectedRecord,
  setSelectedRecord,
  table,
  modalName,
}) {
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
      const id = selectedRecord?.id;
      const { data: result, error } = await supabase
        .from(table)
        .update({
          name: data?.name,
          status: isActive ? "active" : "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      reset();
      setSelectedRecord({});
      showToast(globalDispatch, `${modalName} updated successfully`);

      // Refresh the list
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, `${modalName} failed to update`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedRecord) {
      setValue("name", selectedRecord?.name || "");
      setIsActive(
        selectedRecord?.status?.toLowerCase() === "active" ? true : false
      );
    }
  }, [selectedRecord]);

  return (
    <div>
      {" "}
      <Modal
        title={`Edit ${modalName}`}
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
              label={"Category Name"}
              placeholder={""}
              register={register}
              className={"mb-5"}
            />

            <ToggleButton
              value={isActive}
              onChangeFunction={setIsActive}
              withLabel={true}
            />
            <div className="flex items-center gap-2"></div>

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
