import { FullPageLoader } from "Components/FullPageLoader";
import { MkdListTable } from "Components/MkdListTable";
import { AuthContext } from "Context/Auth";
import moment from "moment";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { supabase } from "Src/supabase";
import EditNameStatusModal from "./EditNameStatusModal";
import AddRecordWithNameModal from "./AddRecordWithNameModal";
import { InteractiveButton } from "Components/InteractiveButton";
import { FaPlus } from "react-icons/fa6";
import { GlobalContext, showToast } from "Context/Global";

const columns = [
  {
    header: "Categories",
    accessor: "name",
  },
  {
    header: "Status",
    accessor: "status_modified",
  },
  {
    header: "Last Modified",
    accessor: "updated_at",
  },

  {
    header: "Action",
    accessor: "",
  },
];

export default function SkillCategoryList() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);
  const { organization_id } = state;

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [skillCategories, setSkillCategories] = useState([]);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState({});

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("skill_category")
        .select("*")
        .eq("organization_id", organization_id)

        .order("id", { ascending: false });

      const dataModified = data?.map((item) => ({
        ...item,
        status_modified:
          item?.status?.toLowerCase() === "active" ? "Enabled" : "Disabled",
        updated_at: moment(item?.updated_at)?.format("MMM DD, YYYY h:mm A"),
      }));
      setSkillCategories(dataModified);
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("skill_category")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the category.",
          4000,
          "error"
        );
      }
      getData();
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

  const handleOpenEditModal = (id) => {
    try {
      const selectedCategory = skillCategories?.find((item) => item?.id === id);
      setSelectedCategoryToEdit(selectedCategory);
    } catch (error) {
      console.log("handleOpenEditModal->>", error?.message);
    }
  };

  useEffect(() => {
    if (organization_id) {
      getData();
    }
  }, [organization_id]);

  return (
    <div>
      <div className="flex justify-end mb-5">
        <InteractiveButton
          className={"px-2"}
          type={"button"}
          onClick={() => setShowAddModal(true)}
        >
          <span className="flex items-center gap-3 ">
            {" "}
            <FaPlus />
            <span>New Skill Category</span>
          </span>
        </InteractiveButton>
      </div>

      <MkdListTable
        columns={columns}
        tableRole={"administrator"}
        table={"skill-category"}
        actionId={"id"}
        deleteItem={handleDeleteCategory}
        loading={loading}
        deleteLoading={deleteLoading}
        showDeleteModal={showDeleteModal}
        currentTableData={skillCategories}
        setShowDeleteModal={setShowDeleteModal}
        setCurrentTableData={setSkillCategories}
        handleEditFunction={handleOpenEditModal}
        actions={{ edit: true, delete: true }}
      />

      <AddRecordWithNameModal
        refetch={getData}
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        modalName={"Category"}
        table={"skill_category"}
      />

      <EditNameStatusModal
        showModal={selectedCategoryToEdit?.id}
        refetch={getData}
        selectedRecord={selectedCategoryToEdit}
        setSelectedRecord={setSelectedCategoryToEdit}
        table={"skill_category"}
        modalName={"Skill Category"}
      />
    </div>
  );
}
