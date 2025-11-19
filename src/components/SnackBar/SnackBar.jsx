import React from "react";
import { GlobalContext } from "Context/Global";
const SnackBar = () => {
  const {
    state: { globalMessage, toastStatus },
    dispatch,
  } = React.useContext(GlobalContext);
  const show = globalMessage.length > 0;

  return show ? (
    <div
      id="mkd-toast"
      className={`fixed right-5 top-5 z-[10000000001] flex w-full max-w-xs items-center rounded-md  p-4  shadow-md text-accent border-t-2  ${
        toastStatus === "success"
          ? // ? "bg-gradient-to-bl from-green-600 to-green-800"
            "bg-[#eef1f4] border-t-primary"
          : toastStatus === "error"
          ? "bg-red-100 border-t-red-500"
          : "border-t-yellow-600 bg-yellow-100"
      }`}
      role="alert"
    >
      {/* <div className="text-[1.2rem] font-normal text-accent"> */}
      <div className="text-base font-normal text-accent">{globalMessage}</div>
      <div className="ml-auto flex items-center space-x-2">
        <button
          type="button"
          className="inline-flex h-8 w-8 rounded-lg  p-1.5 text-gray-400  hover:text-gray-900 focus:ring-2 focus:ring-gray-300 "
          aria-label="Close"
          onClick={() => {
            dispatch({ type: "SNACKBAR", payload: { message: "" } });
          }}
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  ) : null;
};

export default SnackBar;
