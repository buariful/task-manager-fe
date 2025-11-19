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
import { Spinner } from "Assets/svgs";

export default function EditUserModal({
  showModal,
  refetch,
  selectedRecord,
  setSelectedRecord,
  handleToggleButton,
  isWithEnableDisableToggle = true,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);

  const [isLoading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [roles, setRoles] = useState([]);

  const schema = yup
    .object({
      first_name: yup.string().required("First Name is a required field."),
      last_name: yup.string(),
      unique_id: yup.string().required("Unique id is required"),
      // contact_number: yup.string().required("Contact number id is required"),
      parent_email: yup
        .string()
        .email()
        .required("Parent email is a required field."),
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
      const selectedRole = roles?.find(
        (role) => role?.id === Number(data?.role)
      );
      const payload = {
        ...data,
        status: isActive ? "active" : "inactive",
        updated_at: new Date().toISOString(),
      };
      const { data: result, error } = await supabase
        .from("participant")
        .update({
          ...payload,
        })
        .eq("id", id)
        .select();

      reset();
      setSelectedRecord({});
      showToast(globalDispatch, `User updated successfully`);

      // Refresh the list
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, `User failed to update`);
    }
    setLoading(false);
  };

  const handleSetValues = () => {
    try {
      setValue("first_name", selectedRecord?.first_name);
      setValue("last_name", selectedRecord?.last_name);
      setValue("parent_email", selectedRecord?.parent_email);
      // setValue("contact_number", selectedRecord?.contact_number);
      setValue("unique_id", selectedRecord?.unique_id);
      setIsActive(selectedRecord?.status?.toLowerCase() === "active");
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
        title={`Edit Participant`}
        isOpen={showModal}
        modalCloseClick={() => setSelectedRecord({})}
        modalHeader={true}
        classes={{ modalDialog: " max-h-[92vh] overflow-auto" }}
      >
        <div className="w-[10rem] sm:w-[25rem] lg:w-[30rem]">
          {isFetching ? (
            <div className="grid place-content-center">
              <Spinner size={30} color="#000" />
            </div>
          ) : (
            <form className="" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <MkdInput
                  type={"text"}
                  name={"first_name"}
                  errors={errors}
                  label={"First Name"}
                  placeholder={""}
                  register={register}
                  parentClassNames="!mb-0"
                />
                <MkdInput
                  type={"text"}
                  name={"last_name"}
                  errors={errors}
                  label={"Last Name"}
                  placeholder={""}
                  register={register}
                  parentClassNames="!mb-0"
                />

                {/* <MkdInput
                  type={"text"}
                  name={"contact_number"}
                  errors={errors}
                  label={"Contact Number"}
                  placeholder={""}
                  register={register}
                  /> */}
              </div>
              <MkdInput
                type={"text"}
                name={"unique_id"}
                errors={errors}
                disabled
                label={"Unique Id"}
                placeholder={""}
                register={register}
              />
              <MkdInput
                type={"email"}
                name={"parent_email"}
                disabled
                errors={errors}
                label={"Parent Email Address"}
                placeholder={""}
                register={register}
                className={"mb-10"}
              />

              <div>
                {isWithEnableDisableToggle ? (
                  <ToggleButton
                    withLabel={true}
                    value={isActive}
                    onChangeFunction={(v) => setIsActive(v)}
                  />
                ) : null}
              </div>

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
          )}
        </div>
      </Modal>
    </div>
  );
}
