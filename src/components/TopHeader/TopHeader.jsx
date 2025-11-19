import React from "react";
import { GlobalContext } from "Context/Global";
import { AuthContext } from "Context/Auth";
const TopHeader = () => {
  const { state, dispatch } = React.useContext(GlobalContext);
  const { state: authState } = React.useContext(AuthContext);
  let { isOpen } = state;
  let toggleOpen = (open) =>
    dispatch({
      type: "OPEN_SIDEBAR",
      payload: { isOpen: open },
    });

  const getTitle = () => {
    try {
      if (!isOpen) {
        if (authState?.role?.toLowerCase() == "admin") {
          return "Admin";
        }
        if (
          authState?.role?.toLowerCase() == "official" &&
          authState?.official_type == 1
        ) {
          return "Election Preparation Database";
        }
        if (
          authState?.role?.toLowerCase() == "official" &&
          authState?.official_type == 2
        ) {
          return "State Election Database";
        }
        return authState?.role;
      } else {
        return "";
      }
    } catch (error) {
      console.log("getTitle->>", error);
    }
  };

  return (
    <div className="page-header shadow">
      {
        <p
          className={`px-2 text-[18px]  text-[#F3F2F1] md:px-3 lg:px-0 lg:pl-2 ${
            authState?.role?.toLowerCase() == "official"
              ? "font-semibold"
              : "font-bold"
          }`}
        >
          {getTitle()}
        </p>
      }
      <span onClick={() => toggleOpen(!isOpen)}>
        {!isOpen ? (
          <svg
            className="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            className="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </span>
    </div>
  );
};

export default TopHeader;
