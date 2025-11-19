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
import { getRoleId } from "Utils/utils";

export default function AddParticipantModal({
  showModal,
  setShowModal,
  refetch,
}) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setLoading] = useState(false);
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

  const getParentId = async (data) => {
    try {
      const { data: user } = await supabase
        .from("user_profile")
        .select("*")
        .eq("email", data?.parent_email);

      let parentId;
      if (user?.length) {
        // if the user is parent
        const { role, id } = user[0];
        if (role !== "parent") {
          showToast(
            globalDispatch,
            "The parent email is not valid",
            4000,
            "error"
          );
          setLoading(false);
          return;
        }

        parentId = id;
      } else {
        const roleId = await getRoleId({
          accessType: "parent",
          organizationId: state?.organization_id,
          roleName: "parent",
        });

        const userPayload = {
          first_name: data?.first_name + "'s parent",
          email: data?.parent_email,
          role: "parent",
          role_id: roleId,
          password: "a1234567",
          status: "active",
          organization_id: state?.organization_id,
          // phone: data?.contact_number,
        };
        const { data: parentData, error } = await supabase.functions.invoke(
          "administrator-create-user",
          { body: JSON.stringify(userPayload) }
        );

        if (error) {
          showToast(
            globalDispatch,
            "Failed to create parent with the email",
            4000,
            "error"
          );
          setLoading(false);
          return;
        }
        parentId = parentData?.user_profile?.id;
      }
      return parentId;
    } catch (error) {
      console.log("getParentId->>", error?.message);
      showToast(
        globalDispatch,
        "Failed to get parent information",
        4000,
        "error"
      );
      return null;
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // check the unique id
      const existedUniqueIds = await checkUniqueId(data?.unique_id);
      if (existedUniqueIds?.length) {
        setLoading(false);
        return;
      }

      // get the parent id
      const parentId = await getParentId(data);
      if (!parentId) {
        setLoading(false);
        return;
      }

      // participant create
      const { data: result, error } = await supabase
        .from("participant")
        .insert([
          {
            ...data,
            parent_id: parentId,
            status: "active",
            organization_id: state?.organization_id,
          },
        ])
        .select();
      if (error) {
        throw new Error("Failed to create participant");
      }

      showToast(globalDispatch, "Participant created successfully");
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.log("addParticipantModal/onSubmit ->>", error?.message);
      showToast(globalDispatch, "Failed to create participant", 4000, "error");
    }
    reset();
    setLoading(false);
    setShowModal(null);
  };

  const checkUniqueId = async (id) => {
    try {
      // const value = e?.target?.value?.trim();
      const value = id?.trim();

      if (!value) return;

      const { data } = await supabase
        .from("participant")
        .select("id")
        .eq("organization_id", state?.organization_id)
        .ilike("unique_id", value);

      if (data?.length) {
        setError("unique_id", {
          type: "manual",
          message: "Duplicate unique id found",
        });
      }
      return data;
    } catch (error) {
      console.log("checkUniqueId->>", error?.message);
      return [];
    }
  };

  const handleModalClose = () => {
    try {
      reset();
      setShowModal(null);
    } catch (error) {
      console.log("handleModalClose->>", error?.message);
    }
  };

  return (
    <div>
      {" "}
      <Modal
        title={`Add New Participant`}
        isOpen={showModal}
        modalCloseClick={handleModalClose}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
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
                label={"Unique Id"}
                placeholder={""}
                register={register}
                onBlur={(e) => checkUniqueId(e?.target?.value)}
              />
              <MkdInput
                type={"email"}
                name={"parent_email"}
                errors={errors}
                label={"Parent Email Address"}
                placeholder={""}
                register={register}
                className={"mb-10"}
              />

              <div className="flex items-center gap-7 mt-5">
                <InteractiveButton
                  className={""}
                  isSecondaryBtn={true}
                  onClick={handleModalClose}
                >
                  {/* !border-transparent flex-1 hover:!border-secondary px-5 */}
                  Cancel
                </InteractiveButton>
                <InteractiveButton
                  loading={isLoading}
                  disabled={isLoading}
                  type={"submit"}
                  className="flex-1 px-5"
                >
                  Add Participant
                </InteractiveButton>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
