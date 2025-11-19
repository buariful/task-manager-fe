import { DetailPageHeader } from "Components/DetailPageHeader";
import { PageWrapper } from "Components/PageWrapper";
import React from "react";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AdminCreateForm } from "Components/Organization";
import { useState } from "react";
import { supabase } from "Src/supabase";
import { GlobalContext, showToast } from "Context/Global";
import { useContext } from "react";

const schema = yup
  .object({
    first_name: yup.string().required("First name is required"),
    last_name: yup.string(),
    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),
    contact_number: yup.string(),
  })
  .required();

export default function SuperAdminAddOrganizationAdminPage() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isActive, setIsActive] = useState(true);

  const navigate = useNavigate();
  const formRef = useRef();
  const { organizationId } = useParams();
  console.log(organizationId);
  const {
    register,
    handleSubmit,

    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getRoleId = async () => {
    try {
      const { data } = await supabase
        .from("roles")
        .select("*")
        .ilike("name", `%administrator%`)
        .eq("organization_id", organizationId);

      if (data?.length) {
        return data[0]?.id;
      } else {
        const { data: newRole } = await supabase
          .from("roles")
          .insert([{ name: "administrator", access_type: "administrator" }])
          .select()
          .single();
        return newRole?.id;
      }
    } catch (error) {}
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const roleId = await getRoleId();

      const { contact_number, email, first_name, last_name } = data;
      const userPayload = {
        first_name,
        last_name,
        email,
        role: "administrator",
        role_id: roleId,
        password: "a1234567",
        status: isActive ? "active" : "inactive",
        phone: contact_number,
        organization_id: organizationId,
      };
      const { error } = await supabase.functions.invoke(
        "administrator-create-user",
        { body: JSON.stringify(userPayload) }
      );

      if (error) {
        console.log("error->>", error?.message);
        showToast(globalDispatch, "Failed to create admin", 4000, "error");
      }
      showToast(globalDispatch, "Global admin created successfully");
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, "Failed to create admin", 4000, "error");
    }
    setIsLoading(false);
    navigate(`/super-admin/view-organization/${organizationId}`);
  };

  const handleExternalSubmit = () => {
    formRef?.current?.requestSubmit();
  };

  return (
    <PageWrapper>
      {/*  */}
      <DetailPageHeader
        backLink={"/super-admin/global-admin"}
        pageTitle={"Create Admin"}
        cancelFunction={() => navigate("/super-admin/global-admin")}
        isLoading={isLoading}
        showSubmitButton={true}
        submitBtnText="Create"
        submitFunction={handleExternalSubmit}
      />

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <AdminCreateForm
          errors={errors}
          register={register}
          isActive={isActive}
          setIsActive={setIsActive}
        />
      </form>
    </PageWrapper>
  );
}
