import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "Context/Global";
import { tokenExpireError } from "Context/Auth";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { InteractiveButton } from "Components/InteractiveButton";
const AddAdminEmailPage = () => {
  const schema = yup
    .object({
      slug: yup.string().required(),
      subject: yup.string().required(),
      html: yup.string().required(),
      tag: yup.string().required(),
    })
    .required();

  const { dispatch } = React.useContext(GlobalContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [submitLoading, setSubmitLoading] = React.useState(false);

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
    setSubmitLoading(true);
    try {
      sdk.setTable("email");

      const result = await sdk.callRestAPI(
        {
          slug: data.slug,
          subject: data.subject,
          html: data.html,
          tag: data.tag,
        },
        "POST"
      );
      if (!result.error) {
        navigate("/admin/email");
        showToast(globalDispatch, "Added");
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
    } catch (error) {
      console.log("Error", error);
      setError("subject", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
    setSubmitLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "emails",
      },
    });
  }, []);

  return (
    <div className="p-5 md:p-10">
      <FilterBoxBg>
        <SectionTitle className={"mb-5"} fontRoboto={true} text={"Add Email"} />
        <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-[400]" htmlFor="slug">
              Email Type
            </label>
            <input
              type="text"
              placeholder="Email Type"
              {...register("slug")}
              className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none`}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-[400]" htmlFor="subject">
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
              className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-base leading-tight  outline-none focus:outline-none ${
                errors.tag?.message ? "border-red-500" : ""
              }`}
            />
            <p className="text-xs italic text-red-500">{errors.tag?.message}</p>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-[400]" htmlFor="html">
              Email Body
            </label>
            <textarea
              placeholder="Email Body"
              className={`box-shadow w-full rounded-[5px] border border-transparent bg-[#f5f5f5] ${
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
            loading={submitLoading}
            disabled={submitLoading}
          >
            Submit
          </InteractiveButton>
        </form>
      </FilterBoxBg>
    </div>
  );
};

export default AddAdminEmailPage;
