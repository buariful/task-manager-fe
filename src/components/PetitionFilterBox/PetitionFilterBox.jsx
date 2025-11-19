import { FilterBoxBg } from "Components/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";

export default function PetitionFilterBox({
  handleSearch,

  isAdmin = false,
  electionType,
  selected_county,
  selected_states,
  setElectionType,
  setSelected_county,
  setSelected_states,
  electionTypeErrorMessage,
  setElectionTypeErrorMessage,
  stateErrorMessage,
  setStateErrorMessage,
  countyErrorMessage,
  setCountyErrorMessage,
  filtered_counties,
  setFiltered_counties,
}) {
  const schema = yup
    .object({
      race_name: yup.string(),
      candidate_name: yup.string(),
      // email: yup.string().required("Email is required"),
      email: yup.string(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <div>
      {" "}
      <FilterBoxBg>
        <SectionTitle
          fontRoboto={true}
          text={"Search Previous Petition"}
          className={""}
        />
        <form className=" w-full " onSubmit={handleSubmit(handleSearch)}>
          <div className=" grid grid-cols-1 gap-5 py-3 sm:grid-cols-2 md:grid-cols-3">
            {isAdmin ? (
              <ElectionTypeStateCountySelect
                electionType={electionType}
                selected_county={selected_county}
                selected_states={selected_states}
                setElectionType={setElectionType}
                setSelected_county={setSelected_county}
                setSelected_states={setSelected_states}
                // setValue={setValue}
                electionTypeErrorMessage={electionTypeErrorMessage}
                setElectionTypeErrorMessage={setElectionTypeErrorMessage}
                stateErrorMessage={stateErrorMessage}
                setStateErrorMessage={setStateErrorMessage}
                countyErrorMessage={countyErrorMessage}
                setCountyErrorMessage={setCountyErrorMessage}
                filtered_counties={filtered_counties}
                setFiltered_counties={setFiltered_counties}
              />
            ) : null}

            <div className="">
              <label
                className="mb-2 block text-sm font-[400]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Race Name
              </label>

              <input
                type="text"
                placeholder="Race Name"
                {...register("race_name")}
                className={`focus:shadow-outline w-full appearance-none border-none bg-[#F5F5F5] px-4 py-2.5 text-sm  leading-tight  focus:outline-none`}
              />
            </div>
            <div className="">
              <label
                className="mb-2 block text-sm font-[400]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Candidate Name
              </label>
              <input
                type="text"
                placeholder="Candidate Name"
                {...register("candidate_name")}
                className={`focus:shadow-outline w-full appearance-none  border-none bg-[#F5F5F5] px-4 py-2.5 text-sm leading-tight  focus:outline-none`}
              />
            </div>
            <div className="">
              <label
                className="mb-2 block text-sm font-[400]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Email
              </label>
              <input
                type="text"
                placeholder="Email"
                {...register("email")}
                className={`focus:shadow-outline w-full appearance-none  border-none bg-[#F5F5F5] px-4 py-2.5 text-sm leading-tight  focus:outline-none`}
              />
              <p className="text-field-error text-xs italic text-red-500">
                {errors?.email?.message}
              </p>
            </div>
          </div>
          <button
            type="submit"
            className=" rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
          >
            Search
          </button>
        </form>
      </FilterBoxBg>
    </div>
  );
}
