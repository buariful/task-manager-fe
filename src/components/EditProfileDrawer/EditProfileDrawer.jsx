import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";
import { Fragment } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MkdInput } from "Components/MkdInput";
import { useState } from "react";
import { useRef } from "react";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import { supabase } from "Src/supabase";
import { GlobalContext, showToast } from "Context/Global";
import { useEffect } from "react";
import { Spinner } from "Assets/svgs";
import { FaSackXmark } from "react-icons/fa6";
import { updateUserEmail } from "Utils/utils";

export default function EditProfileDrawer({ open, setOpen }) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prevEmail, setPrevEmail] = useState("");

  const formRef = useRef();

  const schema = yup
    .object({
      firstName: yup.string().required("First name is a required field."),
      lastName: yup.string(),
      email: yup.string().email().required("Email is a required field"),
      phoneNumber: yup.string().required("Phone number is a required field"),
    })
    .required();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await supabase
        .from("user_profile")
        .update({
          first_name: data?.firstName,
          last_name: data?.lastName,
          phone: data?.phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", state?.user)
        .select();

      if (prevEmail !== data?.email) {
        const result = await updateUserEmail(state?.user, data?.email);

        if (state?.role?.toLowerCase() === "parent" && result?.success) {
          await supabase
            .from("participant")
            .update({
              parent_email: data?.email,
              updated_at: new Date().toISOString(),
            })
            .eq("parent_id", state?.user_profile_id);
        }
      }

      showToast(globalDispatch, "Profile update sucessfully.");
      setOpen(false);
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, "Failed update profile.");
    }
    setIsLoading(false);
  };

  const handleSubmitForm = () => {
    if (formRef?.current) {
      formRef?.current?.requestSubmit();
    }
  };

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("user_profile")
        .select("*")
        .eq("user_id", state?.user)
        .single();

      const { first_name, last_name, email, phone } = data;

      setPrevEmail(email);
      setValue("firstName", first_name || "");
      setValue("lastName", last_name || "");
      setValue("email", email || "");
      setValue("phoneNumber", phone || "");
    } catch (error) {}
    setIsFetching(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {" "}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <div className="fixed inset-0 overflow-hidden">
            {/* Overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-screen max-w-xl">
                  <div className="p-6 w-full flex flex-col min-h-screen h-full bg-white shadow-xl">
                    <div className="flex w-full items-center justify-between mb-6">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Edit Profile
                      </Dialog.Title>
                      <button
                        onClick={() => setOpen(false)}
                        className="mr-3 p-1 rounded-md text-gray-400 hover:text-gray-600"
                      >
                        {/* <ChevronLeftIcon className="h-6 w-6" /> */}
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {isFetching ? (
                      <div className="grid place-content-center h-full w-full">
                        <Spinner color="#000" loading={true} size={50} />
                      </div>
                    ) : (
                      <>
                        <form
                          ref={formRef}
                          className="flex-1"
                          onSubmit={handleSubmit(onSubmit)}
                        >
                          <div className="flex items-center gap-5 mb-5 w-full "></div>
                          <MkdInput
                            type={"text"}
                            name={"firstName"}
                            errors={errors}
                            label={"First Name"}
                            placeholder={""}
                            register={register}
                          />
                          <MkdInput
                            type={"text"}
                            name={"lastName"}
                            errors={errors}
                            label={"Last Name"}
                            placeholder={""}
                            register={register}
                          />
                          <MkdInput
                            type={"email"}
                            name={"email"}
                            errors={errors}
                            // disabled
                            label={"Email"}
                            placeholder={""}
                            register={register}
                            className={"mb-5"}
                          />
                          <MkdInput
                            type={"text"}
                            name={"phoneNumber"}
                            errors={errors}
                            label={"Phone Number"}
                            placeholder={""}
                            register={register}
                            className={"mb-5"}
                          />
                        </form>

                        <div className="flex items-center gap-7 mt-5">
                          <InteractiveButton
                            className={"flex-1"}
                            isSecondaryBtn={true}
                            onClick={() => {
                              setOpen(false);
                            }}
                          >
                            Cancel
                          </InteractiveButton>
                          <InteractiveButton
                            loading={isLoading}
                            disabled={isLoading}
                            type={"submit"}
                            className="flex-1"
                            onClick={handleSubmitForm}
                          >
                            Save Changes
                          </InteractiveButton>
                        </div>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
