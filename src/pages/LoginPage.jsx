import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdInput from "../components/MkdInput/MkdInput";
import { MockDataService } from "../utils/MockDataService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/Auth";
import MkdSDK from "Utils/MkdSDK";
import { Link } from "react-router-dom";
import { InteractiveButton } from "Components/InteractiveButton";
import { GlobalContext, showToast } from "Context/Global";

const sdk = new MkdSDK();

const schema = yup
  .object({
    username: yup.string().required(),
    password: yup.string().required(),
  })
  .required();

const LoginPage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  console.log(state);

  const [loading, setLoading] = React.useState(false);

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
      const result = await sdk.login(data.username, data.password);

      if (result?.success) {
        showToast(globalDispatch, "Login successful", 4000, "success");
        const { user, token } = result?.data;

        dispatch({
          type: "LOGIN",
          payload: {
            user_id: user?.id,
            token: token,
          },
        });
        // navigate("/dashboard");
      } else {
        showToast(globalDispatch, result?.message, 4000, "error");
      }

      // navigate("/dashboard");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <MkdInput
          name="username"
          label="Username"
          type="text"
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

        <div className="flex items-center justify-between mt-4">
          <InteractiveButton
            className="rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
            loading={loading}
          >
            Login
          </InteractiveButton>
        </div>

        <Link to="/signup">
          <p className="text-sm mt-3 hover:underline ">
            Don't have an account? Sign up
          </p>
        </Link>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Use admin@example.com / admin</p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
