import { FullPageLoader } from "Components/FullPageLoader";
import { InteractiveButton } from "Components/InteractiveButton";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "Src/supabase";
import { JsonParseObj } from "Utils/utils";

export default function AdministratorOrgDetailPage() {
  const [org, setOrg] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { id } = useParams();

  const navigate = useNavigate();
  const authState = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { organization_id } = authState?.state;

  const fetchOrg = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("organization")
        .select("*, license: license(*)")
        .eq("id", organization_id) // 👈 change to the specific org ID you want to fetch
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
    fetchOrg();
  }, []);

  if (isFetching) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1">
          <Link to="/administrator/dashboard">
            <FaArrowLeft />
          </Link>
          <h2>Dashboard</h2>
        </div>

        <div>
          <InteractiveButton
            onClick={() => navigate("/administrator/org-detail/edit")}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Edit Details
          </InteractiveButton>
        </div>
      </div>
      {/* Card */}
      <div className="bg-white shadow rounded-lg p-8">
        {/* Title */}
        <h2 className="text-2xl font-semibold mb-6">Swim for Life</h2>

        {/* Official Address */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Official Address
          </h3>
          <div className="flex items-center gap-5 flex-col md:flex-row">
            <div className="grid flex-1 grid-cols-2 md:border-r md:border-r-neutral-gray md:grid-cols-3 gap-5 gap-y-4 text-gray-700 ">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{org?.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p>{org?.city}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">State/Province</p>
                <p>{org?.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p>{org?.country}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">ZIP/Postal Code</p>
                <p>{org?.zip}</p>
              </div>
            </div>

            <div className="grid md:pl-10  grid-cols-2 md:grid-cols-2 flex-1 gap-y-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <p>{moment(org?.license?.joined_at).format("DD MMM YYYY")}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p>{moment(org?.license?.expire_at).format("DD MMM YYYY")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="border-t border-t-neutral-border-r-neutral-gray pt-9">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Branding</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Logo */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Logo</p>
              {org?.logo ? (
                <img src={org?.logo} className="w-24 h-16" alt="" />
              ) : (
                <div className="w-24 h-16 bg-gray-200 rounded" />
              )}
            </div>
            {/* Login page image */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Login page Image</p>
              {org?.login_page_image ? (
                <img src={org?.login_page_image} className="w-24 h-16" alt="" />
              ) : (
                <div className="w-24 h-16 bg-gray-200 rounded" />
              )}
            </div>
            {/* Primary colour */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Primary Colour</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded "
                  style={{ backgroundColor: org?.colors?.primary }}
                />
                <span>{org?.colors?.primary}</span>
              </div>
            </div>
            {/* Secondary colour */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Secondary Colour</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded "
                  style={{ backgroundColor: org?.colors?.secondary }}
                />
                <span>{org?.colors?.secondary}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
