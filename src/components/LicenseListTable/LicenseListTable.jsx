import { Spinner } from "Assets/svgs";
import moment from "moment";
import React from "react";
import { colors } from "Utils/config";

export default function LicenseListTable({ data, isLoading }) {
  return (
    <div>
      {isLoading ? (
        <div
          className={`flex max-h-fit min-h-fit min-w-fit max-w-full items-center justify-center  py-5`}
        >
          <Spinner size={50} color={colors.primary} />
        </div>
      ) : data?.length < 1 ? (
        <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <span className="font-medium">No license found</span>
        </p>
      ) : (
        <div
          className={`${
            isLoading ? "" : "overflow-x-auto"
          } border-b border-[#0000001A] shadow`}
        >
          <table
            style={{ fontFamily: "Roboto, sans-serif" }}
            className="min-w-full bg-white  divide-y text-accent divide-[#0000001A] "
          >
            <thead className=" bg-light-info text-sm font-medium">
              <tr className="">
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                >
                  <span className="text-accent">Organization Name </span>
                </th>
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                >
                  <span className="text-accent">Organization Address </span>
                </th>
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                >
                  <span className="text-accent">No of License </span>
                </th>
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                >
                  <span className="text-accent">Joined Date </span>
                </th>
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                >
                  <span className="text-accent">Expiry Date </span>
                </th>
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                >
                  <span className="text-accent">Status </span>
                </th>
                <th
                  scope="col"
                  className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider`}
                ></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#0000001A] ">
              {data?.map((item, i) => (
                <tr className="text-sm capitalize">
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    {item?.organization_name}
                  </td>
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    {item?.organization_address}
                  </td>
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    {item?.no_of_license}
                  </td>
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    {moment(item?.joined_at)?.format("MMM DD, YYYY")}
                  </td>
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    {moment(item?.expire_at)?.format("MMM DD, YYYY")}
                  </td>
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    {item?.expire_at > new Date() ? "Active" : "Expired"}
                  </td>
                  <td key={i} className="whitespace-nowrap px-6 py-3">
                    <span className="border p-1 rounded-full border-neutral-gray px-3">
                      {item?.days_left} days left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}{" "}
    </div>
  );
}
