import React from "react";
import { StringCaser } from "Utils/utils";

const MkdInput = ({
  type = "text",
  page,
  cols = "30",
  rows = "5",
  name,
  label,
  errors,
  register,
  className,
  placeholder,
  options = [],
  mapping = null,
  disabled = false,
  labelClassNames = "",
  parentClassNames = "",
  onBlur = () => {},
}) => {
  return (
    <>
      <div
        className={`mb-4 ${
          page === "list" ? "w-full pl-2 pr-2 md:w-1/2" : ""
        } ${parentClassNames}`}
      >
        {label ? (
          <label
            className={`mb-2 block cursor-pointer text-sm font-[400] ${labelClassNames}`}
            htmlFor={name}
          >
            {StringCaser(label, { casetype: "capitalize", separator: "space" })}
          </label>
        ) : null}
        {type === "textarea" ? (
          <textarea
            className={`focus:shadow-outline border-0 focus:ring-0 w-full border-b border-b-accent  appearance-none bg-input-bg px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none ${className} ${
              errors[name]?.message ? "" : ""
            }`}
            disabled={disabled}
            id={name}
            cols={cols}
            name={name}
            placeholder={placeholder}
            rows={rows}
            {...register(name)}
            onBlur={onBlur}
          ></textarea>
        ) : type === "radio" || type === "checkbox" || type === "color" ? (
          <input
            disabled={disabled}
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            {...register(name)}
            className={`focus:shadow-outline bg-red-500 cursor-pointer appearance-none rounded border px-3 py-2 text-sm leading-tight text-gray-700 shadow focus:outline-none ${className} ${
              errors[name]?.message ? "border-red-500" : ""
            } ${type === "color" ? "min-h-[3.125rem] min-w-[6.25rem]" : ""}`}
            onBlur={onBlur}
          />
        ) : type === "dropdown" || type === "select" ? (
          <select
            type={type}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            {...register(name)}
            className={`focus:shadow-outline w-full resize-none capitalize appearance-none border  bg-input-bg px-4  py-2.5 text-sm leading-tight   outline-none focus:outline-none ${className} ${
              errors[name]?.message ? "border-red-500" : ""
            }`}
            // className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-input-bg px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none ${className} ${
            //   errors[name]?.message ? "border-red-500" : "border-transparent"
            // }`}
            onBlur={onBlur}
          >
            {/* <option></option> */}
            {options.map((option, key) => (
              <option
                className="capitalize"
                value={option?.value}
                key={key + 1}
              >
                {option?.label}
              </option>
            ))}
          </select>
        ) : type === "mapping" ? (
          <>
            {mapping ? (
              <select
                type={type}
                id={name}
                disabled={disabled}
                placeholder={placeholder}
                {...register(name)}
                className={`focus:shadow-outline w-full resize-none appearance-none rounded border  bg-input-bg px-4  py-2.5 text-sm leading-tight  outline-none focus:outline-none ${className} ${
                  errors[name]?.message
                    ? "border-red-500"
                    : "border-transparent"
                }`}
                onBlur={onBlur}
              >
                <option></option>
                {options.map((option, key) => (
                  <option className="capitalize" value={option} key={key + 1}>
                    {mapping[option]}
                  </option>
                ))}
              </select>
            ) : (
              `Please Pass the mapping e.g {key:value}`
            )}
          </>
        ) : (
          <input
            type={type}
            id={name}
            disabled={disabled}
            placeholder={placeholder}
            {...register(name)}
            className={`focus:shadow-outline w-full resize-none appearance-none    bg-input-bg px-4  py-2.5 text-sm leading-tight   outline-none focus:outline-none ${className} ${
              errors[name]?.message
                ? "border-b border-red-500"
                : "border-b border-b-yellow-500"
            }`}
            onBlur={onBlur}
          />
          // <input
          //   type={type}
          //   id={name}
          //   disabled={disabled}
          //   placeholder={placeholder}
          //   {...register(name)}
          //   className={`focus:shadow-outline border-red-500 w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-4  py-2.5 text-sm leading-tight   outline-none focus:outline-none ${className} ${
          //     errors[name]?.message ? "border-red-500" : "border-transparent"
          //   }`}
          // />
        )}
        <p className="text-field-error italic text-red-500">
          {errors[name]?.message}
        </p>
      </div>
    </>
  );
};

export default MkdInput;
