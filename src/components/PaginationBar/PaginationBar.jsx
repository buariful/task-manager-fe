import React from "react";
import { HiArrowNarrowLeft, HiArrowNarrowRight } from "react-icons/hi";
const PaginationBar = ({
  currentPage,
  pageCount,
  pageSize,
  canPreviousPage,
  canNextPage,
  updatePageSize,
  previousPage,
  nextPage,
}) => {
  return (
    <>
      {
        pageCount
        ?<div className="mt-3 flex justify-between ">
        <div className="">
         
          <span>
            Page{" "}
            <strong>
              {pageCount == 0 ? 0 : currentPage} of {pageCount}
            </strong>{" "}
          </span>
          <select
            className=""
            value={pageSize}
            onChange={(e) => {
              updatePageSize(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        {/*  */}
        <div className="flex items-center gap-3">
          <button
            onClick={previousPage}
            disabled={!canPreviousPage}
            className={`font-bold disabled:cursor-not-allowed disabled:text-gray-400`}
          >
            {/* &#x02190; */}
            <HiArrowNarrowLeft className="text-xl" />
          </button>{" "}
          <button
            onClick={nextPage}
            disabled={!canNextPage}
            className={`font-bold disabled:cursor-not-allowed disabled:text-gray-400`}
          >
            {/* &#x02192; */}
            <HiArrowNarrowRight className="text-xl" />
          </button>{" "}
        </div>
      </div>
      :null
      }
    </>
  );
};

export default PaginationBar;
