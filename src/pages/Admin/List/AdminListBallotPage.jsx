import React, { useState } from "react";
import MkdSDK from "Utils/MkdSDK";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { getNonNullValue, handleSingleDropdownChange } from "Utils/utils";
import { PaginationBar } from "Components/PaginationBar";
import { AddButton } from "Components/AddButton";
import { MkdListTable } from "Components/MkdListTable";
import { ExportButton } from "Components/ExportButton";
import { MkdInput } from "Components/MkdInput";
import { SkeletonLoader } from "Components/Skeleton";
import { BiFilterAlt, BiSearch } from "react-icons/bi";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin5Line } from "react-icons/ri";
import parse from "html-react-parser";
import TreeSDK from "Utils/TreeSDK";
import { ModalPrompt } from "Components/Modal";
import { MultiSelect } from "react-multi-select-component";
import "./adminListBallotPage.css";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { CustomButton } from "Components/CustomButton";
import { SearchDropdown } from "Components/SearchDropdown";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";
import { StateCountySelect } from "Components/StateCountySelect";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminListBallotPage = () => {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [dataTotal, setDataTotal] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [dltingballot, setDltingballot] = React.useState(null);
  const [ballotElectionId, setBallotElectionId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [openFilter, setOpenFilter] = React.useState(false);
  const [showFilterOptions, setShowFilterOptions] = React.useState(false);
  const [filterConditions, setFilterConditions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedPublishOpt, setSelectedPublishOpt] = useState([]);

  const [selected_states, setSelected_states] = useState([]);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);

  const electionType = 1;

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Generated", value: "Generated" },
    { label: "Not Generated", value: "Not Generated" },
  ];
  const publishOptions = [
    { label: "All", value: "" },
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];

  const schema = yup.object({
    county_name: yup.string(),
    status: yup.string(),
    isPublished: yup.string(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

  const deleteItem = async (id, electionId) => {
    if (!id || !electionId) return;
    try {
      setDeleteLoading(true);
      sdk.setTable("ballots_layout");
      const result = await sdk.callRestAPI({ id }, "DELETE");
      await tdk.update("elections", electionId, {
        composite_ballot_status: 0,
      });
      if (!result?.error) {
        showToast(globalDispatch, "Ballot deleted successfully.");
        getData(currentPage, pageSize, filterConditions);
      }
    } catch (err) {
      showToast(globalDispatch, err?.message);
      tokenExpireError(dispatch, err?.message);
      throw new Error(err);
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
    setDltingballot(null);
    setBallotElectionId(null);
  };

  const handleSearch = async (data) => {
    let filterData = [];
    if (data?.status) {
      filterData.push(`com_ballot_status,sw,${data?.status}`);
    }
    if (data?.isPublished) {
      filterData.push(`published,eq,${Number(data?.isPublished)}`);
    }

    if (selected_states?.length) {
      filterData.push(
        `staci_j_ballots_layout.state,eq,'${selected_states[0]?.value}'`
      );
    }
    if (selected_county?.length) {
      filterData.push(
        `staci_j_ballots_layout.county_name,eq,'${selected_county[0]?.value}'`
      );
    }

    getData(1, pageSize, filterData);
    setFilterConditions(filterData);
  };

  async function getData(pageNum, limitNum, filter = []) {
    setLoading(true);
    let tdk = new TreeSDK();
    try {
      const result = await tdk.getPaginate("ballots_layout", {
        page: pageNum,
        size: limitNum,
        join: "elections",
        order: "id",
        direction: "DESC",
        filter,
      });

      const { list, total, limit, num_pages, page } = result;

      setCurrentTableData(list);
      setPageSize(limit);
      setPageCount(num_pages);
      setPage(page);
      setDataTotal(total);
      setCanPreviousPage(page > 1);
      setCanNextPage(page + 1 <= num_pages);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  }

  function removeHtmlTags(input) {
    return input.replace(/<[^>]*>/g, "");
  }

  const handleClearFilter = async () => {
    try {
      reset();
      setSelectedStatus([statusOptions[0]]);
      setSelectedPublishOpt([publishOptions[0]]);
      setFilterConditions([]);
      getData(1, pageSize);

      setSelected_states([]);
      setSelected_county([]);
    } catch (error) {
      console.log("handleClearFilter->", error);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "ballot",
      },
    });

    (function () {
      setValue("status", statusOptions[0]?.value);
      setValue("isPublished", publishOptions[0]?.value);
      setSelectedStatus([statusOptions[0]]);
      setSelectedPublishOpt([publishOptions[0]]);
      getData(1, pageSize);
    })();
  }, []);

  /* --------- ballot table --------- */
  let contents;
  if (currentTableData?.length > 0 && !loading) {
    contents = (
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#E6E6E6] text-xs uppercase ">
            <tr className="whitespace-nowrap border-b border-b-[#0000001A]">
              <th scope="col" className="px-4 py-4">
                ID
              </th>
              <th scope="col" className="px-4 py-4">
                Election
              </th>
              <th scope="col" className="px-4 py-4">
                Header Description
              </th>
              <th scope="col" className="px-4 py-4">
                PDF File
              </th>
              <th scope="col" className="px-4 py-4">
                {/* Composite Ballot Status */}
                Composite Ballot
              </th>
              <th scope="col" className="px-4 py-4">
                Published
              </th>
              <th scope="col" className="px-4 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTableData?.map((ballot) => (
              <tr
                className="border-b border-b-[#0000001A] text-xs"
                key={ballot?.id}
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-4 py-3 font-medium text-gray-900"
                >
                  <span className="capitalize">{ballot?.id}</span>
                </th>
                <td className="px-4 py-3">
                  <span className="capitalize">{ballot?.elections?.name}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="w-[250px] break-words capitalize">
                    {/* {parse(ballot?.description)} */}
                    {removeHtmlTags(ballot?.description)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {" "}
                  <p className="w-[200px] break-words">
                    {ballot?.pdf_file ? (
                      <a
                        className="border-b border-b-transparent text-blue-500 hover:border-b-blue-500"
                        // href={ballot?.pdf_file}
                        href={`${
                          import.meta.env.VITE_SITE_URL
                        }/view-pdf?secret=${btoa(ballot?.pdf_file)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {/* {ballot?.pdf_file} */}
                        Download PDF File
                      </a>
                    ) : (
                      "---"
                    )}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {/* {ballot?.com_ballot_status} */}
                  <p className="w-[200px] break-words">
                    <span className="capitalize">
                      {ballot?.com_ballot_pdf ? (
                        <a
                          className="border-b border-b-transparent text-blue-500 hover:border-b-blue-500"
                          // href={ballot?.com_ballot_pdf}
                          href={`${
                            import.meta.env.VITE_SITE_URL
                          }/view-pdf?secret=${btoa(ballot?.com_ballot_pdf)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {/* {ballot?.com_ballot_pdf} */}
                          View Composite Ballot
                        </a>
                      ) : (
                        "---"
                      )}
                    </span>
                  </p>
                </td>
                <td className="px-4 py-3">
                  {Number(ballot?.published) === 1 ? "Yes" : "No"}
                </td>

                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex flex-col  gap-1 ">
                    <Link
                      to={`/admin/edit-ballot/${ballot?.id}`}
                      className="cursor-pointer font-medium text-[#292829fd] hover:underline"
                    >
                      Edit Description
                    </Link>
                    <Link
                      to={`/admin/view-ballots_layout/${ballot?.id}`}
                      className="cursor-pointe font-medium  text-blue-500 hover:underline"
                    >
                      {ballot?.com_ballot_status?.toLowerCase() === "generated"
                        ? "View Composite Ballot"
                        : "Generate Composite Ballot"}
                    </Link>
                    <span
                      className="cursor-pointe cursor-pointer font-medium text-red-500 hover:underline"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setDltingballot(ballot?.id);
                        setBallotElectionId(ballot?.election_id);
                      }}
                    >
                      Delete
                    </span>
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
        <span className="font-medium">No ballots found</span>
      </p>
    );
  }

  return (
    <div className="p-5 sm:p-10">
      <FilterBoxBg className={"mb-10"}>
        <form action="" onSubmit={handleSubmit(handleSearch)}>
          <SectionTitle
            text={"Search Ballot Layout"}
            className={"mb-5"}
            fontRoboto={true}
          />

          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            <StateCountySelect
              selected_county={selected_county}
              selected_states={selected_states}
              setSelected_county={setSelected_county}
              setSelected_states={setSelected_states}
              stateErrorMessage={""}
              setStateErrorMessage={() => {}}
              countyErrorMessage={""}
              setCountyErrorMessage={() => {}}
              filtered_counties={filtered_counties}
              setFiltered_counties={setFiltered_counties}
              electionType={electionType}
            />
            <SearchDropdown
              options={statusOptions}
              selected_states={selectedStatus}
              label={"Ballot Status"}
              lableFontLarge={false}
              className={` `}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={(value) => {
                handleSingleDropdownChange(
                  value,
                  setSelectedStatus,
                  setValue,
                  "status"
                );
              }}
            />

            <SearchDropdown
              options={publishOptions}
              selected_states={selectedPublishOpt}
              label={"Ballot Published"}
              lableFontLarge={false}
              className={` `}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={(value) => {
                handleSingleDropdownChange(
                  value,
                  setSelectedPublishOpt,
                  setValue,
                  "isPublished"
                );
              }}
            />
          </div>

          <CustomButton callBackFn={handleClearFilter} isForFilter={true} />
        </form>
      </FilterBoxBg>

      <div className="mb-5 flex w-full justify-between text-center  ">
        <SectionTitle text={"Ballots Layout"} />
        <div className="flex">
          <AddButton
            text={"Upload Ballot PDF"}
            withIcon={false}
            link={"/admin/add-ballot"}
          />
        </div>
      </div>
      {!loading ? (
        <>
          {contents}
          <PaginationBar
            currentPage={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage}
            updatePageSize={updatePageSize}
            previousPage={previousPage}
            nextPage={nextPage}
          />{" "}
        </>
      ) : (
        <SkeletonLoader />
      )}

      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={() => {
            deleteItem(dltingballot, ballotElectionId);
          }}
          closeModalFunction={() => {
            setShowDeleteModal(false);
            setDltingballot(null);
            setBallotElectionId(null);
          }}
          title={`Delete The Ballot`}
          message={`You are about to delete the ballot, ${dltingballot}. Note that, this action is irreversible`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}
    </div>
  );
};

export default AdminListBallotPage;
