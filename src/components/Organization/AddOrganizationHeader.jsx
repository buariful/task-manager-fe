import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

export default function AddOrganizationHeader({
  selectedTab,
  setSelectedTab,
  isLoading,
  handleSubmitFunction,
}) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <Link to="/super-admin/organization" className="text-accent">
            <FaArrowLeft />
          </Link>
          <h2 className="text-xl font-semibold text-accent">
            Create New Organization
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 border-b-2 border-[#1e1e1e] pb-1`}
            onClick={() => setSelectedTab(1)}
          >
            <span className="text-[#757575] font-thin text-sm">Step 1</span>
            <span className="text-[#1e1e1e] font-medium text-base">
              Organization Details
            </span>
          </button>
          <button
            className={`flex items-center gap-1 border-b-2 ${
              selectedTab === 2 ? "border-b-[#1e1e1e]" : "border-b-[#757575]"
            } pb-1`}
            onClick={() => setSelectedTab(2)}
          >
            <span className="text-[#757575] font-thin text-sm">Step 2</span>
            <span
              className={`${
                selectedTab === 2 ? "text-[#1e1e1e]" : "text-[#757575]"
              } font-medium text-base`}
            >
              Admin Details
            </span>
          </button>
        </div>

        <div className="flex gap-3">
          <InteractiveButton
            onClick={() => navigate("/super-admin/organization")}
            // className=" !bg-white !text-accent   !px-12 !border hover:!border-secondary !border-white"
            isSecondaryBtn={true}
          >
            Cancel
          </InteractiveButton>
          {selectedTab === 1 ? (
            <InteractiveButton
              onClick={() => setSelectedTab(2)}
              className="bg-primary hover:bg-accent text-white !px-12"
            >
              Next
            </InteractiveButton>
          ) : (
            <InteractiveButton
              loading={isLoading}
              onClick={handleSubmitFunction}
              className="bg-primary hover:bg-accent text-white !px-12"
            >
              Create
            </InteractiveButton>
          )}
        </div>
      </div>
    </div>
  );
}
