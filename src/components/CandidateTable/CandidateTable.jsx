import { PaginationBar } from "Components/PaginationBar";
import { SkeletonLoader } from "Components/Skeleton";
import { AuthContext } from "Context/Auth";
import { JsonParse, formatDate } from "Utils/utils";
import React from "react";
import { Link } from "react-router-dom";

const CandidateTable = ({
  className,
  // -------- table props -------
  currentTableData,
  loading,
  setDltingPetition,
  setShowDltingModal,
  petitionId,
  setPetitionId,
  setSingleSendBallot_info,
  isModalOpen,
  setIsModalOpen,
  prevPetition = false,
  setIsDltingPrevPetition,
  isWithElectionDate = false,
  // -------- pagination props -------
  currentPage,
  pageCount,
  pageSize,
  canPreviousPage,
  canNextPage,

  setPageSize,
  getData,
  filterState,
  // ----
  isAddingPetiton = false,
  onSelectFn,
}) => {
  const { state } = React.useContext(AuthContext);

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(1, limit, filterState);
    })();
  }

  function previousPage() {
    (async function () {
      await getData(
        currentPage - 1 > 1 ? currentPage - 1 : 1,
        pageSize,
        filterState
      );
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 1,
        pageSize,
        filterState
      );
    })();
  }

  let contents;
  if (currentTableData?.length > 0 && !loading) {
    contents = (
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="whitespace-nowrap bg-[rgb(230,230,230)] text-xs uppercase ">
            <tr className="border-b border-b-[#0000001A]">
              <th scope="col" className="px-4 py-4">
                ID
              </th>
              <th scope="col" className="px-4 py-4">
                Race Name
              </th>
              {isWithElectionDate ? (
                <th scope="col" className="px-4 py-4">
                  Election Date
                </th>
              ) : null}
              {/* <th scope="col" className="px-4 py-4">
                Election Date
              </th> */}
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
                {/* {Number(state?.official_type) === 1 ? "Precincts" : "Counties"} */}
                Area
              </th>
              {state?.official_type == 1 ||
              state?.role?.toLowerCase() === "admin" ? (
                <>
                  <th
                    scope="col"
                    className={`px-4 py-4 ${
                      (prevPetition || isAddingPetiton) && "hidden"
                    }`}
                  >
                    Modification Request
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-4 ${
                      (prevPetition || isAddingPetiton) && "hidden"
                    }`}
                  >
                    Ballot open
                  </th>
                  <th
                    scope="col"
                    className={`px-4 py-4 ${prevPetition && "hidden"}`}
                  >
                    Actions
                  </th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {currentTableData?.map((data, i) => (
              <tr
                key={`${data?.id}_${i}`}
                className="whitespace-nowrap  border-b capitalize  "
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 font-medium text-gray-900"
                >
                  <span className="capitalize">{data?.id}</span>
                </th>
                <td className="px-4 py-3">
                  <span className="uppercase">
                    {/* {JsonParse(data?.races)?.map((race, i) => (
                        <span className="capitalize" key={i}>
                          {i !== 0 && ", "} {race?.name}
                        </span>
                      ))} */}
                    {data?.race_name}
                  </span>
                </td>
                {isWithElectionDate ? (
                  <td className="px-4 py-3">
                    <span className="uppercase">
                      {/* {JsonParse(data?.races)?.map((race, i) => (
                        <span className="capitalize" key={i}>
                          {i !== 0 && ", "} {race?.name}
                        </span>
                      ))} */}
                      {data?.election_date}
                    </span>
                  </td>
                ) : null}
                {/* <td className="px-4 py-3">
                  {" "}
                  <span className="capitalize">
                    {formatDate(data?.election_date)}
                  </span>
                </td> */}
                <td className="px-4 py-3">{data?.candidate_name}</td>
                <td className="px-4 py-3">
                  {data?.party_name ? data?.party_name : "---"}
                </td>
                <td className="px-4 py-3 normal-case">{data?.email}</td>
                <td className="px-4 py-3">
                  {Number(data?.Incumbent) ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[250px] flex-wrap">
                    {data?.race_precincts
                      ? JsonParse(data?.race_precincts)?.map((pre, i) => (
                          <span key={i}>
                            {pre?.name}
                            {i !==
                              JsonParse(data?.race_precincts)?.length - 1 &&
                              ", "}
                          </span>
                        ))
                      : "---"}
                  </div>
                </td>
                {state?.official_type == 1 ? (
                  <>
                    <td
                      className={`px-4 py-3 ${
                        (prevPetition || isAddingPetiton) && "hidden"
                      }`}
                    >
                      {data?.modification_id &&
                      data?.countyInCharge?.toLowerCase() ==
                        state?.county?.toLowerCase() ? (
                        <Link
                          to={`/official/edit-request/${data?.modification_id}`}
                          className="border-b border-b-transparent font-semibold text-blue-500 hover:border-b-blue-500"
                        >
                          View Request
                        </Link>
                      ) : (
                        "---"
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        (prevPetition || isAddingPetiton) && "hidden"
                      }`}
                    >
                      {Number(data?.ballot_opened) === 1 ? "Yes" : "No"}
                    </td>
                    <td className={`px-4 py-3 ${prevPetition && "hidden"}`}>
                      <div className="flex h-full w-full  gap-2 whitespace-nowrap">
                        <div className={``}>
                          {!isAddingPetiton &&
                          data?.countyInCharge?.toLowerCase() ==
                            state?.county?.toLowerCase() ? (
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

                        {!isAddingPetiton ? (
                          <button
                            onClick={() => {
                              setDltingPetition(data?.id);
                              setShowDltingModal(true);
                              setIsDltingPrevPetition(prevPetition);
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
                  </>
                ) : null}

                {state?.role?.toLowerCase() === "admin" ? (
                  <td className={`px-4 py-3 ${prevPetition && "hidden"}`}>
                    <button
                      onClick={() => onSelectFn(data)}
                      disabled={petitionId == data?.id}
                      className="border-b border-b-transparent font-semibold text-blue-500 hover:border-b-blue-500 disabled:cursor-not-allowed"
                    >
                      <span>Select</span>
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (currentTableData?.length === 0 && !loading && !isAddingPetiton) {
    contents = (
      <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800">
        No petitions found!
      </p>
    );
  }

  return loading ? (
    <SkeletonLoader />
  ) : (
    <div className={className ?? ""}>
      {contents}
      {!isAddingPetiton ? (
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
      ) : null}
    </div>
  );
};

export default CandidateTable;
