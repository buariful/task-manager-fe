// import React from "react";
// import Select from "react-select";

// const customStyles = {
//   control: (base, state) => ({
//     ...base,
//     backgroundColor: "var(--color-input-bg)", // dynamic
//     boxShadow: "none",
//     border: "none",
//     borderBottom: "1px solid var(--color-accent)",
//     padding: "2px 4px",
//     minHeight: "44px",
//     fontSize: "0.875rem",
//     "&:hover": {
//       borderBottom: "1px solid var(--color-accent)",
//     },
//     borderRadius: "0",
//   }),
//   valueContainer: (base) => ({
//     ...base,
//     padding: "0 8px",
//     gap: "4px",
//   }),
//   multiValue: (base) => ({
//     ...base,
//     backgroundColor: "#fff",
//     borderColor: "var(--color-neutral-gray)",
//     borderWidth: "1px",
//     borderRadius: "1rem",
//     padding: "2px",
//   }),
//   multiValueLabel: (base) => ({
//     ...base,
//     color: "var(--color-accent)",
//     fontWeight: 500,
//   }),
//   multiValueRemove: (base) => ({
//     ...base,
//     color: "var(--color-custom-gray)",
//     cursor: "pointer",
//     ":hover": { backgroundColor: "transparent", color: "red" },
//   }),
//   menu: (base) => ({
//     ...base,
//     borderRadius: "0.5rem",
//     marginTop: 2,
//   }),
//   option: (base, state) => ({
//     ...base,
//     backgroundColor: state.isSelected
//       ? "var(--color-light-info)"
//       : state.isFocused
//       ? "var(--color-light-info)" // hover
//       : "white", // default
//     cursor: "pointer",
//     fontSize: "0.875rem",
//     ":active": {
//       backgroundColor: "var(--color-light-info)",
//     },
//   }),
// };

// const MultiSelectDropdown = ({
//   label,
//   options,
//   selected,
//   onChange,
//   parentClassName,
// }) => {
//   const SELECT_ALL_OPTION = { label: "Select All", value: "*" };
//   const mergedOptions = [SELECT_ALL_OPTION, ...options];
//   return (
//     <div className={`${parentClassName}`}>
//       {label ? (
//         <label className="mb-2 block cursor-pointer text-accent text-sm font-[400]">
//           {label}
//         </label>
//       ) : null}

//       <Select
//         isMulti
//         styles={customStyles}
//         options={mergedOptions}
//         // options={options}
//         value={selected}
//         onChange={onChange}
//         placeholder="Select..."
//         closeMenuOnSelect={false}
//       />
//     </div>
//   );
// };

// export default MultiSelectDropdown;

import React from "react";
import Select from "react-select";

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--color-input-bg)",
    boxShadow: "none",
    border: "none",
    borderBottom: "1px solid var(--color-accent)",
    padding: "2px 4px",
    minHeight: "44px",
    fontSize: "0.875rem",
    "&:hover": {
      borderBottom: "1px solid var(--color-accent)",
    },
    borderRadius: "0",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
    gap: "4px",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#fff",
    borderColor: "var(--color-neutral-gray)",
    borderWidth: "1px",
    borderRadius: "1rem",
    padding: "2px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--color-accent)",
    fontWeight: 500,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--color-custom-gray)",
    cursor: "pointer",
    ":hover": { backgroundColor: "transparent", color: "red" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    marginTop: 2,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--color-light-info)"
      : state.isFocused
      ? "var(--color-light-info)"
      : "white",
    cursor: "pointer",
    fontSize: "0.875rem",
    ":active": {
      backgroundColor: "var(--color-light-info)",
    },
  }),
};

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  parentClassName,
  enableSelectAll = false,
}) => {
  const SELECT_ALL_OPTION = { label: "Select All", value: "*" };
  const mergedOptions = enableSelectAll
    ? [SELECT_ALL_OPTION, ...options]
    : options;

  const handleChange = (selectedOptions) => {
    if (enableSelectAll) {
      const lastSelected = selectedOptions?.[selectedOptions.length - 1];
      if (lastSelected?.value === "*") {
        // If user clicks Select All → select all normal options
        onChange(options);
        return;
      }
    }

    // Normal multi-select behavior → remove "Select All" if exists
    const filtered = selectedOptions?.filter((opt) => opt.value !== "*") || [];
    onChange(filtered);
  };

  return (
    <div className={`${parentClassName}`}>
      {label && (
        <label className="mb-2 block cursor-pointer text-accent text-sm font-[400]">
          {label}
        </label>
      )}

      <Select
        isMulti
        styles={customStyles}
        options={mergedOptions}
        value={selected}
        onChange={handleChange}
        placeholder="Select..."
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default MultiSelectDropdown;
