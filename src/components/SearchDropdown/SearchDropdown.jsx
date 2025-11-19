import { MultiSelect } from "react-multi-select-component";

const SearchDropdown = ({
  options,
  selected_states,
  stateChangeFn,
  stateError,
  className,
  withClearIcon,
  label,
  errorMessage,
  disabled,
  lableFontLarge,
  disableSearch = false,
  closeOnChangedValue = true,
}) => {
  return (
    <div className={`${className} `}>
      <label
        className={`mb-2 block ${
          lableFontLarge ? "text-xl" : "text-sm"
        } font-[400]`}
      >
        {label}
      </label>
      <MultiSelect
        options={options}
        value={selected_states}
        onChange={(value) => stateChangeFn(value)}
        closeOnChangedValue={closeOnChangedValue}
        hasSelectAll={false}
        disabled={disabled}
        disableSearch={disableSearch}
        valueRenderer={(selected, _options) => {
          return selected.length && selected[0]?.label
            ? selected.map(({ label }) => label)?.join(", ")
            : "Select...";
        }}
        labelledBy="Select..."
        className={`multiSelect_customStyle singleSelect ${
          stateError && "error"
        } ${withClearIcon && "showClearIcon"} ${
          disabled && "cursorNot_Allowed"
        }`}
      />
      {stateError && (
        <p className="text-field-error italic text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default SearchDropdown;
