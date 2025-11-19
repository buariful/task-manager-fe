import { FullPageLoader } from "Components/FullPageLoader";
import moment from "moment";
import React from "react";

export default function OrganizationDetails({ data, isFetching }) {
  if (isFetching) {
    return <FullPageLoader />;
  }
  return (
    <div>
      {" "}
      {/* Card */}
      <div className="bg-white shadow rounded-lg p-8">
        {/* Title */}
        <div className="flex items-center gap-4  mb-6">
          <h2 className="text-2xl font-semibold">Swim for Life</h2>
          <span className="inline-block border border-neutral-gray px-3 py-1 rounded-full text-sm capitalize">
            {data?.status}
          </span>
        </div>

        {/* Official Address */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Official Address
          </h3>
          <div className="flex items-center gap-5 flex-col md:flex-row">
            <div className="grid flex-1 grid-cols-2 md:border-r md:border-r-neutral-gray md:grid-cols-3 gap-5 gap-y-4 text-gray-700 ">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{data?.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p>{data?.city}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">State/Province</p>
                <p>{data?.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p>{data?.country}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">ZIP/Postal Code</p>
                <p>{data?.zip}</p>
              </div>
            </div>

            <div className="grid md:pl-10  grid-cols-2 md:grid-cols-2 flex-1 gap-5 gap-y-4 text-gray-700">
              <div className="col-span-2">
                <p className="text-sm text-gray-500">No. of Licenses</p>
                <p>{data?.license?.no_of_license}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <p>{moment(data?.license?.joined_at).format("DD MMM YYYY")}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p>{moment(data?.license?.expire_at).format("DD MMM YYYY")}</p>
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
              {data?.logo ? (
                <img src={data?.logo} className="w-24 h-16" alt="" />
              ) : (
                <div className="w-24 h-16 bg-gray-200 rounded" />
              )}
            </div>
            {/* Login page image */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Login page Image</p>
              {data?.login_page_image ? (
                <img
                  src={data?.login_page_image}
                  className="w-24 h-16"
                  alt=""
                />
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
                  style={{ backgroundColor: data?.colors?.primary }}
                />
                <span>{data?.colors?.primary}</span>
              </div>
            </div>
            {/* Secondary colour */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Secondary Colour</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded "
                  style={{ backgroundColor: data?.colors?.secondary }}
                />
                <span>{data?.colors?.secondary}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
