import React, { useState } from "react";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { SearchDropdown } from "Components/SearchDropdown";
import {
  handleSingleDropdownChange,
  county_change,
  state_county_change,
} from "Utils/utils";
import All_states from "../../utils/states.json";

export default function AdminPartyFilter({ setFilter, getData, pageSize }) {
  const [electionType, setElectionType] = useState([]);
  const [selected_states, setSelected_states] = useState([]);
  const [stateError, setStateError] = useState(false);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);
  const [countyError, setCountyError] = useState(false);

  const schema = yup.object({
    state: yup.string(),
    county: yup.string(),
    type: yup.string(),
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const electionTypeOption = [
    { label: "All", value: "" },
    { label: "County", value: 1 },
    { label: "State", value: 2 },
  ];

  const handleElecSearch = (data) => {
    let filterData = [];

    if (data?.type) filterData.push(`election_type,eq,${data?.type}`);
    if (data?.state) filterData.push(`state,eq,'${data?.state}'`);
    if (data?.county) filterData.push(`county,eq,'${data?.county}'`);

    getData(1, pageSize, filterData);
    setFilter(filterData);
  };

  const resetSearch = async () => {
    reset();
    setFilter([]);
    setElectionType([]);
    setSelected_states([]);
    setFiltered_counties([]);
    setSelected_county([]);
    getData(1, 10);
  };

  const handleStateChange = (value) => {
    try {
      state_county_change(
        value,
        setSelected_states,
        setFiltered_counties,
        setSelected_county,
        electionType
      );
      handleSingleDropdownChange(value, setSelected_states, setValue, "state");
    } catch (error) {
      console.log("handleStateChange", error?.message);
    }
  };
  const handleCountyChange = (value) => {
    try {
      county_change(value, setSelected_county);
      handleSingleDropdownChange(value, setSelected_county, setValue, "county");
    } catch (error) {
      console.log("handleStateChange", error?.message);
    }
  };

  const handleElectionTypeChange = (value) => {
    try {
      handleSingleDropdownChange(value, setElectionType, setValue, "type");

      let stateType = "";
      value?.length < 2
        ? (stateType = value[0]?.value)
        : (stateType = value[value?.length - 1]?.value);

      if (Number(stateType) === 2) {
        setValue("county", "");
        setSelected_county([]);
      }
    } catch (error) {
      console.log("handleElectionTypeChange->>", error?.message);
    }
  };

  return (
    <FilterBoxBg className={"mb-10"}>
      <form
        action=""
        onSubmit={handleSubmit(handleElecSearch)}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <h4
          className="mb-3 text-xl font-medium"
          style={{ fontFamily: "Roboto, sans-serif" }}
        >
          Search Parties
        </h4>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          <SearchDropdown
            options={electionTypeOption}
            selected_states={electionType}
            label={"Election Type"}
            lableFontLarge={false}
            className={` `}
            stateError={false}
            errorMessage={""}
            disableSearch={true}
            stateChangeFn={handleElectionTypeChange}
          />

          <SearchDropdown
            options={All_states}
            selected_states={selected_states}
            label={"State"}
            lableFontLarge={false}
            className={"mb-4"}
            stateError={false}
            errorMessage={""}
            stateChangeFn={handleStateChange}
          />
          <SearchDropdown
            options={filtered_counties}
            selected_states={selected_county}
            label={"County"}
            lableFontLarge={false}
            disabled={filtered_counties?.length < 1}
            stateChangeFn={handleCountyChange}
            stateError={countyError}
            errorMessage={"County is a required field"}
            className={`mb-8 ${
              Number(electionType[0]?.value) == 2 ? "hidden" : ""
            }`}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            className=" rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
          >
            Submit
          </button>
          <p
            className=" cursor-pointer rounded bg-gradient-to-tr from-red-600 to-red-500 px-4 py-2 text-sm  font-[600] text-white hover:from-red-600 hover:to-red-600"
            onClick={resetSearch}
          >
            Clear
          </p>
        </div>
      </form>
    </FilterBoxBg>
  );
}
