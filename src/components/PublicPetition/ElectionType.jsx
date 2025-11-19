import React from "react";
import { SearchDropdown } from "Components/SearchDropdown";
import All_states from "../../utils/states.json";
import { county_change, state_county_change } from "Utils/utils";

export default function ElectionType({
  selectedElType,
  setSelectedElType,
  selected_states,
  setSelected_states,
  stateError,
  setStateError,
  filtered_counties,
  setFiltered_counties,
  selected_county,
  setSelected_county,
  countyError,
  setCountyError,
  getElection,
}) {
  return (
    <div className="min-h-[50vh]">
      <div className="mb-5">
        <label className="mb-2 block text-sm">Election Type</label>
        <select
          placeholder={"Election Type"}
          className={`focus:shadow-outline w-full cursor-pointer appearance-none border border-transparent bg-[#F5F5F5] px-3 py-2.5 leading-tight text-gray-700   `}
          onChange={(e) => setSelectedElType(e.target.value)}
        >
          <option value={1}>County</option>
          <option value={2}>State</option>
        </select>
      </div>
      <SearchDropdown
        options={All_states}
        selected_states={selected_states}
        label={"State"}
        lableFontLarge={false}
        className={"mb-4"}
        stateError={stateError}
        errorMessage={"State is a required field"}
        stateChangeFn={(value) => {
          setStateError(false);
          state_county_change(
            value,
            setSelected_states,
            setFiltered_counties,
            setSelected_county,
            selectedElType
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
        className={`mb-8 ${Number(selectedElType) == 2 ? "hidden" : ""}`}
      />
      <div className="flex justify-center">
        <button
          onClick={getElection}
          disabled={selected_county?.length === 0}
          className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#9b51d3ce] disabled:to-[#9b51d3ce]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
