import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PageWrapper } from "Components/PageWrapper";
import {
  AdminCreateForm,
  AddOrganizationDetailsForm,
  AddOrganizationHeader,
} from "Components/Organization";
import { useContext } from "react";
import { GlobalContext, showToast } from "Context/Global";
import { useState } from "react";
import { useRef } from "react";
import {
  buildDefaultPermissions,
  defaultColors,
  uploadFileAndGetUrl,
} from "Utils/utils";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const schema = yup
  .object({
    name: yup.string().required("Level name is required"),
    join_date: yup.string().required("Join date is required"),
    expiry_date: yup.string().required("Expiry date is required"),
    no_of_license: yup
      .number("Number of license is required")
      .transform((value, originalValue) => {
        // if the user leaves the field empty, treat it as undefined
        return originalValue === "" ? undefined : value;
      })
      .required("Number of license is required")
      .min(1, "Minimum number is 1"),
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State/Province is required"),
    country: yup.string().required("Country is required"),
    zip: yup.string().required("Zip code is required"),
    status: yup.string().required("Status is required"),
    legal_information: yup.string(),
    first_name: yup.string().required("First name is required"),
    last_name: yup.string(),
    email: yup
      .string()
      .email("Email must be a valid email")
      .required("Email is required"),
    contact_number: yup.string(),
  })
  .required();

export default function SuperAdminAddOrganizationPage() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { satate: authState } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState({
    preview: "",
    file: null,
  });
  const [loginPageImage, setLoginPageImage] = useState({
    preview: "",
    file: null,
  });
  const [colors, setColors] = useState({
    primary: "#67C090",
    secondary: "#56b381",
  });

  const formRef = useRef(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,

    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleExternalSubmit = () => {
    formRef?.current?.requestSubmit(); // triggers native submit
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const {
        address,
        city,
        contact_number,
        country,
        email,
        expiry_date,
        first_name,
        last_name,
        join_date,
        legal_information,
        name,
        no_of_license,
        state,
        status,
        zip,
      } = data;

      // checking the email
      const { data: profileUser, error: profileError } = await supabase
        .from("user_profile")
        .select("id, email")
        .eq("email", email)
        .maybeSingle();

      if (profileUser?.id) {
        setIsLoading(false);
        showToast(
          globalDispatch,
          "An user exist with the same email",
          4000,
          "error"
        );
        return;
      }

      // 1: uploading logo and login image
      const logoUrl = await uploadFileAndGetUrl(logo.file);
      const loginPageImageUrl = await uploadFileAndGetUrl(loginPageImage.file);

      // 2: creating organization
      const payload = {
        name,
        address,
        city,
        state,
        country,
        zip,
        status,
        logo: logoUrl || "",
        login_page_image: loginPageImageUrl || "",
        legal_information,
        colors: JSON.stringify({
          ...defaultColors,
          primary: colors?.primary || defaultColors?.primary,
          secondary: colors?.secondary || defaultColors?.secondary,
        }),
      };
      const { data: organization, error: organizationError } = await supabase
        .from("organization")
        .insert([payload])
        .select()
        .single();
      if (organizationError) {
        console.log(organizationError?.message);
        throw organizationError;
      }
      const organizationId = organization?.id;

      // 3: create license for the organization
      const { data: license, error: licenseError } = await supabase
        .from("license")
        .insert([
          {
            organization_id: organizationId,
            joined_at: join_date,
            expire_at: expiry_date,
            no_of_license,
          },
        ])
        .select()
        .single();
      if (organizationError) {
        console.log(organizationError?.message);
        throw organizationError;
      }

      // 4: Creating role and permissions
      const { data: role, error: roleCreateError } = await supabase
        .from("roles")
        .insert([
          {
            name: "administrator",
            organization_id: organizationId,
            added_by: authState?.user,
            access_type: "administrator",
          },
        ])
        .select()
        .single();
      if (roleCreateError) {
        console.log(roleCreateError?.message);
        throw new Error("Failed to create role");
      }

      const rows = buildDefaultPermissions(
        role?.id,
        organizationId,
        "administrator"
      );
      const { data: permissions, error: permissionCreateError } = await supabase
        .from("permission")
        .insert(rows)
        .select();
      if (permissionCreateError) {
        console.log(permissionCreateError?.message);
        throw new Error(
          "Failed to create the permissions for the administrator"
        );
      }

      // 5: Creating role and permissions
      const { data: labels, error: labelError } = await supabase
        .from("organization_labels")
        .insert([
          {
            level: "Level",
            skill: "Skill",
            report_card: "Report Card",
            worksheet: "Worksheet",
            pass: "Pass",
            fail: "Fail",
            organization_id: organizationId,
            dashboard: "Dashboard",
            participant: "Participant",
            user: "User Management",
            analytics: "Analytics",
          },
        ])
        .select()
        .single();
      if (labelError) {
        console.log(labelError?.message);
        throw new Error("Failed to create labels");
      }

      //6: creating administrator user
      const userPayload = {
        first_name,
        last_name,
        email,
        role: "administrator",
        role_id: role?.id,
        organization_id: organizationId,
        password: "a1234567",
        status: isActive ? "active" : "inactive",
        phone: contact_number,
      };
      const { error } = await supabase.functions.invoke(
        "administrator-create-user",
        { body: JSON.stringify(userPayload) }
      );

      if (error) {
        showToast(
          globalDispatch,
          "Failed to create the administrator.",
          3000,
          "error"
        );
      } else {
        showToast(globalDispatch, "Organization created successfully");
        navigate("/super-admin/organization");
      }
    } catch (error) {
      console.log("onSubmit->>", error?.message);
      showToast(
        globalDispatch,
        "Failed to create the organizaiton",
        4000,
        "error"
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const requiredFields = [
      "name",
      "join_date",
      "expiry_date",
      "no_of_license",
      "address",
      "city",
      "state",
      "country",
      "zip",
      "status",
      // "first_name",
      // "email",
    ];

    const hasErrorInTab1 = requiredFields.some((field) => errors[field]);

    if (hasErrorInTab1) {
      setSelectedTab(1);
    }
  }, [errors]);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "organization",
      },
    });
  }, []);

  return (
    <PageWrapper>
      <AddOrganizationHeader
        handleSubmitFunction={handleExternalSubmit}
        isLoading={isLoading}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <div className={` ${selectedTab === 1 ? "block" : "hidden"}`}>
          <AddOrganizationDetailsForm
            errors={errors}
            register={register}
            setValue={setValue}
            getValues={getValues}
            logo={logo}
            setLogo={setLogo}
            loginPageImage={loginPageImage}
            setLoginPageImage={setLoginPageImage}
            colors={colors}
            setColors={setColors}
          />
        </div>
        <div className={`${selectedTab === 2 ? "block" : "hidden"}`}>
          <AdminCreateForm
            errors={errors}
            register={register}
            isActive={isActive}
            setIsActive={setIsActive}
          />
        </div>
      </form>
    </PageWrapper>
  );
}
