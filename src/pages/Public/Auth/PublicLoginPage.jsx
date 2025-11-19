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
import { LoginBgNew } from "Assets/images";

let sdk = new MkdSDK();

const PublicLoginPage = () => {
  const schema = yup
    .object({
      email: yup.string().email().required(),
      password: yup.string().required(),
    })
    .required();

  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: GlobalDispatch } = React.useContext(GlobalContext);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect_uri = searchParams.get("redirect_uri");
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
    try {
      setSubmitLoading(true);
      const result = await sdk.login(data.email, data.password, "admin");
      if (!result.error) {
        dispatch({
          type: "LOGIN",
          payload: result,
        });
        showToast(GlobalDispatch, "Succesfully Logged In", 4000, "success");
        navigate(redirect_uri ?? "/public/dashboard");
      } else {
        setSubmitLoading(false);
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
    } catch (error) {
      setSubmitLoading(false);
      showToast(
        GlobalDispatch,
        error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
        4000,
        "error"
      );
      console.log("Error", error);
      setError("email", {
        type: "manual",
        message: error?.response?.data?.message
          ? error?.response?.data?.message
          : error?.message,
      });
    }
  };

  const socialLogin = async (type) => {
    let role = "user";
    const result = await sdk.oauthLoginApi(type, role);
    window.open(result, "_self"); //  "sharer",  "toolbar=0,status=0,width=650,height=400,"
  };

  return (
    <div
      className="bg-cover] min-h-screen bg-no-repeat"
      style={{ backgroundImage: `url(${LoginBgNew})` }}
    >
      <nav className="flex min-h-[50px] items-center justify-between border-b border-b-[#C6C6C6] bg-white px-6 py-2">
        <Link to="/" className="text-xl font-semibold">
          Baas Brand
        </Link>
        <div className="flex cursor-pointer items-center rounded-md border border-[#C6C6C6] px-3 py-2 shadow-sm hover:scale-95">
          Support
        </div>
      </nav>
      <div className="flex min-h-full flex-col items-center justify-center">
        <div className="my-12 flex w-[50%] flex-col items-center rounded-lg border border-[#a8a8a8] p-4  shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
          >
            <path
              d="M12.5 2C10.0147 2 8 4.01472 8 6.5C8 8.98528 10.0147 11 12.5 11C14.9853 11 17 8.98528 17 6.5C17 4.01472 14.9853 2 12.5 2Z"
              fill="#4F46E5"
            />
            <path
              d="M12.5004 12.5C8.3271 12.5 5.27345 15.2936 4.4402 19.0013C4.19057 20.112 5.10014 21 6.09882 21H18.902C19.9007 21 20.8102 20.112 20.5606 19.0013C19.7274 15.2936 16.6737 12.5 12.5004 12.5Z"
              fill="#4F46E5"
            />
          </svg>
          <div className="my-2 text-xl font-semibold text-[#262626]">
            Welcome Back
          </div>
          <div className="flex items-center text-sm">
            <span className="mr-1 text-[#525252]">Don’t have account? </span>{" "}
            <Link to="/public/sign-up" className="text-[#4F46E5]">
              Sign up here
            </Link>
          </div>

          <div className="my-2 flex min-w-[70%] cursor-pointer items-center justify-center rounded-md border-2 border-[#C6C6C6] px-4 py-2">
            <span className="mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
              >
                <path
                  d="M19.2509 10.1944C19.2509 9.47495 19.1913 8.94995 19.0624 8.40552H10.6795V11.6527H15.6C15.5009 12.4597 14.9652 13.675 13.7747 14.4916L13.758 14.6003L16.4085 16.6126L16.5921 16.6305C18.2786 15.1041 19.2509 12.8583 19.2509 10.1944Z"
                  fill="#4285F4"
                />
                <path
                  d="M10.6789 18.75C13.0896 18.75 15.1134 17.9722 16.5916 16.6305L13.7741 14.4916C13.0202 15.0068 12.0082 15.3666 10.6789 15.3666C8.31782 15.3666 6.31387 13.8402 5.59952 11.7305L5.49481 11.7392L2.73876 13.8295L2.70272 13.9277C4.17095 16.786 7.18682 18.75 10.6789 18.75Z"
                  fill="#34A853"
                />
                <path
                  d="M5.60004 11.7305C5.41155 11.186 5.30247 10.6027 5.30247 9.99992C5.30247 9.3971 5.41155 8.81379 5.59012 8.26935L5.58513 8.1534L2.79454 6.02954L2.70323 6.0721C2.0981 7.25823 1.75088 8.5902 1.75088 9.99992C1.75088 11.4096 2.0981 12.7415 2.70323 13.9277L5.60004 11.7305Z"
                  fill="#FBBC05"
                />
                <path
                  d="M10.6789 4.63331C12.3555 4.63331 13.4864 5.34303 14.1313 5.93612L16.6511 3.525C15.1036 2.11528 13.0896 1.25 10.6789 1.25C7.18685 1.25 4.17096 3.21387 2.70272 6.07218L5.58962 8.26943C6.31389 6.15972 8.31785 4.63331 10.6789 4.63331Z"
                  fill="#EB4335"
                />
              </svg>
            </span>
            <span className="text-[#525252]">Sign in</span>
          </div>
          <div className="text-md my-4 text-[#525252]">or use email:</div>

          <form className="min-w-[70%]" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 flex flex-col text-sm">
              <label htmlFor="">Email</label>
              <input
                className="rounded-md border border-[#c6c6c6] bg-transparent px-3 py-2 text-[#525252]"
                type="text"
                placeholder="admin@mail.com"
                {...register("email")}
              />
              <p className="text-xs italic text-red-500">
                {errors?.email?.message}
              </p>
            </div>
            <div className="flex flex-col text-sm">
              <label htmlFor="">Password</label>
              <div className="flex items-center rounded-md border border-[#c6c6c6] bg-transparent px-2 py-1 text-[#525252]">
                <input
                  className="focus-visible::outline-none w-[95%] border-none bg-transparent p-1 shadow-[0] outline-none focus:border-none focus:shadow-none focus:outline-none"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  {...register("password")}
                  style={{ boxShadow: "0 0 transparent" }}
                />
                <span
                  className="w-[5%] cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M9.99998 3.33337C13.5326 3.33335 16.9489 5.50937 19.0735 9.61715L19.2715 10L19.0735 10.3828C16.9489 14.4906 13.5326 16.6667 10 16.6667C6.46737 16.6667 3.05113 14.4907 0.926472 10.3829L0.728455 10.0001L0.926472 9.61724C3.05113 5.50946 6.46736 3.3334 9.99998 3.33337ZM7.08333 10C7.08333 8.38921 8.38917 7.08337 10 7.08337C11.6108 7.08337 12.9167 8.38921 12.9167 10C12.9167 11.6109 11.6108 12.9167 10 12.9167C8.38917 12.9167 7.08333 11.6109 7.08333 10Z"
                        fill="#A8A8A8"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M3.28033 2.21967C2.98744 1.92678 2.51256 1.92678 2.21967 2.21967C1.92678 2.51256 1.92678 2.98744 2.21967 3.28033L5.38733 6.44799C4.04329 7.533 2.8302 8.97021 1.81768 10.7471C1.37472 11.5245 1.37667 12.4782 1.81881 13.2539C3.74678 16.6364 6.40456 18.789 9.29444 19.6169C12.0009 20.3923 14.8469 19.9857 17.3701 18.4308L20.7197 21.7803C21.0126 22.0732 21.4874 22.0732 21.7803 21.7803C22.0732 21.4874 22.0732 21.0126 21.7803 20.7197L3.28033 2.21967ZM14.2475 15.3082L13.1559 14.2166C12.81 14.3975 12.4167 14.4995 11.9991 14.4995C10.6184 14.4995 9.49911 13.3802 9.49911 11.9995C9.49911 11.5819 9.60116 11.1886 9.78207 10.8427L8.69048 9.75114C8.25449 10.3917 7.99911 11.1662 7.99911 11.9995C7.99911 14.2087 9.78998 15.9995 11.9991 15.9995C12.8324 15.9995 13.6069 15.7441 14.2475 15.3082Z"
                        fill="#A8A8A8"
                      />
                      <path
                        d="M19.7234 16.5416C20.5189 15.7335 21.2556 14.7869 21.9145 13.7052C22.5512 12.66 22.5512 11.34 21.9145 10.2948C19.3961 6.16075 15.7432 4.00003 11.9999 4C10.6454 3.99999 9.30281 4.28286 8.02148 4.83974L19.7234 16.5416Z"
                        fill="#A8A8A8"
                      />
                    </svg>
                  )}
                </span>
              </div>
              <p className="text-xs italic text-red-500">
                {errors?.password?.message}
              </p>
            </div>
            <div className="my-2 flex justify-between text-sm">
              <div className="flex items-center text-[#525252]">
                <input className="mr-2" type="checkbox" />
                Remember me
              </div>
              <Link to="/admin/forgot" className="text-[#4F46E5]">
                Forgot password
              </Link>
            </div>
            <InteractiveButton
              type="submit"
              className={`my-12 flex w-full items-center justify-center rounded-md bg-[#4F46E5] py-2 tracking-wide text-white outline-none focus:outline-none`}
              loading={submitLoading}
              disabled={submitLoading}
            >
              <span>Sign in</span>
            </InteractiveButton>
          </form>
          <div className="hr my-6 text-center">OR</div>

          <div className="oauth flex w-full max-w-md grow flex-col gap-4 px-6 text-[#344054]">
            <button
              onClick={() => socialLogin("google")}
              className="flex items-center justify-center gap-2 border-2 py-[10px]"
            >
              <img
                src={
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALpSURBVHgBtVbNTxNBFH8zuy3QoN0YJMEQs8QQP05LAsbEg4uRxMSD4AeaeLB6xEPhpIkm4MF4IsG/oODF4Edajgahy8UDxbAcjDEc2IORCIlUhVK6u/OcKbVpaZdWxN+lkzd9v9+b9968WQK7YEnXlYPSxm0GqCMQjZtUYScASUSw+NJwGU40GXOGFwfxIg7IqX6KGEYABSqCWBmKPc2TCbOiwEpXhwaMRAFQhb+Ei/i4aXpuyFNAkBMG8eqiLoVIG2N2Z5NhWiUCyxfPqLLtznuTYxKQWIRk869wT60SuYD8ZyHZrGzk3NGkCP3r6Cy0GGYyH5CuqRL1DXKhkBd5/gRrfa0h+7MSKQ0aRhqnEwOwC1YvtOuO41jlyPMCzpRvKT3boKbeNRdsYOzw1FwP/COoPSnriKjWdKxCsO8j0GAmm0/HdQZgHyADhXM8FdtqnPzArUVIv280gsOWVc5BH9xUoWrUJkWRi7pBiAQufRmF4fIukt+N8Hh0qAYsNUoBSztHRtmCfQASVCn8Z1BCiLXT6DJbg32CzPhFKpwXv9AHkY3jOoA5Uc6B53+Mn90o2SBi0mKo2MS5RZvyVVwYFp0g3P95GpbdQNJJuy3mnVgSqsT5JxuRnQKMQYj6uhyDr5Pjm8fg3o+zsMwCQlqR66RIteT6082S6LNw7BlJ/EpX22ufp1r1DEiF2yeOXDupfH396W0lcopMZKCoG/llNYzB4LN8+tvHr8zz3JYUl48MPkHJ0OyNN2NFxJFuZb1W7pfSp8J1K3cV6jQU+aHk1+IP/At5Ae3FTVWm9ny5e5FT4uMasi8WL7RKcs+nALUboO5bGKStozl2GJl+VD+w7VaAjpfXNRTHxb09OP61Hqj53m3GH9a35cUL/5DofWU6zNfGI7RgD9g6FI1hxu4stJV99LVotyJnaJjXZAiqAPI6Aa/Thx118hTIC/G6UMjolJLL2Y+AXBMgr4coPmc2CMVYojc648XxG0ZrPRAMMnAhAAAAAElFTkSuQmCC"
                }
                className="h-[18px] w-[18px]"
              />
              <span>Sign in With Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLoginPage;
