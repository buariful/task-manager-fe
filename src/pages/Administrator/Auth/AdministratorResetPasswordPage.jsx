import React, { useState } from "react";
import { FaExclamation } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { supabase } from "Src/supabase";
import { InteractiveButton } from "Components/InteractiveButton";
import { MkdInput } from "Components/MkdInput";

export default function AdministratorResetPasswordPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    setMessage("");
    try {
      if (data.password !== data.confirmPassword) {
        setMessage("Passwords do not match.");
        setSubmitLoading(false);
        return;
      }

      const { data: resetData, error } = await supabase.auth.updateUser({
        password: data.password,
      });

      const { data: user } = await supabase
        .from("user_profile")
        .select("*")
        .eq("user_id", resetData?.user?.id)
        .single();

      console.log(user);
      console.log(`/${user?.role ?? "administrator"}/login`);

      if (error) throw error;

      setMessage("Password updated successfully. Redirecting...");
      setTimeout(
        () => navigate(`/${user?.role ?? "administrator"}/login`),
        2000
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="m-auto bg-[#cccfd5] h-screen max-h-screen min-h-screen grid place-content-center">
      <div className="flex justify-center">
        <section className="flex w-full p-10 flex-col items-center justify-center bg-white">
          {/* Icon */}
          <div className="flex justify-center mb-12">
            <FaExclamation className="text-black text-5xl" />
          </div>

          {/* Title */}
          <div className="flex mb-10 text-center w-full max-w-md flex-col">
            <h2 className="text-3xl font-[400] capitalize">Reset Password</h2>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full md:min-w-[25rem] flex-col min-w-[80%]"
          >
            <MkdInput
              type="password"
              name="password"
              errors={errors}
              label="New Password"
              placeholder="Enter new password"
              register={register}
              rules={{ required: "Password is required" }}
              className="mb-6"
            />

            <MkdInput
              type="password"
              name="confirmPassword"
              errors={errors}
              label="Confirm Password"
              placeholder="Re-enter new password"
              register={register}
              rules={{ required: "Please confirm your password" }}
              className="mb-6"
            />

            <div className="flex items-center gap-5 justify-around">
              <InteractiveButton
                isSecondaryBtn={true}
                type="button"
                onClick={() => navigate("/administrator/login")}
              >
                <span>Cancel</span>
              </InteractiveButton>

              <InteractiveButton
                type="submit"
                loading={submitLoading}
                disabled={submitLoading}
              >
                <span>Update Password</span>
              </InteractiveButton>
            </div>
          </form>

          {message && (
            <p className="mt-6 text-center text-sm text-red-500">{message}</p>
          )}
        </section>
      </div>
    </div>
  );
}
