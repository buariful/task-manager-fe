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
      email: yup.string().email().required("Email is a required field."),
      role: yup.string().required("Role is a required field."),
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
        first_name: data?.first_name,
        last_name: data?.last_name,
        role: selectedRole?.access_type,
        role_id: data?.role,
        status: isActive ? "active" : "inactive",
        updated_at: new Date().toISOString(),
      };
      const { data: result, error } = await supabase
        .from("user_profile")
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
      setValue("email", selectedRecord?.email);
      setValue("role", selectedRecord?.role_id);
      setIsActive(selectedRecord?.status?.toLowerCase() === "active");
    } catch (error) {}
  };

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("access_type", "user")
        .order("id", { ascending: false });

      const dataModified = data?.map((item) => ({
        ...item,
        label: item?.name,
        value: item?.id,
      }));
      setRoles(dataModified);
    } catch (error) {
      console.log(error?.message);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    if (state?.organization_id) {
      getData();
    }
  }, [state?.organization_id]);

  useEffect(() => {
    if (selectedRecord?.id) {
      handleSetValues();
    }
  }, [selectedRecord?.id]);

  return (
    <div>
      {" "}
      <Modal
        title={`Edit User`}
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
              <div className="flex items-center gap-5 flex-wrap mb-5">
                <MkdInput
                  type={"text"}
                  name={"first_name"}
                  errors={errors}
                  label={"First Name"}
                  placeholder={""}
                  register={register}
                />
                <MkdInput
                  type={"text"}
                  name={"last_name"}
                  errors={errors}
                  label={"Last Name"}
                  placeholder={""}
                  register={register}
                />
              </div>
              <MkdInput
                type={"text"}
                name={"email"}
                errors={errors}
                label={"Email"}
                disabled
                placeholder={""}
                register={register}
                className={"mb-5"}
              />
              <MkdInput
                type={"select"}
                name={"role"}
                errors={errors}
                label={"Role"}
                placeholder={""}
                register={register}
                options={roles}
              />

              <div>
                <ToggleButton
                  withLabel={true}
                  value={isActive}
                  onChangeFunction={(v) => setIsActive(v)}
                />
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
