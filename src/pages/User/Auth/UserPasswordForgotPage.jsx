import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import MkdSDK from "Utils/MkdSDK";
import { tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { InteractiveButton } from "Components/InteractiveButton";
import { Official_login_bg } from "Assets/images";
import { IoIosArrowBack } from "react-icons/io";
import { MkdInput } from "Components/MkdInput";
import { FaExclamation } from "react-icons/fa";
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { FE_BASE_URL } from "Utils/config";

const UserPasswordForgotPage = () => {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const [submitLoading, setSubmitLoading] = useState(false);
  const navigate = useNavigate();

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
      const { error } = await supabase.auth.resetPasswordForEmail(data?.email, {
        redirectTo: `${FE_BASE_URL}/reset-password`,
      });

      if (error) throw error;
      showToast(globalDispatch, "Forgot password");
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
      <div className="m-auto bg-[#cccfd5] h-screen max-h-screen min-h-screen grid place-content-center">
        <div className="flex  justify-center">
          <section className="flex w-full p-10 flex-col items-center justify-center bg-white  ">
            <div className="flex justify-center mb-12">
              <FaExclamation className="text-black text-5xl" />
            </div>

            <div className="flex mb-10 text-center w-full max-w-md flex-col">
              <h2 className=" text-3xl font-[400] capitalize">
                Forgot Password
              </h2>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex w-full md:min-w-[25rem] flex-col min-w-[80%]"
            >
              <MkdInput
                type={"email"}
                name={"email"}
                errors={errors}
                label={"Enter your Registered email"}
                placeholder={"user@example.com"}
                register={register}
                className={"mb-6"}
              />

              <div className="flex items-center gap-5 justify-around">
                <InteractiveButton
                  isSecondaryBtn={true}
                  type="submit"
                  className={``}
                  onClick={() => navigate("/administrator/login")}
                >
                  <span>Cancel</span>
                </InteractiveButton>
                <InteractiveButton
                  type="submit"
                  className={``}
                  loading={submitLoading}
                  disabled={submitLoading}
                >
                  <span>Send Reset Link</span>
                </InteractiveButton>
              </div>
            </form>
            {/* <p className="mt-4 text-center text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Staci J. All rights reserved.
            </p> */}
          </section>
        </div>
      </div>
    </>
  );
};

export default UserPasswordForgotPage;
