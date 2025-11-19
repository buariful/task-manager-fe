import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import MkdSDK from "Utils/MkdSDK";
import { tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { InteractiveButton } from "Components/InteractiveButton";
import { Official_login_bg } from "Assets/images";
import { IoIosArrowBack } from "react-icons/io";

const AdminForgotPage = () => {
  const [submitLoading, setSubmitLoading] = useState(false);

  const schema = yup
    .object({
      email: yup.string().email().required(),
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

  const { dispatch } = React.useContext(GlobalContext);

  const onSubmit = async (data) => {
    let sdk = new MkdSDK();
    try {
      setSubmitLoading(true);
      const result = await sdk.forgot(data.email, "admin");

      if (!result.error) {
        showToast(dispatch, "Reset Code Sent");
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
      setSubmitLoading(false);
    } catch (error) {
      setSubmitLoading(false);
      console.log("Error", error);
      setError("email", {
        type: "manual",
        message: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      });
      tokenExpireError(
        dispatch,
        error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message
      );
    }
  };

  return (
    <>
      <div
        className="m-auto h-screen max-h-screen min-h-screen"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="flex h-full w-full justify-center">
          <section className="flex w-full flex-col items-center justify-center bg-white px-4 md:w-1/2">
            <div className="flex w-full max-w-md flex-col">
              <div className="mb-5">
                {" "}
                <Link
                  className="group flex items-center gap-1 align-baseline text-sm font-[400] text-purple-700 "
                  to="/admin/login"
                >
                  <IoIosArrowBack />{" "}
                  <span className="border-b border-transparent group-hover:border-b-purple-700">
                    {" "}
                    Back to login
                  </span>
                </Link>
              </div>

              <h2 className="mb-2 text-3xl font-[400] capitalize">
                Forgot Your Password?
              </h2>
              <p className="mb-4 text-lg font-[400]">
                We will send you a password reset link on your email account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full max-w-md flex-col"
            >
              <div className="mb-6">
                <label
                  className="mb-2 block cursor-pointer text-sm font-[400]"
                  htmlFor="officialForgot_email"
                >
                  Email
                </label>
                <input
                  id="officialForgot_email"
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className={`active:focus:shadow-outline w-full resize-none appearance-none rounded bg-[#f5f5f5] p-2 px-4 py-2.5  text-sm leading-tight text-gray-700 outline-none focus:outline-none ${
                    errors && errors.email?.message
                      ? "border-1 border-red-500"
                      : "border-none"
                  }`}
                />
                <p className="text-xs italic text-red-500">
                  {errors && errors.email?.message}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <InteractiveButton
                  type="submit"
                  className={`flex w-full items-center justify-center rounded  bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] py-3 text-sm font-[600] tracking-wide text-white outline-none  hover:from-[#662D91] hover:to-[#662D91] focus:outline-none`}
                  loading={submitLoading}
                  disabled={submitLoading}
                >
                  <span>Send Password Reset Link</span>
                </InteractiveButton>
              </div>
            </form>
            {/* <p className="mt-4 text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Staci J. All rights reserved.
            </p> */}
          </section>
          <section
            className="hidden w-1/2 md:block"
            style={{
              backgroundImage: `url(${Official_login_bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          ></section>
        </div>
      </div>
    </>
  );
};

export default AdminForgotPage;
