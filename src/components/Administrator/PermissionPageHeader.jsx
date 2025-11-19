import { InteractiveButton } from "Components/InteractiveButton";
import { Modal } from "Components/Modal";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";
import { buildDefaultPermissions } from "Utils/utils";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import { supabase } from "Src/supabase";
import { GlobalContext, showToast } from "Context/Global";
import { useAdministratorPermission } from "Context/Custom";

export default function PermissionPageHeader() {
  const navigate = useNavigate();
  const { state } = useContext(AuthContext);
  const { setRoles } = useAdministratorPermission();

  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const organizationId = state?.organization_id;

  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const schema = yup
    .object({
      name: yup.string().required(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // creating role
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .insert([{ name: data?.name, organization_id: organizationId }])
        .select()
        .single();

      if (roleError) {
        showToast(
          globalDispatch,
          error?.message || "Failed to create role",
          4000,
          "error"
        );
        setLoading(false);
        return;
      }

      const role_id = roleData?.id;
      const rows = buildDefaultPermissions(role_id, organizationId, data?.name);

      // adding permission
      const { error } = await supabase.from("permission").insert(rows).select();

      if (error) {
        console.error("Bulk insert failed:", error.message);
        throw error;
      }

      setRoles((prev) => [...prev, roleData]);
    } catch (error) {
      showToast(
        globalDispatch,
        error?.message || "Failed to create role",
        4000,
        "error"
      );
    }
    setShowModal(false);
    setLoading(false);
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          <Link to="/administrator/dashboard">
            <FaArrowLeft />
          </Link>
          <h2>Permission Console</h2>
        </div>

        <InteractiveButton
          onClick={() => setShowModal(true)}
          className="px-7"
          isSecondaryBtn={true}
        >
          Create Role
        </InteractiveButton>
      </div>

      <Modal
        title={"Add New Role"}
        isOpen={showModal}
        modalCloseClick={() => setShowModal(false)}
        modalHeader={true}
        classes={{ modalDialog: " max-h-[92vh] overflow-auto" }}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[10rem] sm:w-[25rem] lg:w-[30rem]"
        >
          <MkdInput
            type={"text"}
            name={"name"}
            errors={errors}
            label={"Role Name"}
            placeholder={""}
            register={register}
            className={"mb-5"}
          />
          <div className="flex items-center gap-5">
            <InteractiveButton
              onClick={() => setShowModal(false)}
              isSecondaryBtn={true}
              className="flex-1"
            >
              Cancel
            </InteractiveButton>
            <InteractiveButton
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Create Role
            </InteractiveButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
