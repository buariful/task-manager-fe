import { PaginationBar } from "Components/PaginationBar";
import { SkeletonLoader } from "Components/Skeleton";
import { AuthContext } from "Context/Auth";
import { JsonParse } from "Utils/utils";
import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const RacesTable = ({
  currentTableData,
  loading,
  setShowDeleteModal,
  setDltingRace,
  getData,
  pageCount,
  pageSize,
  setPageSize,
  currentPage,
  filterConditions,
  canPreviousPage,
  canNextPage,
  dltingPrevRace,
  setDltingPrevRace,
  isPrevRacesTable,
  role = "official",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = React.useContext(AuthContext);

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(1, limit, filterConditions);
    })();
  }

  function previousPage() {
    (async function () {
      await getData(
        currentPage - 1 > 1 ? currentPage - 1 : 1,
        pageSize,
        filterConditions
      );
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 1,
        pageSize,
        filterConditions
      );
    })();
  }

  let contents;
  if (currentTableData?.length > 0 && !loading) {
    contents = (
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="whitespace-nowrap bg-[#E6E6E6] text-xs uppercase">
            <tr className="border-b border-b-[#0000001A]">
              <th scope="col" className="px-3 py-4">
                ID
              </th>
              <th scope="col" className="px-3 py-4">
                Race Name
              </th>
              <th scope="col" className="px-3 py-4">
                Vote For Phrase
              </th>
              <th scope="col" className="px-3 py-4">
                Assigned Areas
                {/* {Number(state?.official_type) === 1 ? "Precincts" : "Counties"} */}
              </th>
              <th scope="col" className="px-3 py-4">
                Party Affiliation
              </th>
              <th scope="col" className="px-3 py-4">
                Candidates
              </th>
              <th scope="col" className="px-3 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTableData?.map((race) => (
              <tr className="border-b border-b-[#0000001A]   " key={race?.id}>
                <th
                  scope="row"
                  className="whitespace-nowrap px-3 py-3 font-medium text-gray-900"
                >
                  <span className="capitalize">{race?.id}</span>
                </th>
                <td className="px-3 py-3">
                  <span className="whitespace-nowrap capitalize">
                    {race?.name}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <span className="capitalize">{race?.vote_for_phrase}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-block min-w-[200px]">
                    {JsonParse(race?.precincts)?.map((pre, i) => (
                      <span className="capitalize" key={i}>
                        {i !== 0 && ", "} {pre?.name}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {JsonParse(race?.parties)?.map((par, i) => (
                    <span className="capitalize" key={i}>
                      {i !== 0 && ", "} {par?.name}
                    </span>
                  ))}
                </td>

                <td className="px-3 py-3">
                  <span className="inline-block min-w-[200px] capitalize">
                    {JsonParse(race?.candidates)?.map((candidate, i) => (
                      <span className="capitalize" key={i}>
                        {i !== 0 && ", "} {candidate?.name}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex h-full w-full items-center gap-2">
                    {race?.election_type == state?.official_type ||
                    role === "admin" ? (
                      <Link
                        // to={`/official/edit-races/${race?.id}`}
                        to={`/${role}/edit-races/${race?.id}${
                          searchParams.get("election_id")
                            ? "?election_id=" + searchParams.get("election_id")
                            : ""
                        }${
                          searchParams.get("template")
                            ? "&template=" + searchParams.get("template")
                            : ""
                        }`}
                        className={`cursor-pointer  text-xs font-medium text-[#292829fd] hover:underline ${
                          isPrevRacesTable ? "hidden" : ""
                        }`}
                      >
                        Edit
                      </Link>
                    ) : null}
                    <Link
                      to={`/${role}/view-races/${race?.id}`}
                      className="cursor-pointer text-xs font-medium  text-blue-500 hover:underline"
                    >
                      View
                    </Link>
                    {race?.election_type == state?.official_type ||
                    role === "admin" ? (
                      <span
                        className={`cursor-pointer text-xs font-medium text-red-500 hover:underline `}
                        onClick={() => {
                          setShowDeleteModal(true);
                          setDltingRace({
                            id: race?.id,
                            name: race?.name,
                            election_id: race?.election_id,
                          });
                          setDltingPrevRace(dltingPrevRace);
                        }}
                      >
                        Delete
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (currentTableData?.length === 0 && !loading) {
    contents = (
      <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <span className="font-medium">No races found</span>
      </p>
    );
  }
  return (
    <>
      {loading ? <SkeletonLoader /> : contents}
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
    </>
  );
};

export default RacesTable;
