import React from "react";
import { MkdInput } from "Components/MkdInput";
import { useRef } from "react";
import { FaMinus, FaPlus, FaPlusMinus } from "react-icons/fa6";
import { useLevel } from "Context/Level/LevelContext";
import { FaTrashAlt } from "react-icons/fa";
import { useState } from "react";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function AddOrganizationDetailsForm({
  errors,
  register,
  setValue,
  getValues,
  logo,
  setLogo,
  loginPageImage,
  setLoginPageImage,
  colors,
  setColors,
}) {
  //   const [logo, setLogo] = useState({
  //     preview: "",
  //     file: null,
  //   });
  //   const [loginPageImage, setLoginPageImage] = useState({
  //     preview: "",
  //     file: null,
  //   });
  //   const [colors, setColors] = useState({
  //     primary: "#67C090",
  //     secondary: "#56b381",
  //   });

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

  const increment = () => {
    const current = Number(getValues("no_of_license"));
    setValue("no_of_license", current + 1);
  };

  const decrement = () => {
    const current = Number(getValues("no_of_license"));
    if (current > 1) {
      setValue("no_of_license", current - 1);
    } else {
      setValue("no_of_license", 1);
    }
  };

  return (
    <div className="">
      <div>
        <div className="grid grid-cols-2 gap-10 mb-10">
          <MkdInput
            type={"text"}
            name={"name"}
            errors={errors}
            placeholder={"Name"}
            register={register}
            label={"Organization Name"}
          />
          <div className="flex items-center gap-5">
            <MkdInput
              type={"date"}
              name={"join_date"}
              errors={errors}
              label={"Join Date"}
              placeholder={"Date"}
              register={register}
            />

            <MkdInput
              type={"date"}
              name={"expiry_date"}
              errors={errors}
              label={"Expiry Date"}
              placeholder={"Date"}
              register={register}
            />
          </div>

          <div>
            <label className={`mb-2 block cursor-pointer text-sm font-[400] `}>
              No. of License
            </label>
            <div className="flex border-b border-b-accent items-center ">
              <button type="button" onClick={decrement}>
                <FaMinus />
              </button>
              <MkdInput
                type={"number"}
                name={"no_of_license"}
                errors={errors}
                // label={"No. of Licenses"}
                placeholder={"No. of License"}
                register={register}
                parentClassNames="!mb-0 flex-1"
                className={"!border-0 "}
              />
              <button type="button" className="" onClick={increment}>
                <FaPlus />
              </button>
            </div>
          </div>
        </div>

        <h4 className="text-xl text-accent mb-5 fontOpenSans font-semibold">
          Official Address
        </h4>
        <div className="grid grid-cols-2 gap-10 mb-10">
          <MkdInput
            type={"text"}
            name={"address"}
            errors={errors}
            label={"Address Line 1"}
            placeholder={"No. of License"}
            register={register}
          />
          <MkdInput
            type={"text"}
            name={"city"}
            errors={errors}
            label={"City"}
            placeholder={"City"}
            register={register}
          />
          <MkdInput
            type={"text"}
            name={"state"}
            errors={errors}
            label={"State/Province"}
            placeholder={""}
            register={register}
          />
          <MkdInput
            type={"text"}
            name={"country"}
            errors={errors}
            label={"Country"}
            placeholder={"Country"}
            register={register}
          />
          <MkdInput
            type={"text"}
            name={"zip"}
            errors={errors}
            label={"Zip/Postal Code"}
            placeholder={"Zip code"}
            register={register}
          />
          <MkdInput
            type={"select"}
            name={"status"}
            errors={errors}
            label={"Status"}
            placeholder={"Status"}
            register={register}
            options={statusOptions}
          />
        </div>

        <h4 className="text-xl text-accent mb-5 fontOpenSans font-semibold">
          Brands
        </h4>
        <div className="grid grid-cols-2 gap-10 mb-10">
          {/* Logo */}
          <div className="flex items-center gap-5">
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
          </div>

          <div>
            {/* Primary colour */}
            <div className="mb-10">
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

        <MkdInput
          type={"textarea"}
          name={"legal_information"}
          errors={errors}
          label={"Legal Information"}
          placeholder={"Legal Information"}
          register={register}
        />
      </div>
    </div>
  );
}
