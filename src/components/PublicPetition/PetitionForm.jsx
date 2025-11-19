import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SearchDropdown } from "Components/SearchDropdown";
import { county_change, handleSingleDropdownChange } from "Utils/utils";
import ReactSignatureCanvas from "react-signature-canvas";
import { GoPencil } from "react-icons/go";
import { InteractiveButton } from "Components/InteractiveButton";

export default function PetitionForm({
  onSubmit,
  races,
  selected_race,
  setSelected_race,
  setRaceError,
  raceError,
  parties,
  selected_party,
  setSelected_party,
  partyError,
  setPartyError,
  signatureRef,
  hasSignatureError,
  setHasSignatureError,
  setSignatureData,
  submitLoading,
  activeElection,
  incumbentOptions,
  selectedIncumbOpt,
  setSelectedIncumbOpt,
}) {
  const schema = yup
    .object({
      name: yup.string().required("Name is a required field."),
      // race: yup.string().required("Races is a required field."),
      // party: yup.string().required("Party is a required field."),
      incumbent: yup.string().required("Incumbent is a required field."),
      email: yup
        .string()
        .email("Email must be a valid email.")
        .required("Email is a required field."),
      address: yup.string().required("Address is a required field."),
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

  React.useEffect(() => {
    setValue("incumbent", 0);
  }, []);

  return (
    <>
      {" "}
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(data);
          setSelectedIncumbOpt([incumbentOptions[0]]);
          reset();
          setValue("incumbent", 0);
        })}
        className=""
      >
        <div className="relative mb-5">
          <label className="mb-2 block text-sm " htmlFor="name">
            Candidate Name
          </label>

          <input
            id="name"
            {...register("name")}
            className={`focus:shadow-outline w-full appearance-none   bg-[#F5F5F5] px-3 py-2  leading-tight text-gray-700   ${
              errors?.name?.message ? "border border-red-500" : "border-none"
            }`}
            type="text"
            placeholder="Name"
          />
          <p className="text-field-error italic text-red-500">
            {errors?.name?.message}
          </p>
          <p className="mt-2 text-[#E73E3E]">
            I desire my name to appear as the above.
          </p>
        </div>

        <SearchDropdown
          options={races}
          selected_states={selected_race}
          label={"Race"}
          stateError={raceError}
          errorMessage={"Please select a race."}
          stateChangeFn={(value) => {
            setRaceError(false);
            county_change(value, setSelected_race);
          }}
          className={"mb-5"}
        />
        <div className="mb-5 grid grid-cols-2  gap-5">
          <SearchDropdown
            options={parties}
            selected_states={selected_party}
            label={"Party"}
            stateError={partyError}
            errorMessage={"Please select a party."}
            stateChangeFn={(value) => {
              setPartyError(false);
              county_change(value, setSelected_party);
            }}
            className={""}
          />
          {/* <div className="">
            <label className="mb-2 block text-sm" htmlFor="Incumbent">
              Incumbent
            </label>
            <select
              id="Incumbent"
              placeholder={"Incumbent"}
              {...register("incumbent")}
              className={`focus:shadow-outline w-full appearance-none border border-transparent bg-[#F5F5F5] px-3 py-2.5 leading-tight text-gray-700   ${
                errors?.incumbent?.message ? "border border-red-500" : ""
              }`}
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
            <p className="text-field-error italic text-red-500">
              {errors?.incumbent?.message}
            </p>
          </div> */}
          <SearchDropdown
            options={incumbentOptions}
            selected_states={selectedIncumbOpt}
            label={"Incumbent"}
            lableFontLarge={false}
            className={``}
            stateError={false}
            errorMessage={""}
            disableSearch={true}
            stateChangeFn={(value) => {
              handleSingleDropdownChange(
                value,
                setSelectedIncumbOpt,
                setValue,
                "incumbent"
              );
            }}
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm" htmlFor="Email">
            Email
          </label>
          <input
            id="Email"
            className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5] px-3 py-2.5  leading-tight text-gray-700  ${
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

        <div className="mb-5">
          <label className="mb-2 block text-sm" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            className={`w-full appearance-none rounded border-transparent bg-[#F5F5F5] px-3 py-2.5 text-sm leading-tight text-gray-700 shadow-[0_2px_8px_0_rgba(99,99,99,0.2)] focus:ring-0  `}
            {...register("address")}
            placeholder="Your Address"
          />
          <p className="text-field-error italic text-red-500">
            {errors?.address?.message}
          </p>
        </div>
        <div className="relative mb-8">
          <label className="mb-2 block text-sm">Signature pad</label>

          <ReactSignatureCanvas
            ref={signatureRef}
            penColor="black"
            canvasProps={{
              //   width: 400,
              //   height: 200,
              className: `signature-canvas  w-full h-[200px] bg-[#f5f5f5] rounded-md shadow-md ${
                hasSignatureError ? "border border-red-500" : "border-none"
              }`,
            }}
            onEnd={(e) => {
              const dataURL = signatureRef.current.toDataURL();
              setSignatureData(dataURL);
            }}
            onBegin={() => {
              setHasSignatureError(false);
            }}
          />
          <p className="text-field-error italic text-red-500">
            {hasSignatureError ? "Please add a signature." : ""}
          </p>
          <div className="mt-2 flex justify-end">
            <p
              onClick={() => {
                signatureRef.current.clear();
                setSignatureData(null);
              }}
              className="cursor-pointer rounded bg-red-400 px-4 py-2 text-xs text-white hover:bg-red-600"
            >
              Clear
            </p>
          </div>
          <GoPencil className="absolute right-3 top-10 text-xl" />
        </div>

        <div className="flex items-center justify-center">
          <InteractiveButton
            className=" rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#9b51d3ce] disabled:to-[#9b51d3ce]"
            type="submit"
            loading={submitLoading}
            disabled={submitLoading || !activeElection?.id}
          >
            Submit
          </InteractiveButton>
        </div>
      </form>
    </>
  );
}
