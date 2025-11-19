import { PaginationBar } from "Components/PaginationBar";
import { SkeletonLoader } from "Components/Skeleton";
import { AuthContext } from "Context/Auth";
import { JsonParse, formatDate } from "Utils/utils";
import React from "react";
import { Link } from "react-router-dom";

const TableHeader = ({ isWithElectionDate, prevPetition }) => (
  <thead className="whitespace-nowrap bg-[rgb(230,230,230)] text-xs uppercase">
    <tr className="border-b border-b-[#0000001A]">
      <th scope="col" className="px-4 py-4">
        ID
      </th>
      <th scope="col" className="px-4 py-4">
        Race Name
      </th>
      {isWithElectionDate && (
        <th scope="col" className="px-4 py-4">
          Election Date
        </th>
      )}
      <th scope="col" className="px-4 py-4">
        Candidate Name
      </th>
      <th scope="col" className="px-4 py-4">
        Party
      </th>
      <th scope="col" className="px-4 py-4">
        Email
      </th>
      <th scope="col" className="px-4 py-4">
        Incumbent
      </th>
      <th scope="col" className="px-4 py-4">
        Area
      </th>
      {!prevPetition && (
        <>
          <th scope="col" className={`px-4 py-4 `}>
            Modification Request
          </th>

          <th scope="col" className={`px-4 py-4 `}>
            Ballot open
          </th>
        </>
      )}
      <th scope="col" className={`px-4 py-4 ${prevPetition && "hidden"}`}>
        Actions
      </th>
    </tr>
  </thead>
);
const TableRow = ({
  data,
  isWithElectionDate,
  isAddingPetition,
  prevPetition,
  petitionId,
  setDeletingPetition,
  setShowDeletingModal,
  setIsDeletingPrevPetition,
  setPetitionId,
  isModalOpen,
  setSingleSendBallot_info,
  setIsModalOpen,
}) => (
  <tr className="whitespace-nowrap border-b capitalize">
    <th
      scope="row"
      className="whitespace-nowrap px-4 py-3 font-medium text-gray-900"
    >
      <span className="capitalize">{data?.id}</span>
    </th>
    <td className="px-4 py-3">
      <span className="uppercase">{data?.race_name}</span>
    </td>
    {isWithElectionDate && (
      <td className="px-4 py-3">
        <span className="uppercase">{data?.election_date}</span>
      </td>
    )}
    <td className="px-4 py-3">{data?.candidate_name}</td>
    <td className="px-4 py-3">{data?.party_name || "---"}</td>
    <td className="px-4 py-3 normal-case">{data?.email}</td>
    <td className="px-4 py-3">{Number(data?.Incumbent) ? "Yes" : "No"}</td>
    <td className="px-4 py-3">
      <PrecinctsList precincts={data?.race_precincts} />
    </td>
    {!prevPetition ? (
      <>
        <td className={`px-4 py-3 `}>
          {data?.modification_id ? (
            <Link
              to={`/admin/edit-request/${data?.modification_id}`}
              className="border-b border-b-transparent font-semibold text-blue-500 hover:border-b-blue-500"
            >
              View Request
            </Link>
          ) : (
            "---"
          )}
        </td>
        <td className={`px-4 py-3 `}>
          {Number(data?.ballot_opened) === 1 ? "Yes" : "No"}
        </td>
      </>
    ) : null}

    <td className={`px-4 py-3 ${prevPetition && "hidden"}`}>
      <div className="flex h-full w-full  gap-2 whitespace-nowrap">
        <div className={``}>
          {!isAddingPetition ? (
            <button
              disabled={data?.id === petitionId}
              onClick={() => {
                setPetitionId(data?.id);
                setSingleSendBallot_info(data);
                setIsModalOpen(true);
              }}
              className={`border-b border-b-transparent font-semibold text-blue-500 hover:border-b-blue-500 disabled:cursor-not-allowed `}
            >
              {data?.id === petitionId && !isModalOpen
                ? "Sending..."
                : "Send Sample Ballot"}
            </button>
          ) : null}
        </div>

        {!isAddingPetition ? (
          <button
            onClick={() => {
              setDeletingPetition(data?.id);
              setShowDeletingModal(true);
              setIsDeletingPrevPetition(prevPetition);
            }}
            className="cursor-pointer px-1 text-xs font-medium text-red-500 hover:underline"
          >
            <span>Delete</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectFn(data)}
            disabled={petitionId == data?.id}
            className="border-b border-b-transparent font-semibold text-blue-500 hover:border-b-blue-500 disabled:cursor-not-allowed"
          >
            <span>Select</span>
          </button>
        )}
      </div>
    </td>
  </tr>
);

const PrecinctsList = ({ precincts }) => (
  <div className="flex max-w-[250px] flex-wrap">
    {precincts
      ? JsonParse(precincts)?.map((pre, i, arr) => (
          <span key={i}>
            {pre?.name}
            {i !== arr.length - 1 && ", "}
          </span>
        ))
      : "---"}
  </div>
);

const CandidateTable = ({
  className,
  currentTableData,
  loading,
  currentPage,
  pageCount,
  pageSize,
  canPreviousPage,
  canNextPage,
  setPageSize,
  getData,
  filterState,
  isWithElectionDate = false,
  prevPetition = false,
  isAddingPetition = false,
  petitionId,
  setDeletingPetition,
  setShowDeletingModal,
  setIsDeletingPrevPetition,
  setPetitionId,
  isModalOpen,
  setSingleSendBallot_info,
  setIsModalOpen,
}) => {
  const updatePageSize = async (limit) => {
    setPageSize(limit);
    await getData(1, limit, filterState);
  };

  const previousPage = async () => {
    await getData(
      currentPage - 1 > 1 ? currentPage - 1 : 1,
      pageSize,
      filterState
    );
  };

  const nextPage = async () => {
    await getData(
      currentPage + 1 <= pageCount ? currentPage + 1 : 1,
      pageSize,
      filterState
    );
  };

  if (loading) return <SkeletonLoader />;
  if (!currentTableData?.length)
    return (
      <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <span className="font-medium">No petitions found</span>
      </p>
    );

  return (
    <div className={`${className}`}>
      <div>
        <div className={`relative overflow-x-auto `}>
          <table className="w-full text-left text-sm">
            <TableHeader
              isWithElectionDate={isWithElectionDate}
              prevPetition={prevPetition}
            />
            <tbody>
              {currentTableData.map((data, i) => (
                <TableRow
                  key={`${data?.id}_${i}`}
                  data={data}
                  isWithElectionDate={isWithElectionDate}
                  isAddingPetition={isAddingPetition}
                  prevPetition={prevPetition}
                  petitionId={petitionId}
                  setDeletingPetition={setDeletingPetition}
                  setShowDeletingModal={setShowDeletingModal}
                  setIsDeletingPrevPetition={setIsDeletingPrevPetition}
                  setPetitionId={setPetitionId}
                  isModalOpen={isModalOpen}
                  setSingleSendBallot_info={setSingleSendBallot_info}
                  setIsModalOpen={setIsModalOpen}
                />
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={pageSize}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          updatePageSize={updatePageSize}
          previousPage={previousPage}
          nextPage={nextPage}
        />
      </div>
    </div>
  );
};

export default CandidateTable;
