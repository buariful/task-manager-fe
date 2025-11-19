import React from "react";
import { AdministratorNavBar } from "Components/NavBar";
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
import {
  AdministratorAddSkillModal,
  AdministratorEditSkillModal,
  AdministratorSkillFilter,
} from "Components/AdministratorSkill";
import { FilterDrawer } from "Components/FilterDrawer";
import { MkdInput } from "Components/MkdInput";
import { supabase } from "Src/supabase";
import { getSkillStatusName, getSkillType } from "Utils/utils";
import moment from "moment";
import { Pagination } from "Components/Pagination";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";

const columns = [
  {
    header: "Skill Name",
    accessor: "name",
    sortingKey: "name",
    isSorted: true,
    isSortedDesc: true,
  },

  {
    header: "Category",
    accessor: "category_name",
    sortingKey: "category_name",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Type",
    accessor: "type_name",
    sortingKey: "type",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Levels Tagged",
    accessor: "levels_tagged_number",
    sortingKey: "levels_tagged_number",
    isSorted: true,
    isSortedDesc: false,
  },
  {
    header: "Status",
    accessor: "status_name",
    // sortingKey: "status",
    // isSorted: true,
    // isSortedDesc: false,

    showDot: true,
  },

  {
    header: "Last Modified",
    accessor: "updated_at",
    sortingKey: "updated_at",
    isSorted: true,
    isSortedDesc: false,
  },

  {
    header: "Action",
    accessor: "",
  },
];

const defaultFilters = {
  name: "",
  categories: [],
  types: [],
  statuses: [],
  updatedAfter: "",
  updatedBefore: "",
  ids: [],
  sortBy: "id",
  isSortedDesc: true,
};

