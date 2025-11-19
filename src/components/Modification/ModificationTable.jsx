import { SkeletonLoader } from "Components/Skeleton";
import React from "react";
import { Link } from "react-router-dom";

const TableHeader = ({}) => (
  <thead className="whitespace-nowrap bg-[rgb(230,230,230)] text-xs uppercase">
    <tr className="border-b border-b-[#0000001A]">
      <th scope="col" className="px-4 py-4">
        ID
      </th>
      <th scope="col" className="px-4 py-4">
        Candidate Name
      </th>
      <th scope="col" className="px-4 py-4">
        Race Name
      </th>
      <th scope="col" className="px-4 py-4">
        Status
      </th>

      <th scope="col" className={`px-4 py-4`}>
        Actions
      </th>
    </tr>
  </thead>
);
const TableRow = ({ data, tableRole }) => (
  <tr className="whitespace-nowrap border-b capitalize">
    <th
      scope="row"
      className="whitespace-nowrap px-4 py-3 font-normal text-gray-900"
    >
      {data?.modification_id}
    </th>
    <th
      scope="row"
      className="whitespace-nowrap px-4 py-3 font-normal text-gray-900"
    >
      {data?.candidate_name}
    </th>
    <th
      scope="row"
      className="whitespace-nowrap px-4 py-3 font-normal text-gray-900"
    >
      {data?.current_race_name}
    </th>

    <th
      scope="row"
      className="whitespace-nowrap px-4 py-3 font-medium text-gray-900"
    >
      {Number(data?.approval_status) === 1 ? (
        <span className="text-green-500">Approved</span>
      ) : Number(data?.approval_status) === 2 ? (
        <span className="text-red-500">Declined</span>
      ) : (
        <span className="text-orange-400">Pending</span>
      )}
    </th>

    <th
      scope="row"
      className="whitespace-nowrap px-4 py-3 font-normal text-gray-900"
    >
      {Number(data?.approval_status) === 0 ? (
        <Link to={`/${tableRole}/edit-request/${data?.modification_id}`}>
          Edit
        </Link>
      ) : null}
    </th>
  </tr>
);

export default function ModificationTable({ tableData, tableRole, loading }) {
  if (loading) {
    return <SkeletonLoader />;
  } else if (tableData?.length === 0) {
    return (
      <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <span className="font-medium">No data found</span>
      </p>
    );
  } else {
    return (
      <div className={`relative overflow-x-auto `}>
        <table className="w-full text-left text-sm">
          <TableHeader />
          <tbody>
            {tableData?.map((data, i) => (
              <TableRow
                key={`${data?.id}_${i}`}
                data={data}
                tableRole={tableRole}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
