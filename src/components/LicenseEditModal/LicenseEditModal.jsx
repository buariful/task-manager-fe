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
import { FaMinus, FaPlus, FaSackXmark } from "react-icons/fa6";
import { updateUserEmail } from "Utils/utils";

export default function LicenseEditModal({ open, setOpen, organizationId }) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [prevEmail, setPrevEmail] = useState("");

  const formRef = useRef();

  const schema = yup
    .object({
      join_date: yup
        .date()
        .typeError("Invalid date")
        .required("Date is required"),
      expiry_date: yup
        .date()
        .typeError("Invalid date")
        .required("Date is required"),
      no_of_license: yup
        .number("Number of license is required")
        .transform((value, originalValue) => {
          // if the user leaves the field empty, treat it as undefined
          return originalValue === "" ? undefined : value;
        })
        .required("Number of license is required")
        .min(1, "Minimum number is 1"),
    })
    .required();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("license")
        .update({
          expire_at: data?.expiry_date,
          no_of_license: data?.no_of_license,
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", organizationId);

      if (error) throw Error("Failed to update the license.");

      showToast(globalDispatch, "License updated sucessfully.");
      setOpen(false);
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, "Failed to update the license.");
    }
    setIsLoading(false);
  };

  const handleSubmitForm = () => {
    if (formRef?.current) {
      formRef?.current?.requestSubmit();
    }
  };

  const increment = () => {
    const current = Number(getValues("no_of_license"));
    setValue("no_of_license", current + 1);
  };

  const decrement = () => {
    const current = Number(getValues("no_of_license"));
    if (current > 1) {
      setValue("no_of_license", current - 1);
    } else {
      setValue("no_of_license", 1);
    }
  };

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("license")
        .select("*")
        .eq("organization_id", organizationId)
        .single();

      const { joined_at, expire_at, no_of_license } = data;

      setValue("join_date", joined_at?.split("T")[0]);
      setValue("expiry_date", expire_at?.split("T")[0]);
      setValue("no_of_license", no_of_license);
    } catch (error) {}
    setIsFetching(false);
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

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
                          <div className="flex items-center gap-5">
                            <MkdInput
                              type={"date"}
                              name={"join_date"}
                              disabled
                              errors={errors}
                              label={"Join Date"}
                              placeholder={"Date"}
                              register={register}
                            />

                            <MkdInput
                              type={"date"}
                              name={"expiry_date"}
                              errors={errors}
                              label={"Expiry Date"}
                              placeholder={"Date"}
                              register={register}
                            />
                          </div>

                          <div>
                            <label
                              className={`mb-2 block cursor-pointer text-sm font-[400] `}
                            >
                              No. of License
                            </label>
                            <div className="flex border-b border-b-accent items-center ">
                              <button type="button" onClick={decrement}>
                                <FaMinus />
                              </button>
                              <MkdInput
                                type={"number"}
                                name={"no_of_license"}
                                errors={errors}
                                // label={"No. of Licenses"}
                                placeholder={"No. of License"}
                                register={register}
                                parentClassNames="!mb-0 flex-1"
                                className={"!border-0 "}
                              />
                              <button
                                type="button"
                                className=""
                                onClick={increment}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
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
