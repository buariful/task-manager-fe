import { Card } from "Components/Card";
import { FullPageLoader } from "Components/FullPageLoader";
import { InteractiveButton } from "Components/InteractiveButton";
import { GlobalContext, showToast } from "Context/Global";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "Src/supabase";
import { JsonParseObj, updateColors, uploadFileAndGetUrl } from "Utils/utils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRef } from "react";
import { MkdInput } from "Components/MkdInput";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";

const schema = yup
  .object({
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    zip: yup.string().required("Zip is required"),
    country: yup.string().required("Country is required"),
    status: yup.string().required("Status is required"),
  })
  .required();

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function AdministratorEditOrgDetailPage() {
  const [org, setOrg] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [legalInformation, setLegalInformation] = useState("");
  const [colors, setColors] = useState({
    primary: "",
    secondary: "",
  });
  const [logo, setLogo] = useState({
    preview: "",
    file: null,
  });
  const [loginPageImage, setLoginPageImage] = useState({
    preview: "",
    file: null,
  });

  const formRef = useRef(null);
  const { id } = useParams();

  const authState = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { organization_id } = authState?.state;

  const {
    register,
    handleSubmit,

    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  const fetchOrg = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("organization")
        .select("*, license(*)")
        .eq("id", organization_id)
        .single(); // fetch single organization

      if (error) {
        console.error("Error fetching org:", error);
      }

      const {
        address,
        zip,
        city,
        country,
        state,
        logo,
        login_page_image,
        legal_information,
      } = data;
      const colors = JsonParseObj(data?.colors);
      const orgDetails = { ...data, colors };

      setValue("address", address || "");
      setValue("zip", zip || "");
      setValue("city", city || "");
      setValue("country", country || "");
      setValue("state", state || "");
      setValue("status", data?.status || "active");
      setOrg(orgDetails);
      setLegalInformation(legal_information || "");
      setColors(colors || { primary: "#67C090", secondary: "#26667F" });
      setLogo((prev) => ({ ...prev, preview: logo || "" }));
      setLoginPageImage((prev) => ({
        ...prev,
        preview: login_page_image || "",
      }));
    } catch (error) {
      console.log("failed to fetch", error?.message);
    }
    setIsFetching(false);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // upload logo if exists
      const logoUrl = await uploadFileAndGetUrl(logo.file);
      const loginPageImageUrl = await uploadFileAndGetUrl(loginPageImage.file);
      if (loginPageImageUrl) {
        localStorage.setItem("login_page_image", loginPageImageUrl);
      }

      // update organization
      const { data: updatedOrg, error: updateError } = await supabase
        .from("organization")
        .update({
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          status: data.status,
          legal_information: legalInformation,
          colors: JSON.stringify(colors),

          ...(logoUrl && { logo: logoUrl }), // update logo only if uploaded
          ...(loginPageImageUrl && { login_page_image: loginPageImageUrl }), // update login page image only if uploaded
          updated_at: new Date().toISOString(),
        })
        .eq("id", organization_id)
        .select();

      if (updateError) {
        console.error("Update error:", updateError.message);
        return;
      }

      updateColors(colors);
      showToast(globalDispatch, "Organization updated successfully");
      navigate("/administrator/org-detail");
    } catch (error) {
      console.error(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to update",
        4000,
        "error"
      );
    }
    setIsLoading(false);
  };

  const handleColorChange = (e, colorType) => {
    const newColor = e.target?.value;
    setColors((prevColors) => ({
      ...prevColors,
      [colorType]: newColor,
    }));
  };

  const handleLogoChange = (e) => {
    try {
      const file = e.target?.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setLogo({ preview: previewUrl, file: file });
      }
    } catch (error) {
      console.log("Logo upload error", error?.message);
    }
  };
  const handleLoginPageImageChange = (e) => {
    try {
      const file = e.target?.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setLoginPageImage({ preview: previewUrl, file: file });
      }
    } catch (error) {
      console.log("Login page image upload error", error?.message);
    }
  };

  useEffect(() => {
    if (organization_id) {
      fetchOrg();
    }
  }, [organization_id]);

  if (isFetching) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          <Link to="/administrator/org-detail">
            <FaArrowLeft />
          </Link>
          <h2>Organization Details</h2>
        </div>

        <div className="flex items-center gap-2">
          <InteractiveButton
            onClick={() => navigate("/administrator/org-detail")}
            className="px-7"
            isSecondaryBtn={true}
          >
            Cancel
          </InteractiveButton>
          <InteractiveButton
            onClick={() => formRef?.current?.requestSubmit()}
            className="px-7"
            loading={isLoading}
          >
            Save Changes
          </InteractiveButton>
        </div>
      </div>
      {/* Card */}
      <Card>
        {/* Official Address */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Official Address
          </h3>
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2  gap-10"
          >
            <MkdInput
              type={"text"}
              name={"address"}
              errors={errors}
              label={"Address"}
              placeholder={""}
              register={register}
              className={"mb-0"}
            />
            <MkdInput
              type={"text"}
              name={"city"}
              errors={errors}
              label={"City"}
              placeholder={""}
              register={register}
              className={"mb-0"}
            />
            <MkdInput
              type={"text"}
              name={"state"}
              errors={errors}
              label={"State/Province"}
              placeholder={""}
              register={register}
              className={"mb-0"}
            />
            <MkdInput
              type={"text"}
              name={"country"}
              errors={errors}
              label={"Country"}
              placeholder={""}
              register={register}
              className={"mb-0"}
            />
            <MkdInput
              type={"text"}
              name={"zip"}
              errors={errors}
              label={"ZIP/Postal Code"}
              placeholder={""}
              register={register}
              className={"mb-0"}
            />
            <MkdInput
              type={"dropdown"}
              name={"Status"}
              errors={errors}
              label={"Status"}
              placeholder={""}
              register={register}
              className={"mb-0"}
              options={statusOptions}
            />
          </form>
        </div>

        {/* Branding */}
        <div className="border-t border-t-neutral-border-r-neutral-gray pt-9">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Branding</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Logo */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Logo</p>
              {logo?.preview ? (
                <img src={logo?.preview} className="w-24 h-16" alt="" />
              ) : (
                <div className="w-24 h-16 bg-input-bg rounded" />
              )}
              <label className="mt-2 text-sm text-primary cursor-pointer hover:underline">
                Replace
                <input
                  type="file"
                  name="logo"
                  id=""
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
            </div>

            {/* Login page image */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Login page Image</p>
              {loginPageImage?.preview ? (
                <img
                  src={loginPageImage?.preview}
                  className="w-24 h-16"
                  alt=""
                />
              ) : (
                <div className="w-24 h-16 bg-input-bg rounded" />
              )}
              <label className="mt-2 text-sm text-primary cursor-pointer hover:underline">
                Replace
                <input
                  type="file"
                  name="loginPageImage"
                  id=""
                  className="hidden"
                  onChange={handleLoginPageImageChange}
                />
              </label>
            </div>

            {/* Primary colour */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Primary Colour</p>
              <div className="flex items-center gap-2 relative">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors?.primary }}
                />

                <label>
                  {colors?.primary}
                  <input
                    type="color"
                    className="hidden"
                    onChange={(e) => handleColorChange(e, "primary")}
                  />
                </label>
              </div>
            </div>
            {/* Secondary colour */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Secondary Colour</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors?.secondary }}
                />
                <label>
                  {colors?.secondary}
                  <input
                    type="color"
                    className="hidden"
                    onChange={(e) => handleColorChange(e, "secondary")}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* legal information */}
        <div className={`mb-4 mt-10 ${"w-full pl-2 pr-2 md:w-1/2"}`}>
          <label
            className={`mb-2 block cursor-pointer text-sm font-[400] `}
            htmlFor={"legal_information"}
          >
            Legal Information
          </label>
          <textarea
            className={`focus:shadow-outline border-0 focus:ring-0 w-full border-b border-b-accent  appearance-none bg-input-bg px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none`}
            id={"legal_information"}
            value={legalInformation}
            placeholder={"Legal Information"}
            // rows={rows}
            onChange={(e) => {
              setLegalInformation(e.target.value);
            }}
          />
        </div>
      </Card>
    </div>
  );
}
