import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { showToast, GlobalContext } from "Context/Global";
import { InteractiveButton } from "Components/InteractiveButton";
import { Admin_login_bg, Official_login_bg } from "Assets/images";
import { IoIosArrowBack } from "react-icons/io";

const AdminResetPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [submitLoading, setSubmitLoading] = useState(false);
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const token = params.get("token");

  const schema = yup
    .object({
      code: yup.string().required("Code is a required field."),
      password: yup.string().required("Password is a required field."),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match"),
    })
    .required();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    let sdk = new MkdSDK();
    try {
      setSubmitLoading(true);
      const result = await sdk.reset(token, data.code, data.password);
      if (!result.error) {
        showToast(globalDispatch, "Password Reset");
        setTimeout(() => {
          navigate(`/admin/login`);
        }, 2000);
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
      setError("code", {
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
              <h3 className=" mb-5 capitalize">Change Password</h3>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full max-w-md flex-col "
            >
              <div className="mb-4">
                <label
                  className="mb-2 block cursor-pointer text-sm font-[400]"
                  htmlFor="code"
                >
                  Enter 6-Digits Code
                </label>
                <input
                  type="text"
                  id="code"
                  placeholder="Enter code sent to your email"
                  {...register("code")}
                  className={`active: focus:shadow-outline w-full resize-none appearance-none rounded bg-[#f5f5f5] p-2 px-4 py-2  text-base leading-tight text-gray-700 outline-none focus:outline-none ${
                    errors.code?.message
                      ? "border-1 border-red-500"
                      : "border-none"
                  }`}
                />
                <p className="text-xs italic text-red-500">
                  {errors.code?.message}
                </p>
              </div>

              <div className="mb-4">
                <label
                  className="mb-2 block cursor-pointer text-sm font-[400]"
                  htmlFor="password"
                >
                  Enter New password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="******************"
                  {...register("password")}
                  className={`active: focus:shadow-outline w-full resize-none appearance-none rounded bg-[#f5f5f5] p-2 px-4 py-2  text-base leading-tight text-gray-700 outline-none focus:outline-none ${
                    errors.password?.message
                      ? "border-1 border-red-500"
                      : "border-none"
                  }`}
                />
                <p className="text-xs italic text-red-500">
                  {errors.password?.message}
                </p>
              </div>
              <div className="mb-6">
                <label
                  className="mb-2 block cursor-pointer text-sm font-[400]"
                  htmlFor="confirmPassword"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="******************"
                  {...register("confirmPassword")}
                  className={`active: focus:shadow-outline w-full resize-none appearance-none rounded bg-[#f5f5f5] p-2 px-4 py-2  text-base leading-tight text-gray-700 outline-none focus:outline-none ${
                    errors.confirmPassword?.message
                      ? "border-1 border-red-500"
                      : "border-none"
                  }`}
                />
                <p className="text-xs italic text-red-500">
                  {errors.confirmPassword?.message}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <InteractiveButton
                  className="flex w-full items-center justify-center rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] py-3 text-sm font-[600] tracking-wide text-white outline-none  hover:from-[#662D91] hover:to-[#662D91] focus:outline-none"
                  type="submit"
                  loading={submitLoading}
                  disabled={submitLoading}
                >
                  Reset
                </InteractiveButton>
              </div>
            </form>
            {/* <p className="mt-5 text-center text-xs text-gray-500">
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

export default AdminResetPage;