const AdministratorSkillListPage = () => {
  const { state } = useContext(AuthContext);

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalSkills, setTotalSkils] = React.useState(0);
  const [currentPage, setPage] = React.useState(0);
  const [tableColumns, setTableColumns] = React.useState(columns);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isAddSkillModalOpen, setAddSkillModalOpen] = React.useState(false);
  const [editingSkillId, setEditingSkillId] = React.useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = React.useState(false);

  const [filters, setFilters] = React.useState(defaultFilters);

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
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
    try {
      setLoading(true);

      // prepare filters JSON exactly as expected by the SQL function
      const filterPayload = {
        name: filters?.name || "",
        categories: filters?.categories?.length ? filters.categories : [],
        types: filters?.types?.length ? filters.types : [],
        statuses: filters?.statuses?.length ? filters.statuses : [],
        updatedAfter: filters?.updatedAfter || "",
        updatedBefore: filters?.updatedBefore || "",
        ids: filters?.ids?.length ? filters.ids : [],
      };

      // ✅ Call Supabase function (RPC)
      const { data, error } = await supabase.rpc(
        "get_skills_with_filters_sorting",
        {
          p_organization_id: state?.organization_id,
          p_page: page,
          p_limit: limit,
          p_sort_column: filters?.sortBy || "id",
          p_sort_ascending: !filters?.isOrderDesc,
          p_filters: filterPayload,
        }
      );

      if (error) {
        console.error("Error fetching skills:", error);
        showToast("Error fetching skills", "error");
        return;
      }

      // handle empty result safely
      if (!data || !Array.isArray(data)) {
        setCurrentTableData([]);
        setTotalSkils(0);
        setPageCount(1);
        return;
      }

      // 🧠 map the data for display
      const dataModified = data.map((item) => ({
        ...item,
        type_name: getSkillType(item.type),
        status_name: getSkillStatusName(item.status),
        updated_at: moment(item.updated_at).format("MMM DD, YYYY h:mmA"),
      }));

      // set state
      setCurrentTableData(dataModified || []);
      setTotalSkils(data[0]?.total_count || 0);

      // pagination calculation
      const totalPages = Math.ceil((data[0]?.total_count || 0) / limit);
      setPageCount(totalPages);
      setPageSize(limit);
      setPage(page);
    } catch (err) {
      console.error("Unexpected error:", err);
      showToast("Unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const onSort = async (key, isOrderDesc, accessor) => {
    try {
      const filter = { ...filters, sortBy: key, isOrderDesc };
      console.log(filter);
      const newTableColumns = tableColumns?.map((cl) => {
        if (cl?.accessor === accessor) {
          return { ...cl, isSortedDesc: isOrderDesc };
        }
        return cl;
      });

      setFilters(filter);
      setTableColumns(newTableColumns);
      getData({ page: currentPage, limit: pageSize, filters: filter });
    } catch (error) {
      console.log(error?.message);
    }
  };

  const onSubmit = async (data) => {
    const newFilter = { ...filters, name: data?.searchText };
    getData({ page: 1, pageSize, filters: newFilter });
    setFilters(newFilter);
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("skill")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the skill.",
          4000,
          "error"
        );
      }
      getData({ page: 1, limit: pageSize, filters: filters });
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the skill.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
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
        path: "skill",
      },
    });
    getData({ page: 1, limit: pageSize, filters: defaultFilters });
  }, []);

  return (
    <div className="">
      <AdministratorNavBar />

      <div className="px-7">
        {/* Bottom search bar */}
        <div className="flex mb-7 items-center gap-5 justify-between">
          <div className="flex  flex-1 max-w-xl items-center gap-5">
            <form className="flex-1 " onSubmit={handleSubmit(onSubmit)}>
              <SearchInput
                errors={errors}
                register={register}
                name={"searchText"}
                placeholder={"Search by Skill Name"}
              />
            </form>

            <InteractiveButton
              type={"button"}
              isSecondaryBtn={true}
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <p className="flex items-center gap-2">
                <span>Filter</span>
                <IoFilterCircle className="" size={25} />
              </p>
            </InteractiveButton>
          </div>

          <InteractiveButton
            className={"!px-10"}
            type={"button"}
            onClick={() => setAddSkillModalOpen(true)}
          >
            <span className="flex items-center gap-3">
              {" "}
              <FaPlus />
              <span>New Skill</span>
            </span>
          </InteractiveButton>
        </div>

        {/* table */}
        <MkdListTable
          tableRole={"administrator"}
          table={"skill"}
          actionId={"id"}
          columns={tableColumns}
          onSort={onSort}
          deleteItem={handleDeleteItem}
          loading={loading}
          deleteLoading={deleteLoading}
          showDeleteModal={showDeleteModal}
          currentTableData={currentTableData}
          setShowDeleteModal={setShowDeleteModal}
          setCurrentTableData={setCurrentTableData}
          actions={{ delete: true, edit: true }}
          handleEditFunction={(id) => setEditingSkillId(id)}
        />

        <Pagination
          currentPage={currentPage}
          limit={pageSize}
          onPageChange={(page) =>
            getData({ page, limit: pageSize, filters: filters })
          }
          totalPages={pageCount}
          totalRecords={totalSkills}
        />
      </div>

      <AdministratorAddSkillModal
        setShowModal={setAddSkillModalOpen}
        showModal={isAddSkillModalOpen}
        refetch={getData}
        fnParams={{ page: currentPage, limit: pageSize, filters: filters }}
      />

      <AdministratorEditSkillModal
        setShowModal={() => setEditingSkillId(null)}
        showModal={!!editingSkillId}
        skillId={editingSkillId}
        refetch={getData}
        fnParams={{ page: currentPage, limit: pageSize, filters: filters }}
      />

      <AdministratorSkillFilter
        filters={filters}
        isOpen={isFilterDrawerOpen}
        setIsOpen={setIsFilterDrawerOpen}
        setFilters={setFilters}
        handleClearFilters={handleClearFilters}
        handleFilter={handleFilter}
      />
    </div>
  );
};

export default AdministratorSkillListPage;
