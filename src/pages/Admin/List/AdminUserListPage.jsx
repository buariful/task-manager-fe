import React, { useState } from "react";
import { AuthContext, tokenExpireError } from "Context/Auth";
import MkdSDK from "Utils/MkdSDK";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext, showToast } from "Context/Global";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import {
  county_change,
  excelFileMake,
  getNonNullValue,
  handleSingleDropdownChange,
  state_county_change,
} from "Utils/utils";
import { PaginationBar } from "Components/PaginationBar";
import { AddButton } from "Components/AddButton";
import { SkeletonLoader } from "Components/Skeleton";
import { ModalPrompt } from "Components/Modal";
import { consoleWithEllipsis } from "Components/ChatBot";
import { DownloadButton } from "Components/DownloadButton";
import FilterBoxBg from "Components/FilterBoxBg/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { CustomButton } from "Components/CustomButton";
import { MultiSelect } from "react-multi-select-component";
import All_states from "../../../utils/states.json";
import All_counties from "../../../utils/counties.json";
import { SearchDropdown } from "Components/SearchDropdown";
import { ReportDownloadModal } from "Components/ReportDownloadModal";

let sdk = new MkdSDK();

const AdminUserListPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [data, setCurrentTableData] = React.useState([]);
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deletingUserID, setDeletingUserID] = React.useState(null);
  const [filter, setFilter] = React.useState({ where: {}, where2: {} });
  const [selected_states, setSelected_states] = React.useState([]);
  const [filtered_counties, setFiltered_counties] = React.useState([]);

  const [isDownLoading, setIsDownLoading] = React.useState(false);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);

  const [selected_county, setSelected_county] = React.useState([]);
  const [selectedStatus, setSelectedStatus] = React.useState([
    { label: "All", value: "" },
  ]);
  const [selectedRole, setSelectedRole] = React.useState([
    { label: "All", value: "" },
  ]);

  const statusOption = [
    { label: "All", value: "" },
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  const roleOptions = [
    { label: "All", value: "", realValue: "" },
    { label: "Election Official", value: 1 },
    { label: "State Official", value: 2 },
    { label: "Admin", value: 3 },
    { label: "Candidate", value: 4 },
  ];

  const navigate = useNavigate();

  const schema = yup.object({
    user_id: yup.string(),
    email: yup.string(),
    full_name: yup.string(),
    status: yup.string(),
    role: yup.string(),
    // state: yup.string(),
    country: yup.string(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function updatePageSize(limit) {
    (async function () {
      setPageSize(limit);
      await getData(1, limit, filter);
    })();
  }
  function previousPage() {
    (async function () {
      await getData(
        currentPage - 1 > 1 ? currentPage - 1 : 1,
        pageSize,
        filter
      );
    })();
  }

  function nextPage() {
    (async function () {
      await getData(
        currentPage + 1 <= pageCount ? currentPage + 1 : 1,
        pageSize,
        filter
      );
    })();
  }

  async function getData(
    pageNum,
    limitNum,
    filter = { where: {}, where2: {} }
  ) {
    setLoading(true);
    try {
      let payload = {
        ...filter,
        page: pageNum,
        limit: limitNum,
        orderBy: "id",
        direction: "DESC",
      };

      const result = await sdk.getAllUsersCustom(payload);

      if (!result.error) {
        setLoading(false);
        const { list, limit, num_pages, page } = result;
        const list_mod = list.map((l) => {
          if (l?.official_type == 2) {
            return { ...l, role: "State Official" };
          } else if (l?.official_type == 1) {
            return { ...l, role: "Election Official" };
          } else {
            return { ...l };
          }
        });

        setCurrentTableData(list_mod);
        setPageSize(Number(limit));
        setPageCount(Number(num_pages));
        setPage(Number(page));
        setCanPreviousPage(Number(page) > 1);
        setCanNextPage(Number(page) + 1 <= Number(num_pages));
      }
    } catch (error) {
      setLoading(false);
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  const handleSearch = (data) => {
    const id = getNonNullValue(data?.user_id);
    const email = getNonNullValue(data?.email);
    const first_name = getNonNullValue(data?.full_name?.split(" ")[0]);
    const last_name = getNonNullValue(
      data?.full_name?.split(" ")?.slice(1)?.join(" ")
    );
    const status = getNonNullValue(data?.status);
    let role = getNonNullValue(data?.role);
    const state = getNonNullValue(selected_states[0]?.label);
    const county = getNonNullValue(selected_county[0]?.label);
    let where = {};
    let where2 = {};

    role =
      data?.role == 1 || data?.role == 2
        ? "official"
        : data?.role == 3
        ? "admin"
        : data?.role == 4
        ? "candidate"
        : undefined;

    if (data?.role) {
      if (data?.role == 1) {
        where2["official_type"] = 1;
      } else if (data?.role == 2) {
        where2["official_type"] = 2;
      } else {
      }
    }

    const filterObj = {
      email,
      id,
      first_name,
      last_name,
      role,
      status,
      state,
      county,
    };

    Object.keys(filterObj).map((key) => {
      if (key === "county" || key === "state") {
        if (filterObj[key]) {
          where2[key] = filterObj[key];
        }
      } else {
        if (filterObj[key]) {
          where[key] = filterObj[key];
        }
      }
    });
    setFilter({ where, where2 });
    getData(1, pageSize, { where, where2 });
  };

  const exportTable = async (_, state, county) => {
    setIsDownLoading(true);
    // try {
    //   sdk.setTable("user");
    //   const result = await sdk.exportCSV();
    // } catch (err) {
    //   throw new Error(err);
    // }

    try {
      const where2 = { state };
      if (county) where2["county"] = county;

      const result = await sdk.getAllUsersCustom({
        where: {},
        where2,
        page: 1,
        limit: 99999999999,
        orderBy: "id",
        direction: "DESC",
      });
      let newDocdtype = [];
      result?.list?.map((item) => {
        const role =
          item?.official_type == 1
            ? "Election Official"
            : item?.official_type == 2
            ? "State Official"
            : item?.role;

        newDocdtype.push({
          Id: item?.id,
          Role: role,
          Status: `${item?.status == 1 ? "Active" : "Inactive"}`,
          Email: item?.email,
          "Full Name": item?.first_name + item?.last_name,
          State: item?.state,
          County: item?.county,
          "Register Voters": item?.registered_voters,
        });
      });
      if (result?.list?.length === newDocdtype.length) {
        excelFileMake(newDocdtype, "Users");
      }
    } catch (error) {
      console.log(error);
    }

    setIsDownLoading(false);
    setDownloadModalOpen(false);
  };

  const deleteItem = async () => {
    try {
      sdk.setTable("user");
      setDeleteLoading(true);
      const result = await sdk.callRestAPI({ id: deletingUserID }, "DELETE");
      if (!result?.error) {
        await sdk.deleteByFilter("profile", {
          user_id: deletingUserID,
        });
        showToast(globalDispatch, "User deleted successfully.");
        getData(currentPage, pageSize, filter);
      }
    } catch (err) {
      tokenExpireError(dispatch, err?.message);
      showToast(globalDispatch, "Deletion failed!");
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
    setDeletingUserID(null);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "users",
      },
    });

    (async function () {
      await getData(1, pageSize);
    })();
  }, []);

  /* ----- user table ---------- */
  let contents;
  if (data?.length > 0 && !loading) {
    contents = (
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="whitespace-nowrap bg-[#E6E6E6] text-xs uppercase">
            <tr className="border-b border-b-[#0000001A]">
              <th scope="col" className="px-6 py-4">
                ID
              </th>
              <th scope="col" className="px-6 py-4">
                Role
              </th>
              <th scope="col" className="px-6 py-4">
                Status
              </th>
              <th scope="col" className="px-6 py-4">
                Email
              </th>
              <th scope="col" className="px-6 py-4">
                Full Name
              </th>
              <th scope="col" className="px-6 py-4">
                State
              </th>
              <th scope="col" className="px-6 py-4">
                County
              </th>
              <th scope="col" className="px-6 py-4">
                Registered Voters
              </th>
              <th scope="col" className="px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((user) => (
              <tr
                className=" whitespace-nowrap border-b border-b-[#0000001A] text-xs"
                key={user?.id}
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-3 font-medium text-gray-900"
                >
                  <span className="capitalize">{user?.id}</span>
                </th>
                <td className="px-6 py-3">
                  <span className="capitalize">{user?.role}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="capitalize">
                    {user?.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3"> {user?.email}</td>
                <td className="px-6 py-3">
                  <span className="capitalize">
                    {user?.first_name} {user?.last_name}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="capitalize">{user?.state || "---"}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="capitalize">{user?.county || "---"}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="capitalize">
                    {user?.registered_voters || "---"}
                  </span>
                </td>

                <td className="flex gap-2 whitespace-nowrap px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/edit-user/${user?.id}`}
                      className="cursor-pointer  font-medium text-[#292829fd] hover:underline"
                    >
                      Edit
                    </Link>

                    <span
                      className="cursor-pointer font-medium text-red-500 hover:underline"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setDeletingUserID(user?.id);
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
  if (data?.length === 0 && !loading) {
    contents = (
      <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <span className="font-medium">No users found</span>
      </p>
    );
  }

  return (
    <div className="p-10">
      <FilterBoxBg className={"mb-10"}>
        <form action="" onSubmit={handleSubmit(handleSearch)}>
          <SectionTitle
            text={"Search Users"}
            className={"mb-5"}
            fontRoboto={true}
          />

          <div className="mb-5 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            <div className="">
              <label
                htmlFor="user_id"
                className="mb-2 block cursor-pointer text-sm font-[400]"
              >
                User Id
              </label>
              <input
                type={"number"}
                id={"user_id"}
                min={1}
                placeholder={"User Id"}
                {...register("user_id")}
                className={`focus:shadow-outline w-full appearance-none  border-none bg-[#F5F5F5] px-4 py-2.5 text-base leading-tight  focus:outline-none `}
              />
            </div>

            <div className="">
              <label
                htmlFor="email"
                className="mb-2 block cursor-pointer text-sm font-[400]"
              >
                Email
              </label>
              <input
                type={"text"}
                id={"email"}
                placeholder={"Email"}
                {...register("email")}
                className={`focus:shadow-outline w-full appearance-none  border-none bg-[#F5F5F5] px-4 py-2.5 text-base leading-tight  focus:outline-none `}
              />
            </div>

            <div className="">
              <label
                htmlFor="full_name"
                className="mb-2 block cursor-pointer text-sm font-[400]"
              >
                Full Name
              </label>
              <input
                type={"text"}
                id={"full_name"}
                placeholder={"Full Name"}
                {...register("full_name")}
                className={`focus:shadow-outline w-full appearance-none  border-none bg-[#F5F5F5] px-4 py-2.5 text-base leading-tight  focus:outline-none  `}
              />
            </div>

            <SearchDropdown
              options={statusOption}
              selected_states={selectedStatus}
              label={"Status"}
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
              options={roleOptions}
              selected_states={selectedRole}
              label={"Role"}
              lableFontLarge={false}
              className={` `}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={(value) => {
                handleSingleDropdownChange(
                  value,
                  setSelectedRole,
                  setValue,
                  "role"
                );
              }}
            />

            <SearchDropdown
              options={All_states}
              selected_states={selected_states}
              label={"State"}
              withClearIcon={true}
              stateChangeFn={(value) =>
                state_county_change(
                  value,
                  setSelected_states,
                  setFiltered_counties,
                  setSelected_county
                )
              }
            />
            <SearchDropdown
              options={filtered_counties}
              selected_states={selected_county}
              label={"County"}
              withClearIcon={true}
              disabled={filtered_counties?.length < 1}
              stateChangeFn={(value) =>
                county_change(value, setSelected_county)
              }
            />
          </div>
          <CustomButton
            callBackFn={async () => {
              reset();
              setSelected_states([]);
              setSelected_county([]);
              setSelectedStatus([statusOption[0]]);
              setSelectedRole([roleOptions[0]]);
              getData(1, pageSize);
              setFilter({ where: {}, where2: {} });
            }}
            isForFilter={true}
          />
        </form>
      </FilterBoxBg>

      <div className="">
        <div className="mb-3 flex w-full justify-between text-center  ">
          <h4 className="text-2xl font-medium">Users </h4>
          <div className="flex gap-2">
            <DownloadButton
              downloading={false}
              callBackFn={() => setDownloadModalOpen(true)}
            />
            <AddButton
              withIcon={false}
              text={"Add User"}
              link={"/admin/add-user"}
            />
          </div>
        </div>

        {loading ? <SkeletonLoader /> : contents}
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

      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={() => {
            deleteItem(deletingUserID);
          }}
          closeModalFunction={() => {
            setShowDeleteModal(false);
            setDeletingUserID(null);
          }}
          title={`Delete The User`}
          message={`You are about to delete the user, ${deletingUserID}. Note that, this action is irreversible`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}

      {isDownloadModalOpen ? (
        <ReportDownloadModal
          loading={isDownLoading}
          setModalOpen={setDownloadModalOpen}
          downloadFunction={exportTable}
          withElectionType={false}
        />
      ) : null}
    </div>
  );
};

export default AdminUserListPage;
