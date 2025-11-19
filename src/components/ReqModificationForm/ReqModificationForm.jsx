import { InteractiveButton } from "Components/InteractiveButton";
import { SearchDropdown } from "Components/SearchDropdown";
import { SkeletonLoader } from "Components/Skeleton";
import { handleSingleDropdownChange } from "Utils/utils";
import React from "react";
import { FiAlertCircle } from "react-icons/fi";

export default function ReqModificationForm({
  electionType,
  allActivePetition,
  handlePetitionChange,
  isPrevRequested,
  isPetitionGetting,
  onSubmit,
  setValue,
  petition,
  races,
  parties,
  userSignature,
  submitLoading,
  errors,
  register,
  handleSubmit,
  selectedPetition,
  setSelectedPetition,
  selectedParty,
  setSelectedParty,
  selectedRace,
  setSelectedRace,
}) {
  return (
    <>
      {/* {electionType && allActivePetition.length < 1 ? ( */}
      {allActivePetition.length < 1 ? (
        <p className="mx-auto my-5 flex w-10/12 max-w-3xl gap-2 rounded-lg bg-red-200 p-5 ">
          {" "}
          <FiAlertCircle className="text-2xl text-orange-500" />{" "}
          <span>You don't have any active petition!</span>
        </p>
      ) : (
        <>
          <div className={`mb-8 border-b pb-5 `}>
            <SearchDropdown
              options={allActivePetition}
              selected_states={selectedPetition}
              label={"Select Petition By Race Name"}
              lableFontLarge={false}
              className={``}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={handlePetitionChange}
            />
          </div>

          {isPrevRequested && (
            <p className="my-5 flex gap-2 rounded-lg bg-red-200 p-5">
              {" "}
              <FiAlertCircle className="text-2xl text-orange-500" />{" "}
              <span>Your previous request is on pending!</span>
            </p>
          )}

          {isPetitionGetting ? (
            <SkeletonLoader />
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={`${!petition?.id ? "hidden" : ""}`}
            >
              <div className="relative mb-4">
                <label className="mb-2 block text-sm " htmlFor="name">
                  Candidate Name
                </label>

                <input
                  id="name"
                  disabled={isPrevRequested}
                  {...register("name")}
                  className={`focus:shadow-outline w-full appearance-none   bg-[#F5F5F5] px-3 py-2.5 text-sm leading-tight text-gray-700  disabled:cursor-not-allowed ${
                    errors?.name?.message
                      ? "border border-red-500"
                      : "border-none"
                  }`}
                  type="text"
                  placeholder="Name"
                />
                <p className="text-field-error italic text-red-500">
                  {errors?.name?.message}
                </p>
                <p className="mt-2 text-sm text-[#E73E3E]">
                  I desire my name to appear as the above.
                </p>
              </div>

              <div className="mb-4">
                {/* <label className="mb-2 block text-sm" htmlFor="Races">
                  Races
                </label>
                <select
                  id="Races"
                  disabled={isPrevRequested}
                  placeholder={"Races"}
                  {...register("race")}
                  className={`focus:shadow-outline w-full appearance-none  bg-[#F5F5F5] px-3 py-2.5 text-sm capitalize leading-tight text-gray-700  disabled:cursor-not-allowed ${
                    errors?.race?.message ? "border border-red-500" : ""
                  }`}
                >
                  {races?.map((race, i) => (
                    <option
                      key={i}
                      value={race?.id}
                      // value={JSON.stringify(race)}
                      className="capitalize"
                    >
                      {race?.name}
                    </option>
                  ))}
                </select> */}

                <SearchDropdown
                  options={races}
                  disabled={isPrevRequested}
                  selected_states={selectedRace}
                  label={"Race"}
                  lableFontLarge={false}
                  className={``}
                  stateError={false}
                  errorMessage={""}
                  disableSearch={true}
                  stateChangeFn={(value) => {
                    handleSingleDropdownChange(
                      value,
                      setSelectedRace,
                      setValue,
                      "race"
                    );
                  }}
                />
                <p className="text-field-error italic text-red-500">
                  {errors?.race?.message}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-1 items-center justify-between gap-5 sm:grid-cols-2">
                <div>
                  <SearchDropdown
                    options={parties}
                    disabled={isPrevRequested}
                    selected_states={selectedParty}
                    label={"Party"}
                    lableFontLarge={false}
                    className={``}
                    stateError={false}
                    errorMessage={""}
                    disableSearch={true}
                    stateChangeFn={(value) => {
                      handleSingleDropdownChange(
                        value,
                        setSelectedParty,
                        setValue,
                        "party"
                      );
                    }}
                  />
                  <p className="text-field-error italic text-red-500">
                    {errors?.party?.message}
                  </p>
                </div>

                <div className="">
                  <label className="mb-2 block text-sm" htmlFor="Incumbent">
                    Incumbent
                  </label>
                  <select
                    id="Incumbent"
                    disabled
                    placeholder={"Incumbent"}
                    {...register("incumbent")}
                    className={`focus:shadow-outline w-full appearance-none border border-transparent bg-[#F5F5F5] px-3 py-2.5 text-sm leading-tight text-gray-700 disabled:cursor-not-allowed ${
                      errors?.incumbent?.message ? "border border-red-500" : ""
                    }`}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                  <p className="text-field-error italic text-red-500">
                    {errors?.incumbent?.message}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm" htmlFor="Email">
                  Email
                </label>
                <input
                  id="Email"
                  disabled
                  className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5] px-3 py-2.5 text-sm leading-tight text-gray-700  disabled:cursor-not-allowed ${
                    errors?.email?.message
                      ? "border border-red-500"
                      : "border-none"
                  }`}
                  {...register("email")}
                  type="email"
                  placeholder="example@mail.com"
                />
                <p className="text-field-error italic text-red-500">
                  {errors?.email?.message}
                </p>
              </div>

              <div className="mb-4 rounded-md bg-[#7ad6fd49] p-5">
                <label className="mb-2 block text-sm " htmlFor="name">
                  Enter your approval (e.g., 'I approve this ballot.') or note
                  any corrections needed.
                </label>

                <textarea
                  id="message"
                  disabled={isPrevRequested}
                  {...register("message")}
                  className={` min-h-[100px] w-full appearance-none rounded-lg   bg-[#F5F5F5] px-3 py-2 text-sm leading-tight text-gray-700 shadow-3 focus:ring-0 disabled:cursor-not-allowed ${
                    errors?.message?.message
                      ? "border border-red-500"
                      : "border-none"
                  }`}
                  placeholder="Your Message"
                />
                <p className="text-field-error italic text-red-500">
                  {errors?.message?.message}
                </p>
              </div>

              <div className="relative mb-4">
                <label className="mb-2 block text-sm">Signature </label>
                <img src={userSignature} alt="" className="bg-[#f5f5f5]" />
              </div>

              <div className={`flex items-center justify-center `}>
                <InteractiveButton
                  className="text- rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#b877eb] disabled:to-[#b877eb]"
                  type="submit"
                  loading={submitLoading}
                  disabled={submitLoading || isPrevRequested}
                >
                  Send Modification Request
                </InteractiveButton>
              </div>
            </form>
          )}
        </>
      )}
    </>
  );
}
