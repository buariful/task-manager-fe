import { DetailPageHeader } from "Components/DetailPageHeader";
import { PageWrapper } from "Components/PageWrapper";
import React from "react";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AdminCreateForm } from "Components/Organization";
import { useState, useEffect, useContext } from "react";
import { supabase } from "Src/supabase";
import { GlobalContext, showToast } from "Context/Global";
import { FullPageLoader } from "Components/FullPageLoader";
import { Spinner } from "Assets/svgs";
import { useSearchParams } from "react-router-dom";

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

export default function SuperAdminEditOrgAdminPage() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isFetching, setIsFetching] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isActive, setIsActive] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formRef = useRef();
  const { id } = useParams();

  const organizationId = searchParams.get("organization_id");

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { contact_number, first_name, last_name } = data;

      const userPayload = {
        first_name,
        last_name,
        status: isActive ? "active" : "inactive",
        phone: contact_number,
        updated_at: new Date().toISOString(),
      };

      // ✅ Update the existing user by ID
      const { error } = await supabase
        .from("user_profile")
        .update(userPayload)
        .eq("id", id);

      if (error) {
        console.log("error->>", error?.message);
        showToast(globalDispatch, "Failed to update admin", 4000, "error");
      } else {
        showToast(globalDispatch, "Global admin updated successfully");
      }
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, "Failed to update admin", 4000, "error");
    } finally {
      setIsLoading(false);
      navigate("/super-admin/organization");
    }
  };

  const handleExternalSubmit = () => {
    formRef?.current?.requestSubmit(); // triggers native submit
  };

  // ✅ Fetch user data by ID
  const getData = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        // set form values
        setValue("first_name", data.first_name || "");
        setValue("last_name", data.last_name || "");
        setValue("email", data.email || "");
        setValue("contact_number", data.phone || "");
        setIsActive(data.status?.toLowerCase() === "active");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error.message);
      showToast(globalDispatch, "Failed to fetch admin details", 4000, "error");
    }
    setIsFetching(false);
  };

  // ✅ Call getData on mount
  useEffect(() => {
    if (id) getData();
  }, [id]);

  return (
    <PageWrapper>
      <DetailPageHeader
        backLink={"/super-admin/organization"}
        pageTitle={"Organization Admin"}
        cancelFunction={() => navigate(`/super-admin/organization`)}
        isLoading={isLoading}
        showSubmitButton={true}
        submitBtnText="Update"
        submitFunction={handleExternalSubmit}
      />
      {isFetching ? (
        <div className="flex justify-center">
          <Spinner size={50} />
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <AdminCreateForm
            errors={errors}
            register={register}
            isActive={isActive}
            setIsActive={setIsActive}
            disabledFields={["email"]}
          />
        </form>
      )}
    </PageWrapper>
  );
}
