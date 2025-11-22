import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdInput from "../components/MkdInput/MkdInput";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Auth";
import MkdSDK from "../utils/MkdSDK";
import { GlobalContext, showToast } from "Context/Global";
import { InteractiveButton } from "Components/InteractiveButton";
import { Link } from "react-router-dom";

const sdk = new MkdSDK();

const schema = yup
  .object({
    username: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
    first_name: yup.string().required(),
    last_name: yup.string().required(),
  })
  .required();

const RegisterPage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [loading, setLoading] = React.useState(false);

  console.log("state->", state);

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
    setLoading(true);
    try {
      const result = await sdk.register(
        data.username,
        data.email,
        data.password,
        data.first_name,
        data.last_name
      );
      console.log(result);

      if (!result.success) {
        showToast(globalDispatch, result?.message, 4000, "error");
      } else {
        const { user, token } = result?.data;

        dispatch({
          type: "LOGIN",
          payload: {
            user_id: user?.id,
            token: token,
          },
        });
        showToast(globalDispatch, "Registration successful");
        navigate("/dashboard");
      }
    } catch (error) {
      setError("email", {
        type: "manual",
        message: error.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xs mx-auto mt-24">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
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
        <div className="flex items-center justify-between mt-4">
          <InteractiveButton
            className=" rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
            loading={loading}
          >
            Register
          </InteractiveButton>
        </div>
        <Link to="/login">
          <p className="text-sm mt-3 hover:underline ">
            You have an account? Login
          </p>
        </Link>
      </form>
    </div>
  );
};

export default RegisterPage;
