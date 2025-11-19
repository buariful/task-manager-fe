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

export default function AddUserModal({ showModal, setShowModal, refetch }) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [roles, setRoles] = useState([]);

  const schema = yup
    .object({
      first_name: yup.string().required("First Name is a required field."),
      last_name: yup.string(),
      email: yup.string().email().required("Email is a required field."),
      role: yup.string().required("Role is a required field."),
      password: yup.string().required("Password is a required field."),
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
      const selectedRole = roles?.find(
        (role) => role?.id === Number(data?.role)
      );
      const payload = {
        ...data,
        role: selectedRole?.access_type,
        role_id: data?.role,
        organization_id: state?.organization_id,
      };
      const { data: result, error } = await supabase.functions.invoke(
        "administrator-create-user",
        { body: JSON.stringify(payload) }
      );

      if (!result?.success) {
        throw new Error(result.error || "Failed to create user");
      }

      showToast(globalDispatch, "User created successfully");
      reset();
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setLoading(false);
    setShowModal(null);
  };

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("roles")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("access_type", "user")

        // .neq("access_type", "administrator")
        // .neq("access_type", "participant")
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

  return (
    <div>
      {" "}
      <Modal
        title={`Add New User`}
        isOpen={showModal}
        modalCloseClick={() => setShowModal(null)}
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
              <div className="flex items-center  gap-5 mb-5 ">
                <MkdInput
                  type={"text"}
                  name={"first_name"}
                  errors={errors}
                  label={"First Name"}
                  placeholder={""}
                  register={register}
                  className={""}
                  parentClassNames="flex-1"
                />
                <MkdInput
                  type={"text"}
                  name={"last_name"}
                  errors={errors}
                  label={"Last Name"}
                  placeholder={""}
                  register={register}
                  parentClassNames="flex-1"
                />
              </div>
              <MkdInput
                type={"text"}
                name={"email"}
                errors={errors}
                label={"Email"}
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
              <MkdInput
                type={"password"}
                name={"password"}
                errors={errors}
                label={"Password"}
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
                  Create User
                </InteractiveButton>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
