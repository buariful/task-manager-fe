import { SearchDropdown } from "Components/SearchDropdown";
import React, { useState } from "react";
import { ElectionTypeSelect } from ".";
import All_states from "../../utils/states.json";
import {
  handleSingleDropdownChange,
  state_county_change,
  county_change,
} from "Utils/utils";

export default function ElectionTypeStateCountySelect({
  electionType,
  setElectionType,
  selected_county,
  setSelected_county,
  selected_states,
  setSelected_states,
  withOptionAll = false,
  electionTypeErrorMessage,
  setElectionTypeErrorMessage,
  stateErrorMessage,
  setStateErrorMessage,
  countyErrorMessage,
  setCountyErrorMessage,
  filtered_counties,
  setFiltered_counties,
  electionTypeDisabled,
  stateSelectDisabled,
  countySelectDisabled,
}) {
  const handleElectionTypeChange = (value) => {
    try {
      setElectionTypeErrorMessage("");
      setCountyErrorMessage("");
      handleSingleDropdownChange(
        value,
        setElectionType,
        () => {},
        "electionType"
      );

      let stateType = "";
      value?.length < 2
        ? (stateType = value[0]?.value)
        : (stateType = value[value?.length - 1]?.value);

      if (Number(stateType) === 2) {
        setSelected_county([]);
      }
    } catch (error) {
      console.log("handleElectionTypeChange->>", error?.message);
    }
  };

  const handleStateChange = (value) => {
    try {
      setStateErrorMessage("");
      setCountyErrorMessage("");
      state_county_change(
        value,
        setSelected_states,
        setFiltered_counties,
        setSelected_county,
        electionType[0]?.value
      );
      handleSingleDropdownChange(value, setSelected_states, () => {}, "state");
    } catch (error) {
      console.log("handleStateChange", error?.message);
    }
  };
  const handleCountyChange = (value) => {
    try {
      setCountyErrorMessage("");
      county_change(value, setSelected_county);
      handleSingleDropdownChange(value, setSelected_county, () => {}, "county");
    } catch (error) {
      console.log("handleStateChange", error?.message);
    }
  };
  return (
    <>
      <ElectionTypeSelect
        errorMessage={electionTypeErrorMessage}
        selectedValue={electionType}
        electionTypeChangeFn={handleElectionTypeChange}
        withOptionAll={withOptionAll}
        className={"mb-4"}
        disabled={electionTypeDisabled}
      />

      <SearchDropdown
        options={All_states}
        selected_states={selected_states}
        label={"State"}
        lableFontLarge={false}
        className={"mb-4"}
        stateError={stateErrorMessage}
        errorMessage={stateErrorMessage}
        stateChangeFn={handleStateChange}
        disabled={stateSelectDisabled}
      />
      <SearchDropdown
        options={filtered_counties}
        selected_states={selected_county}
        label={"County"}
        lableFontLarge={false}
        disabled={filtered_counties?.length < 1 || countySelectDisabled}
        stateChangeFn={handleCountyChange}
        stateError={countyErrorMessage}
        errorMessage={countyErrorMessage}
        className={`mb-4 ${
          Number(electionType[0]?.value) == 2 ? "hidden" : ""
        }`}
      />
    </>
  );
}
