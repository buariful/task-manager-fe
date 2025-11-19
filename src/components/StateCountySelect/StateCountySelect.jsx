import { SearchDropdown } from "Components/SearchDropdown";
import React from "react";
import All_states from "../../utils/states.json";
import {
  county_change,
  handleSingleDropdownChange,
  state_county_change,
} from "Utils/utils";

export default function StateCountySelect({
  electionType,
  selected_county,
  setSelected_county,
  selected_states,
  setSelected_states,
  stateErrorMessage,
  setStateErrorMessage,
  countyErrorMessage,
  setCountyErrorMessage,
  filtered_counties,
  setFiltered_counties,
}) {
  const handleStateChange = (value) => {
    try {
      setStateErrorMessage("");
      setCountyErrorMessage("");
      state_county_change(
        value,
        setSelected_states,
        setFiltered_counties,
        setSelected_county,
        electionType
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
      <SearchDropdown
        options={All_states}
        selected_states={selected_states}
        label={"State"}
        lableFontLarge={false}
        className={"mb-4"}
        stateError={stateErrorMessage}
        errorMessage={stateErrorMessage}
        stateChangeFn={handleStateChange}
      />
      <SearchDropdown
        options={filtered_counties}
        selected_states={selected_county}
        label={"County"}
        lableFontLarge={false}
        disabled={filtered_counties?.length < 1}
        stateChangeFn={handleCountyChange}
        stateError={countyErrorMessage}
        errorMessage={countyErrorMessage}
        className={`mb-4 `}
      />
    </>
  );
}
