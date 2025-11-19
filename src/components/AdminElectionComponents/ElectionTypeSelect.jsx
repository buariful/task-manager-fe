import { SearchDropdown } from "Components/SearchDropdown";
import React from "react";

export default function ElectionTypeSelect({
  selectedValue,
  electionTypeChangeFn,
  label = "Election Type",
  labelFontLarge = false,
  className,
  isError = false,
  errorMessage = "",
  disableSearch = true,
  withOptionAll = false,
  disabled = false,
}) {
  const electionTypeOption = [
    { label: "All", value: "" },
    { label: "County", value: 1 },
    { label: "State", value: 2 },
  ];
  const electionTypeOption2 = [
    { label: "County", value: 1 },
    { label: "State", value: 2 },
  ];
  return (
    <SearchDropdown
      options={withOptionAll ? electionTypeOption : electionTypeOption2}
      selected_states={selectedValue}
      label={label}
      lableFontLarge={labelFontLarge}
      className={className}
      stateError={errorMessage}
      errorMessage={errorMessage}
      disableSearch={disableSearch}
      stateChangeFn={electionTypeChangeFn}
      disabled={disabled}
    />
  );
}
