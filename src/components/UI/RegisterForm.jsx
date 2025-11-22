import { MkdInput } from "Components/MkdInput";
import React from "react";

export default function RegisterForm({ errors, register }) {
  return (
    <>
      <MkdInput
        name="username"
        label="Username"
        type="text"
        register={register}
        errors={errors}
      />
      <MkdInput
        name="email"
        label="Email"
        type="email"
        register={register}
        errors={errors}
      />
      <MkdInput
        name="password"
        label="Password"
        type="password"
        register={register}
        errors={errors}
      />
      <MkdInput
        name="first_name"
        label="First Name"
        type="text"
        register={register}
        errors={errors}
      />
      <MkdInput
        name="last_name"
        label="Last Name"
        type="text"
        register={register}
        errors={errors}
      />
    </>
  );
}
