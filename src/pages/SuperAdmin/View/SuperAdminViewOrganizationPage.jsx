import { FullPageLoader } from "Components/FullPageLoader";
import { InteractiveButton } from "Components/InteractiveButton";
import LicenseEditModal from "Components/LicenseEditModal/LicenseEditModal";
import {
  OrganizationAdmin,
  OrganizationDetails,
} from "Components/Organization";
import { PageWrapper } from "Components/PageWrapper";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "Src/supabase";
import { JsonParseObj } from "Utils/utils";

export default function SuperAdminViewOrganizationPage() {
  const [org, setOrg] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState(1);
  const [licenseDrawerOpen, setLicenseDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const authState = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const fetchOrg = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("organization")
        .select("*, license: license(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching org:", error);
      } else {
        const orgDetails = { ...data, colors: JsonParseObj(data?.colors) };
        setOrg(orgDetails);
      }
    } catch (error) {
      console.log("failed to fetch", error?.message);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    if (selectedTab === 1) {
      fetchOrg();
    }
  }, [selectedTab]);

  const tabs = [
    { label: "Organization Details", value: 1 },
    { label: "Admin Details", value: 2 },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/super-admin/organization">
            <FaArrowLeft />
          </Link>

          <div className="flex items-center">
            {tabs?.map((tab) => (
              <InteractiveButton
                key={tab.value}
                className={`!text-base font-normal !px-10 !border-0 ${
                  selectedTab === tab.value
                    ? "!bg-[#D9D9D9] !text-accent"
                    : "!bg-[#F5F5F5] !text-[#B3B3B3]"
                }`}
                onClick={() => setSelectedTab(tab.value)}
              >
                {tab.label}
              </InteractiveButton>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <InteractiveButton
            onClick={() => setLicenseDrawerOpen(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Edit License
          </InteractiveButton>
          <InteractiveButton
            onClick={() =>
              navigate(
                selectedTab === 1
                  ? `/super-admin/edit-organization-details/${org?.id}`
                  : `/super-admin/add-organization-admin/${org?.id}`
              )
            }
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            {selectedTab === 1 ? "Edit Details" : "Add Admin"}
          </InteractiveButton>
        </div>
      </div>

      {selectedTab === 1 ? (
        <OrganizationDetails data={org} isFetching={isFetching} />
      ) : (
        <OrganizationAdmin />
      )}

      <LicenseEditModal
        open={licenseDrawerOpen}
        setOpen={setLicenseDrawerOpen}
        organizationId={id}
        // filterTabs={filterTabs}
        // onApplyFilters={handleFilter}
        // onClearFilters={handleClearFilters}
      />
    </PageWrapper>
  );
}
