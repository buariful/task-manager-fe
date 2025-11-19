import React from "react";
import { UserNavBar } from "Components/NavBar";
import { SearchInput } from "Components/SearchInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { IoFilterCircle } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { MkdListTable } from "Components/MkdListTable";
import { PaginationBar } from "Components/PaginationBar";
import { GlobalContext, showToast } from "Context/Global";
import { useNavigate } from "react-router";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { LevelFilterDrawer } from "Components/Level";
import moment from "moment";
import { Pagination } from "Components/Pagination";
import { PageWrapper } from "Components/PageWrapper";
import { fetchSinglePermission } from "Utils/utils";
import { usePermissionFetcher } from "Src/hooks/useSinglePermissionFetch";
import { Spinner } from "Assets/svgs";
import { PermissionWarning } from "Components/PermissionWarning";

const columns = [
  {
    header: "Level ID",
    accessor: "id",
    sortingKey: "id",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "Level Name",
    accessor: "name",
    sortingKey: "name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Description",
    accessor: "description",
    sortingKey: "description",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status_modified",
    // sortingKey: "status",
    // isSorted: true,
    // isSortedDesc: false,

    showDot: true,
  },

  {
    header: "Last Modified",
    accessor: "updated_at_modified",
    sortingKey: "updated_at",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Action",
    accessor: "",
    sortingKey: "",
  },
];

const defaultFilters = {
  name: "",
  levelIds: [],
  statuses: [],
  updatedAfter: "",
  updatedBefore: "",
  sortBy: "id",
  isOrderDesc: true,
};

