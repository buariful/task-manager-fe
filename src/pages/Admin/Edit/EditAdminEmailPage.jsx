import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "Context/Global";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { InteractiveButton } from "Components/InteractiveButton";
import { SectionTitle } from "Components/SectionTitle";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SkeletonLoader } from "Components/Skeleton";

let sdk = new MkdSDK();

const EditAdminEmailPage = () => {
  const schema = yup
    .object({
      subject: yup.string().required(),
      html: yup.string().required(),
      tag: yup.string().required(),
    })
    .required();
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const [id, setId] = useState(0);
  const [slug, setSlug] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();

  useEffect(function () {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "emails",
      },
    });

    (async function () {
      try {
        setDataLoading(true);
        sdk.setTable("email");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {
          setValue("subject", result.model.subject);
          setValue("html", result.model.html);
          setValue("tag", result.model.tag);
          setSlug(result.model.slug);
          setId(result.model.id);
        }
      } catch (error) {
        console.log("error", error);
        tokenExpireError(dispatch, error.message);
      }
      setDataLoading(false);
    })();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitLoading(true);

    try {
      const result = await sdk.callRestAPI(
        { id, slug, subject: data.subject, html: data.html, tag: data.tag },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/admin/email");
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
      setIsSubmitLoading(false);
    } catch (error) {
      setIsSubmitLoading(false);
      console.log("Error", error);
      setError("html", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
    setIsSubmitLoading(false);
  };

  return (
    <div className=" mx-auto rounded p-5 shadow-md md:p-10">
      <FilterBoxBg>
        <SectionTitle
          className={"mb-5"}
          fontRoboto={true}
          text={"Edit Email"}
        />
        {dataLoading ? (
          <SkeletonLoader />
        ) : (
          <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]" htmlFor="slug">
                Email Type
              </label>
              <input
                type="text"
                placeholder="Email Type"
                value={slug}
                disabled
                className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none disabled:cursor-not-allowed`}
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]" htmlFor="email">
                Subject
              </label>
              <input
                type="text"
                placeholder="subject"
                {...register("subject")}
                className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none ${
                  errors.subject?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-xs italic text-red-500">
                {errors.subject?.message}
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]" htmlFor="tag">
                Tags
              </label>
              <input
                type="text"
                placeholder="tag"
                {...register("tag")}
                className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight ${
                  errors.tag?.message ? "border-red-500" : ""
                }`}
              />
              <p className="text-xs italic text-red-500">
                {errors.tag?.message}
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-[400]" htmlFor="html">
                Email Body
              </label>
              <textarea
                placeholder="Email Body"
                className={`focus:shadow-outline box-shadow w-full resize-none appearance-none rounded border border-transparent bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight outline-none focus:border-[#2563eb] focus:outline-none ${
                  errors.html?.message ? "border-red-500" : ""
                }`}
                {...register("html")}
                rows={15}
              ></textarea>
              <p className="text-xs italic text-red-500">
                {errors.html?.message}
              </p>
            </div>
            <InteractiveButton
              className="text- rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#b877eb] disabled:to-[#b877eb]"
              type="submit"
              loading={isSubmitLoading}
              disabled={isSubmitLoading}
            >
              Submit
            </InteractiveButton>
          </form>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default EditAdminEmailPage;
