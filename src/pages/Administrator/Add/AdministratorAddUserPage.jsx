import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { MkdInput } from "Components/MkdInput";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useRef } from "react";

export default function AdministratorAddUserPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const schema = yup
    .object({
      first_name: yup.string().required("First name is required"),
      last_name: yup.string(),
      email: yup
        .string()
        .email("Please insert a valid email")
        .required("Email is required"),
      role: yup.string().required("Role is required"),
    })
    .required();

  const {
    register,
    handleSubmit,

    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);

    // Append new files to state (avoid duplicates by name)
    setFiles((prev) => {
      const existingNames = prev.map((f) => f.name);
      const newFiles = selected.filter((f) => !existingNames.includes(f.name));
      return [...prev, ...newFiles];
    });

    // reset input so same file can be selected again if needed
    e.target.value = null;
  };

  const handleRemove = (name) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };
  const handleTriggerFileSelection = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const recommendation = [
    { label: "Level 1", value: "Level 1" },
    { label: "Level 2", value: "Level 2" },
    { label: "Level 3", value: "Level 3" },
    { label: "Level 4", value: "Level 4" },
    { label: "Level 5", value: "Level 5" },
  ];

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className=" p-10" onSubmit={handleSubmit(onSubmit)}>
      <form className="space-y-5">
        {/* left side */}
        <div className="grid grid-cols-2 gap-10">
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
            label={"First Name"}
            placeholder={""}
            register={register}
          />
        </div>

        <MkdInput
          type={"email"}
          name={"email"}
          errors={errors}
          label={"Email Address"}
          placeholder={""}
          register={register}
        />
        <MkdInput
          type={"dropdown"}
          name={"role"}
          errors={errors}
          label={"Role"}
          placeholder={""}
          register={register}
          options={[
            { label: "Admin", value: "administrator" },
            { label: "Co-ordinator", value: "coordinator" },
          ]}
        />
      </form>
    </div>
  );
}
