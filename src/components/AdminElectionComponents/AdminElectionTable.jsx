import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "Utils/utils";

export default function AdminElectionTable({
  currentTableData,
  loading,
  setShowDltElectionModal,
  setDltingElection,
}) {
  if (currentTableData?.length > 0 && !loading) {
    return (
      <div className="relative overflow-x-auto shadow">
        <table
          className="w-full text-left text-sm"
          style={{ fontFamily: "Roboto, sans-serif" }}
        >
          <thead className="bg-[#E6E6E6] text-xs uppercase  ">
            <tr className="border-b border-b-[#0000001A] font-[600] uppercase">
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Election Date
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Races
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Composite Ballot Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Is Template
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-4 text-left  tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTableData?.map((elec) => (
              <tr
                className="border-b border-b-[#0000001A] text-xs "
                key={elec?.id}
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 font-medium text-gray-900"
                >
                  <span className="capitalize">{elec?.id}</span>
                </th>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="capitalize">{elec?.name}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {" "}
                  <span className="capitalize">
                    {formatDate(elec?.election_date)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="">
                    {elec?.races_id ? (
                      <Link
                        to={`/admin/race?election_id=${elec?.id}`}
                        className="cursor-pointer  text-xs font-medium text-blue-500 hover:underline"
                      >
                        View Races
                      </Link>
                    ) : (
                      <Link
                        to={`/admin/race?election_id=${elec?.id}`}
                        className="cursor-pointer  text-xs font-medium text-blue-500 hover:underline"
                      >
                        Create Race
                      </Link>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="">
                    {elec?.composite_ballot_status ? "Done" : "Pending"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="">{elec?.is_template ? "Yes" : "No"}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="">{elec?.status ? "Active" : "Inactive"}</div>
                </td>
                <td className="flex gap-2 whitespace-nowrap px-4 py-3">
                  <Link
                    to={`/admin/edit-election/${elec?.id}`}
                    className="cursor-pointer  text-xs font-medium text-[#292829fd] hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/admin/view-election/${elec?.id}`}
                    className="cursor-pointer text-xs font-medium  text-blue-500 hover:underline"
                  >
                    View
                  </Link>
                  <span
                    className="cursor-pointer text-xs font-medium text-red-500 hover:underline"
                    onClick={() => {
                      setShowDltElectionModal(true);
                      setDltingElection({
                        id: elec?.id,
                        name: elec?.name,
                      });
                    }}
                  >
                    Delete
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (currentTableData?.length === 0 && !loading) {
    return (
      <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <span className="font-medium">No elections found</span>
      </p>
    );
  }
}
