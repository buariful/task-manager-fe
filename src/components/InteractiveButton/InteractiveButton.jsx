import React, { memo, useId } from "react";
import MoonLoader from "react-spinners/MoonLoader";
import { colors } from "Utils/config";

export const InteractiveButton = memo(
  ({
    loading = false,
    disabled,
    children,
    type = "button",
    className,
    loaderclasses,
    onClick,
    color = "#ffffff",
    isSecondaryBtn = false,
  }) => {
    const override = {
      // display: "block",
      // margin: "0 auto",
      borderColor: "#ffffff",
    };
    const id = useId();
    return (
      <button
        type={type}
        disabled={disabled}
        className={`flex items-center justify-center py-3 px-10 font-[600] tracking-wide   border  outline-none focus:outline-none disabled:cursor-not-allowed  ${
          isSecondaryBtn
            ? "text-accent border-transparent bg-white  hover:text-accent hover:border-accent"
            : "text-white bg-primary border-primary hover:bg-primary-dark"
        } ${className}`}
        // className={`flex items-center justify-center gap-5 bg-primary ${className}`}
        onClick={onClick}
      >
        {/* { loading ? */}
        <>
          <MoonLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={20}
            className={loaderclasses}
            // aria-label="Loading Spinner"
            data-testid={id}
          />

          <span>{children}</span>
        </>
        {/* : children
      } */}
      </button>
    );
  }
);
