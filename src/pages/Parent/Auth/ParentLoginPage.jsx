import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { InteractiveButton } from "Components/InteractiveButton";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { AthleteSwimming } from "Assets/images";
import TreeSDK from "Utils/TreeSDK";
import { MkdInput } from "Components/MkdInput";
import { supabase } from "Src/supabase";

const ParentLoginPage = () => {
  const schema = yup
    .object({
      email: yup.string().email().required("Email is a required field."),
      password: yup.string().required("Password is a required field."),
    })
    .required();

  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [submitLoading, setSubmitLoading] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect_uri = searchParams.get("redirect_uri");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const { data: result, error } = await supabase.auth.signInWithPassword(
        data
      );

      if (error) {
        showToast(globalDispatch, error?.message, 4000, "error");
        setSubmitLoading(false);
        return;
      }
      const { id, email } = result?.user;

      const { data: userProfile } = await supabase
        .from("user_profile")
        .select("*, organization(name), role")
        .eq("user_id", id)
        .single();

      if (userProfile?.role?.toLowerCase() !== "parent") {
        showToast(globalDispatch, "User not found", 4000, "error");
      } else {
        const {
          id: userProfileId,
          address,
          city,
          state,
          country,
          zip,
          joined_date,
          expiry_date,
          logo,
          login_img,
          role,
          role_id,
          organization_id,
          organization,
        } = userProfile;

        const payload = {
          user_id: id,
          user_profile_id: userProfileId,
          token: result?.session?.access_token,
          role: role,
          role_id: role_id,
          email: email || null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          zip: zip || null,
          joined_date: joined_date || null,
          expiry_date: expiry_date || null,
          logo: logo || null,
          login_img: login_img || null,
          organization_id: organization_id || null,
          organization_name: organization?.name || null,
        };

        dispatch({ type: "LOGIN", payload: payload });
        showToast(globalDispatch, "Login successfully");
        navigate(redirect_uri || "/parent/dashboard");
      }
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Login successfully",
        4000,
        "error"
      );
    }
    setSubmitLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "login",
      },
    });
  }, []);

  return (
    <>
      <div
        className="m-auto h-screen max-h-screen min-h-screen"
        style={{ fontFamily: "Inter,sans-serif" }}
      >
        <div className="flex h-full w-full justify-center">
          <section
            className="hidden w-1/2 md:block"
            style={{
              backgroundImage: `url(${AthleteSwimming})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          ></section>
          <section className="flex w-full flex-col items-center justify-center bg-white md:w-1/2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-[-3rem] flex w-full max-w-md flex-col px-6"
            >
              <div className="mb-8 ">
                <h2 className=" mb-2 text-3xl font-[400]">Login to Neoteric</h2>
              </div>

              <MkdInput
                type={"text"}
                name={"email"}
                errors={errors}
                label={"Enter your Registered email"}
                placeholder={"user@example.com"}
                register={register}
                className={"mb-4"}
              />

              <MkdInput
                type={"password"}
                name={"password"}
                errors={errors}
                label={"Enter your password"}
                placeholder={"************"}
                register={register}
                className={"mb-4"}
              />

              <InteractiveButton
                type="submit"
                className={`flex items-center justify-center py-3 font-[600] tracking-wide text-white outline-none focus:outline-none `}
                loading={submitLoading}
                disabled={submitLoading}
              >
                <span>Login</span>
              </InteractiveButton>

              <div className="mb-6 mt-4 flex items-center justify-center">
                <Link
                  className={`  self-end border-b border-b-transparent  bg-gradient-to-l bg-clip-text text-sm  text-secondary hover:text-primary `}
                  to="/parent/forgot"
                >
                  Forgot Password
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default ParentLoginPage;
