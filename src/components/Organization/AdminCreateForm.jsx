import { MkdInput } from "Components/MkdInput";
import { ToggleButton } from "Components/ToggleButton";
import React from "react";

export default function AdminCreateFrom({
  errors,
  register,
  isActive,
  setIsActive,
  disabledFields = [],
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-10 mb-10">
        <MkdInput
          type="text"
          name="first_name"
          errors={errors}
          label="First Name"
          placeholder="Enter first name"
          register={register}
        />
        <MkdInput
          type="text"
          name="last_name"
          errors={errors}
          label="Last Name"
          placeholder="Enter last name"
          register={register}
        />
        <MkdInput
          type="email"
          name="email"
          disabled={disabledFields?.includes("email")}
          errors={errors}
          label="Email"
          placeholder="Enter email address"
          register={register}
        />
        <MkdInput
          type="text"
          name="contact_number"
          errors={errors}
          label="Contact Number"
          placeholder="Enter contact number"
          register={register}
        />
      </div>
      <ToggleButton
        value={isActive}
        onChangeFunction={setIsActive}
        withLabel={true}
      />
    </div>
  );
}
