import { InteractiveButton } from "Components/InteractiveButton";
import { SearchDropdown } from "Components/SearchDropdown";
import React from "react";
import { IoClose } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import All_states from "../../utils/states.json";
import { county_change, state_county_change } from "Utils/utils";
import { Modal } from "Components/Modal";

export default function ReqDemoModal({
  modalOpen,
  setModalOpen,
  onSubmit,
  selected_states,
  stateError,
  setStateError,
  setSelected_states,
  setFiltered_counties,
  setSelected_county,
  filtered_counties,
  selected_county,
  countyError,
  setCountyError,
  submitLoading,
}) {
  const schema = yup
    .object({
      name: yup.string().required("Name is a required field."),
      email: yup
        .string()
        .email("Email must be a valid email.")
        .required("Email is a required field."),
      phone: yup.string().required("Phone Number is a required field."),
    })
    .required();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRequest = (data) => {
    reset();
    setSelected_states([]);
    setSelected_county([]);
    onSubmit(data);
  };
  return (
    <>
      {" "}
      <Modal
        isOpen={modalOpen}
        classes={{ modalDialog: "w-11/12 mx-auto max-w-2xl relative" }}
      >
        <IoClose
          className="absolute right-3 top-3 cursor-pointer text-3xl hover:text-red-500"
          onClick={() => setModalOpen(false)}
        />
        <div className="flex justify-center">
          <h4>Enter Your Information</h4>
        </div>
        <form onSubmit={handleSubmit(handleRequest)} className="">
          <div className="relative mb-3">
            <label className="mb-2 block text-sm " htmlFor="name">
              Name
            </label>

            <input
              id="name"
              {...register("name")}
              className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5]  px-3 py-2 text-sm  leading-tight text-gray-700   ${
                errors?.name?.message ? "border border-red-500" : "border-none"
              }`}
              type="text"
              placeholder="Name"
            />
            <p className="text-field-error italic text-red-500">
              {errors?.name?.message}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-5">
            <SearchDropdown
              options={All_states}
              selected_states={selected_states}
              label={"State"}
              lableFontLarge={false}
              className={"mb-3"}
              stateError={stateError}
              errorMessage={"State is a required field"}
              stateChangeFn={(value) => {
                setStateError(false);
                state_county_change(
                  value,
                  setSelected_states,
                  setFiltered_counties,
                  setSelected_county
                );
              }}
            />
            <SearchDropdown
              options={filtered_counties}
              selected_states={selected_county}
              label={"County"}
              lableFontLarge={false}
              disabled={filtered_counties?.length < 1}
              stateChangeFn={(value) => {
                setCountyError(false);
                county_change(value, setSelected_county);
              }}
              stateError={countyError}
              errorMessage={"County is a required field"}
              className={"mb-3"}
            />
          </div>

          <div className="mb-3">
            <label className="mb-2 block text-sm" htmlFor="Email">
              Email
            </label>
            <input
              id="Email"
              className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5] px-3 py-2.5 text-sm  leading-tight text-gray-700  ${
                errors?.email?.message ? "border border-red-500" : "border-none"
              }`}
              {...register("email")}
              type="email"
              placeholder="example@mail.com"
            />
            <p className="text-field-error italic text-red-500">
              {errors?.email?.message}
            </p>
          </div>

          <div className="mb-3">
            <label className="mb-2 block text-sm" htmlFor="phone_number">
              Phone number
            </label>
            <input
              id="phone_number"
              className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5] px-3 py-2.5  text-sm leading-tight text-gray-700  ${
                errors?.phone?.message ? "border border-red-500" : "border-none"
              }`}
              {...register("phone")}
              type="text"
              placeholder="Phone Number"
            />
            <p className="text-field-error italic text-red-500">
              {errors?.phone?.message}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <InteractiveButton
              className="text- rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#9b51d3ce] disabled:to-[#9b51d3ce]"
              type="submit"
              loading={submitLoading}
              disabled={submitLoading}
            >
              Send Request
            </InteractiveButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
