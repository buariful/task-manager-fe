import React from "react";

export default function GradientTxt({ text, isHeading = true, classNames }) {
  return isHeading ? (
    <h2
      className={`inline-block bg-gradient-to-r from-[#893EC1] via-[#0BC0EB] to-[#7ED4AB] bg-clip-text text-transparent ${classNames} `}
    >
      {text}
    </h2>
  ) : (
    <p
      className={`inline-block bg-gradient-to-r from-[#893EC1] via-[#0BC0EB] to-[#7ED4AB] bg-clip-text text-transparent ${classNames}`}
    >
      {text}
    </p>
  );
}