const UserListLevelPage = () => {
  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);
  const [canPreviousPage, setCanPreviousPage] = React.useState(false);
  const [canNextPage, setCanNextPage] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [filters, setFilters] = React.useState(defaultFilters);
  const [tableColumns, setTableColumns] = React.useState(columns);
  const [levelPermission, setLevelPermission] = React.useState({});

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { state } = React.useContext(AuthContext);

  const { data: permission, loading: permissionLoading } =
    usePermissionFetcher("level");

  const navigate = useNavigate();

  const schema = yup
    .object({
      searchText: yup.string(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const getData = async ({ page = 1, limit = 10, filters = {} }) => {
    setLoading(true);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("level")
        .select("*", { count: "exact" }) // fetch count too
        .eq("organization_id", state?.organization_id);

      // Apply filters
      if (filters?.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%`);
      }
      if (filters?.levelIds?.length) {
        query = query.in("id", filters.levelIds);
      }
      if (filters?.statuses?.length) {
        query = query.in("status", filters.statuses);
      }
      if (filters?.updatedAfter) {
        query = query.gte("updated_at", filters.updatedAfter);
      }
      if (filters?.updatedBefore) {
        query = query.lte("updated_at", filters.updatedBefore);
      }

      query = query
        .range(from, to)
        .order(filters?.sortBy, { ascending: !filters?.isOrderDesc });

      const { data, error, count } = await query;

      if (error) throw error;

      const dataModified = data?.map((item) => ({
        ...item,
        status_modified:
          item?.status?.toLowerCase() === "active" ? "Enabled" : "Disabled",
        updated_at_modified: moment(item?.updated_at).format(
          "MMM DD, YYYY hh:mm A"
        ),
      }));

      setPageSize(limit);
      setPageCount(Math.ceil((count || 0) / limit));
      setTotalRecords(count || 0);
      setPage(page);
      setCurrentTableData(dataModified);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const onSort = (key, isOrderDesc, accessor) => {
    const filter = { ...filters, sortBy: key, isOrderDesc };
    const newTableColumns = tableColumns?.map((cl) => {
      if (cl?.accessor === accessor) {
        return { ...cl, isSortedDesc: isOrderDesc };
      }
      return cl;
    });

    setFilters(filter);
    setTableColumns(newTableColumns);
    getData({ page: currentPage, limit: pageSize, filters: filter });
  };

  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters: filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("level")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the level.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Level deleted successfully.");
      getData({ page: currentPage, limit: pageSize, filters: filters });
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the level.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const onSubmit = async (data) => {
    setFilters((prev) => ({ ...prev, name: data?.searchText?.trim() }));
    getData({
      page: 1,
      limit: pageSize,
      filters: {
        ...filters,
        name: data?.searchText?.trim(),
      },
    });
  };
  const handleClearFilters = () => {
    setFilters(defaultFilters);
    getData({ page: 1, limit: pageSize, filters: defaultFilters });
  };
  const handleFilter = () => {
    getData({ page: 1, limit: pageSize, filters: filters });
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "level",
      },
    });
    if (permission?.view) {
      getData({ page: currentPage, limit: pageSize, filters: defaultFilters });
    }
  }, [permission]);

  return (
    <div className="">
      <UserNavBar />
      {permissionLoading ? (
        <div className="my-10 flex justify-center">
          <Spinner size={100} />
        </div>
      ) : permission?.view ? (
        <PageWrapper className="px-7">
          {/* Bottom search bar */}
          <div className="flex mb-7 items-center gap-5 justify-between">
            <div className="flex  flex-1 max-w-xl items-center gap-5">
              <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
                <SearchInput
                  errors={errors}
                  register={register}
                  name={"searchText"}
                  placeholder={"Search by Level Name"}
                />
              </form>

              <InteractiveButton
                type={"button"}
                // className={"hover:!border-secondary hover:!text-secondary"}
                isSecondaryBtn={true}
                onClick={() => setIsFilterDrawerOpen(true)}
              >
                <p className="flex items-center gap-2">
                  <span>Filter</span>
                  <IoFilterCircle className="" size={25} />
                </p>
              </InteractiveButton>
            </div>

            {permission?.add ? (
              <InteractiveButton
                onClick={() => navigate("/user/add-level")}
                className={"!px-10"}
                type={"button"}
              >
                <span className="flex items-center gap-3">
                  {" "}
                  <FaPlus />
                  <span>New Level</span>
                </span>
              </InteractiveButton>
            ) : null}
          </div>

          {/* table */}
          <MkdListTable
            columns={tableColumns}
            tableRole={"user"}
            table={"level"}
            actionId={"id"}
            onSort={onSort}
            deleteItem={handleDeleteItem}
            loading={loading}
            deleteLoading={deleteLoading}
            showDeleteModal={showDeleteModal}
            currentTableData={currentTableData}
            setShowDeleteModal={setShowDeleteModal}
            setCurrentTableData={setCurrentTableData}
            actions={{ delete: permission?.delete, edit: permission?.add }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            totalRecords={totalRecords}
            limit={pageSize}
            onPageChange={handlePagination}
          />
        </PageWrapper>
      ) : (
        <PermissionWarning />
      )}

      <LevelFilterDrawer
        isOpen={isFilterDrawerOpen}
        setIsOpen={setIsFilterDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        handleClearFilters={handleClearFilters}
        handleFilter={handleFilter}
      />
    </div>
  );
};

export default UserListLevelPage;

// import React from "react";
// import { AdministratorNavBar, UserNavBar } from "Components/NavBar";
// import { SearchInput } from "Components/SearchInput";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { InteractiveButton } from "Components/InteractiveButton";
// import { IoFilterCircle } from "react-icons/io5";
// import { FaPlus } from "react-icons/fa6";
// import { MkdListTable } from "Components/MkdListTable";
// import { PaginationBar } from "Components/PaginationBar";
// import { GlobalContext, showToast } from "Context/Global";
// import { useNavigate } from "react-router";
// import { supabase } from "Src/supabase";
// import { AuthContext } from "Context/Auth";
// import AdministratorLevelFilter from "Components/Level/LevelFilterDrawer";
// import { LevelFilterDrawer } from "Components/Level";
// import moment from "moment";
// import { Pagination } from "Components/Pagination";
// import { usePermission, useUserData } from "Context/Custom";
// import { PageWrapper } from "Components/PageWrapper";
// import { FullPageLoader } from "Components/FullPageLoader";
// import { PermissionWarning } from "Components/PermissionWarning";

// const columns = [
//   {
//     header: "Level ID",
//     accessor: "id",
//     isSorted: false,
//     isSortedDesc: false,
//     mappingExist: false,
//     mappings: {},
//   },

//   {
//     header: "Level Name",
//     accessor: "name",
//     isSorted: false,
//     isSortedDesc: false,
//     mappingExist: false,
//     mappings: {},
//   },
//   {
//     header: "Description",
//     accessor: "description",
//     isSorted: false,
//     isSortedDesc: false,
//     mappingExist: false,
//     mappings: {},
//   },
//   {
//     header: "Status",
//     accessor: "status_modified",
//     isSorted: false,
//     isSortedDesc: false,
//     mappingExist: false,
//     showDot: true,
//     mappings: {},
//   },

//   {
//     header: "Last Modified",
//     accessor: "updated_at_modified",
//     isSorted: false,
//     isSortedDesc: false,
//     mappingExist: false,
//     mappings: {},
//   },

//   {
//     header: "Action",
//     accessor: "",
//   },
// ];

// const defaultFilters = {
//   searchTerm: "",
//   name: "",
//   levelIds: [],
//   statuses: [],
//   updatedAfter: "",
//   updatedBefore: "",
// };

// const UserListLevelPage = () => {
//   const [pageSize, setPageSize] = React.useState(10);
//   const [pageCount, setPageCount] = React.useState(0);
//   const [totalRecords, setTotalRecords] = React.useState(0);
//   const [currentPage, setPage] = React.useState(1);
//   const [canPreviousPage, setCanPreviousPage] = React.useState(false);
//   const [canNextPage, setCanNextPage] = React.useState(false);
//   const [showDeleteModal, setShowDeleteModal] = React.useState(false);
//   const [deleteLoading, setDeleteLoading] = React.useState(false);
//   const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);
//   const [isFetchingData, setIsFetchingData] = React.useState(false);
//   const [loading, setLoading] = React.useState(false);
//   const [currentTableData, setCurrentTableData] = React.useState([]);
//   const [filters, setFilters] = React.useState(defaultFilters);
//   const [levelPermission, setLevelPermission] = React.useState({});

//   const { dispatch: globalDispatch } = React.useContext(GlobalContext);
//   const { state } = React.useContext(AuthContext);
//   // const levelPermission = usePermission("level");
//   const navigate = useNavigate();

//   const schema = yup
//     .object({
//       searchText: yup.string(),
//     })
//     .required();

//   const {
//     register,
//     handleSubmit,
//     setError,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//   });

//   const fetchSinglePermission = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("permission")
//         .select("*")
//         .eq("organization_id", state?.organization_id)
//         .eq("name", "level")
//         .eq("role_id", state?.role_id)
//         .single();
//       console.log(data);
//       setLevelPermission(data);
//     } catch (error) {
//       console.log("fetchPermission->>", error?.message);
//     }
//   };

//   const getData = async ({ page = 1, limit = 10, filters = {} }) => {
//     setLoading(true);
//     try {
//       const from = (page - 1) * limit;
//       const to = from + limit - 1;

//       let query = supabase
//         .from("level")
//         .select("*", { count: "exact" }) // fetch count too
//         .eq("organization_id", state?.organization_id);

//       // Apply filters
//       if (filters?.searchTerm) {
//         query = query.or(`name.ilike.%${filters.searchTerm}%`);
//       }
//       if (filters?.levelIds?.length) {
//         query = query.in("id", filters.levelIds);
//       }
//       if (filters?.statuses?.length) {
//         query = query.in("status", filters.statuses);
//       }
//       if (filters?.updatedAfter) {
//         query = query.gte("updated_at", filters.updatedAfter);
//       }
//       if (filters?.updatedBefore) {
//         query = query.lte("updated_at", filters.updatedBefore);
//       }

//       query = query.range(from, to).order("id", { ascending: false });

//       const { data, error, count } = await query;

//       if (error) throw error;

//       const dataModified = data?.map((item) => ({
//         ...item,
//         status_modified:
//           item?.status?.toLowerCase() === "active" ? "Enabled" : "Disabled",
//         updated_at_modified: moment(item?.updated_at).format(
//           "MMM DD, YYYY hh:mm A"
//         ),
//       }));

//       setPageSize(limit);
//       setPageCount(Math.ceil((count || 0) / limit));
//       setTotalRecords(count || 0);
//       setPage(page);
//       setCurrentTableData(dataModified);
//     } catch (error) {
//       console.error(error);
//     }
//     setLoading(false);
//   };

//   const handlePagination = (page) => {
//     try {
//       getData({ page, limit: pageSize, filters: filters });
//     } catch (error) {
//       console.log("handlePagination->>", error?.message);
//     }
//   };

//   const handleDeleteItem = async (id) => {
//     setDeleteLoading(true);
//     try {
//       const { error, data } = await supabase
//         .from("level")
//         .delete()
//         .eq("id", id);

//       if (error) {
//         showToast(
//           globalDispatch,
//           error?.message || "Failed to delete the level.",
//           4000,
//           "error"
//         );
//       }
//       showToast(globalDispatch, "Level deleted successfully.");
//       getData({ page: currentPage, limit: pageSize, filters: filters });
//     } catch (error) {
//       console.log(error?.message);
//       showToast(
//         globalDispatch,
//         error?.message || "Failed to delete the level.",
//         4000,
//         "error"
//       );
//     }
//     setDeleteLoading(false);
//     setShowDeleteModal(false);
//   };

//   const onSubmit = async (data) => {
//     getData({
//       page: 1,
//       limit: pageSize,
//       filters: {
//         ...filters,
//         searchTerm: data?.searchText?.trim(),
//       },
//     });

//     setFilters((prev) => ({ ...prev, searchTerm: data?.searchText?.trim() }));
//   };
//   const handleClearFilters = () => {
//     setFilters(defaultFilters);
//     getData({ page: 1, limit: pageSize, filters: {} });
//   };
//   const handleFilter = () => {
//     getData({ page: 1, limit: pageSize, filters: filters });
//   };

//   const loadData = async () => {
//     setIsFetchingData(true);
//     try {
//       await Promise.all([
//         fetchSinglePermission(),
//         getData({ page: currentPage, limit: pageSize, filters: {} }),
//       ]);
//     } catch (error) {
//       console.error("Error in loadData:", error);
//     }
//     setIsFetchingData(false);
//   };

//   React.useEffect(() => {
//     globalDispatch({
//       type: "SETPATH",
//       payload: {
//         path: "level",
//       },
//     });
//     loadData();
//   }, []);

//   return (
//     <div className="">
//       <UserNavBar />

//       {isFetchingData ? (
//         <FullPageLoader />
//       ) : levelPermission?.view ? (
//         <PageWrapper>
//           {/* Bottom search bar */}
//           <div className="flex mb-7 items-center gap-5 justify-between">
//             <div className="flex  flex-1 max-w-xl items-center gap-5">
//               <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
//                 <SearchInput
//                   errors={errors}
//                   register={register}
//                   name={"searchText"}
//                   placeholder={"Search by Level Name"}
//                 />
//               </form>

//               <InteractiveButton
//                 type={"button"}
//                 // className={"hover:!border-secondary hover:!text-secondary"}
//                 isSecondaryBtn={true}
//                 onClick={() => setIsFilterDrawerOpen(true)}
//               >
//                 <p className="flex items-center gap-2">
//                   <span>Filter</span>
//                   <IoFilterCircle className="" size={25} />
//                 </p>
//               </InteractiveButton>
//             </div>

//             {levelPermission?.add ? (
//               <InteractiveButton
//                 onClick={() => navigate("/user/add-level")}
//                 className={"!px-10"}
//                 type={"button"}
//               >
//                 <span className="flex items-center gap-3">
//                   {" "}
//                   <FaPlus />
//                   <span>New Level</span>
//                 </span>
//               </InteractiveButton>
//             ) : null}
//           </div>

//           {/* table */}
//           <MkdListTable
//             columns={columns}
//             tableRole={"user"}
//             table={"level"}
//             actionId={"id"}
//             deleteItem={handleDeleteItem}
//             loading={loading}
//             deleteLoading={deleteLoading}
//             showDeleteModal={showDeleteModal}
//             currentTableData={currentTableData}
//             setShowDeleteModal={setShowDeleteModal}
//             setCurrentTableData={setCurrentTableData}
//             actions={{
//               delete: levelPermission?.delete,
//               edit: levelPermission?.add,
//               // view: levelPermission?.view,
//             }}
//           />

//           <Pagination
//             currentPage={currentPage}
//             totalPages={pageCount}
//             totalRecords={totalRecords}
//             limit={pageSize}
//             onPageChange={handlePagination}
//           />
//         </PageWrapper>
//       ) : (
//         <PermissionWarning />
//       )}

//       <LevelFilterDrawer
//         isOpen={isFilterDrawerOpen}
//         setIsOpen={setIsFilterDrawerOpen}
//         filters={filters}
//         setFilters={setFilters}
//         handleClearFilters={handleClearFilters}
//         handleFilter={handleFilter}
//       />
//     </div>
//   );
// };

// export default UserListLevelPage;
