import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "Context/Global";
import { tokenExpireError, AuthContext } from "Context/Auth";
import { InteractiveButton } from "Components/InteractiveButton";
import TreeSDK from "Utils/TreeSDK";
import { SectionTitle } from "Components/SectionTitle";
import { FilterBoxBg } from "Components/FilterBoxBg";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminProfilePage = () => {
  const schema = yup
    .object({
      email: yup.string().email().required(),
    })
    .required();

  const { dispatch, state } = React.useContext(AuthContext);
  const [oldEmail, setOldEmail] = useState("");
  const [fileObj, setFileObj] = React.useState({});

  const [oldPhoto, setOldPhoto] = useState("");
  const [uploadedPhoto, setUploadedPhoto] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const previewImage = (field, target, multiple = false) => {
    let tempFileObj = fileObj;
    console.log(target);
    if (multiple) {
      if (tempFileObj[field]) {
        tempFileObj[field] = [
          ...tempFileObj[field],
          {
            file: target.files[0],
            tempFile: {
              url: URL.createObjectURL(target.files[0]),
              name: target.files[0].name,
              type: target.files[0].type,
            },
          },
        ];
      } else {
        tempFileObj[field] = [
          {
            file: target.files[0],
            tempFile: {
              url: URL.createObjectURL(target.files[0]),
              name: target.files[0].name,
              type: target.files[0].type,
            },
          },
        ];
      }
    } else {
      tempFileObj[field] = {
        file: target.files[0],
        tempURL: URL.createObjectURL(target.files[0]),
      };
    }
    setFileObj({ ...tempFileObj });
  };

  async function fetchData() {
    try {
      const result = await sdk.getProfile();

      setValue("email", result?.email);
      setValue("first_name", result?.first_name);
      setValue("last_name", result?.last_name);
      setOldEmail(result?.email);
      setOldPhoto(result?.photo);
    } catch (error) {
      console.log("Error", error);
      tokenExpireError(
        dispatch,
        error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }

  const handleImageChange = async (e) => {
    console.log("starting image change");
    const formData = new FormData();
    console.log(e[0]);
    formData.append("file", e[0]);
    try {
      const result = await sdk.uploadImage(formData);
      console.log("photo result");
      console.log(result.url);
      setUploadedPhoto(result.url);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);

      const result = await tdk.update("user", state?.user, {
        first_name: data.first_name,
        last_name: data.last_name,
      });

      if (!result.error) {
        showToast(globalDispatch, "Profile Updated", 4000);
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

      if (data.password.length > 0) {
        const passwordresult = await sdk.updatePassword(data.password);
        if (!passwordresult.error) {
          showToast(globalDispatch, "Password Updated", 2000);
        } else {
          if (passwordresult.validation) {
            const keys = Object.keys(passwordresult.validation);
            for (let i = 0; i < keys.length; i++) {
              const field = keys[i];
              setError(field, {
                type: "manual",
                message: passwordresult.validation[field],
              });
            }
          }
        }
      }
      await fetchData();
      setSubmitLoading(false);
    } catch (error) {
      setSubmitLoading(false);
      console.log("Error", error);
      setError("email", {
        type: "manual",
        message: error?.message,
      });
      tokenExpireError(
        dispatch,
        error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "profile",
      },
    });

    fetchData();
  }, []);

  return (
    <>
      <div className="rounded  p-5 md:p-10  ">
        <FilterBoxBg>
          <SectionTitle
            className={"mb-5"}
            fontRoboto={true}
            text={"Edit Profile"}
          />
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg ">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]">Email</label>
              <input
                className="focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none disabled:cursor-not-allowed"
                id="email"
                type="email"
                disabled={true}
                placeholder="Email"
                name="email"
                {...register("email")}
              />
              <p className="text-xs italic text-red-500">
                {errors.email?.message}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]">
                First Name
              </label>
              <input
                className="focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none disabled:cursor-not-allowed"
                id="first_name"
                type="text"
                placeholder="first name"
                name="first_name"
                {...register("first_name")}
              />
              <p className="text-xs italic text-red-500">
                {errors.first_name?.message}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]">Last Name</label>
              <input
                className="focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none disabled:cursor-not-allowed"
                id="last_name"
                type="text"
                placeholder="last name"
                name="last_name"
                {...register("last_name")}
              />
              <p className="text-xs italic text-red-500">
                {errors.last_name?.message}
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-[400]">Password</label>
              <input
                {...register("password")}
                name="password"
                className={
                  "focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none disabled:cursor-not-allowed"
                }
                id="password"
                type="password"
                placeholder="******************"
              />
              <p className="text-xs italic text-red-500">
                {errors.password?.message}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <InteractiveButton
                className="text- rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#b877eb] disabled:to-[#b877eb]"
                type="submit"
                loading={submitLoading}
                disabled={submitLoading}
              >
                Update
              </InteractiveButton>
            </div>
          </form>
        </FilterBoxBg>
      </div>
    </>
  );
};

export default AdminProfilePage;
