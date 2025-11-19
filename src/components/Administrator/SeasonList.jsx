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
    header: "Season Name",
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

export default function SeasonList() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);
  const { organization_id } = state;

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonToEdit, setSelectedSeasonToEdit] = useState({});

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("season")
        .select("*")
        .eq("organization_id", organization_id)

        .order("id", { ascending: false });

      const dataModified = data?.map((item) => ({
        ...item,
        status_modified:
          item?.status?.toLowerCase() === "active" ? "Enabled" : "Disabled",
        updated_at: moment(item?.updated_at)?.format("MMM DD, YYYY h:mm A"),
      }));
      setSeasons(dataModified);
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setLoading(false);
  };

  const handleDeleteSeason = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("season")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the season.",
          4000,
          "error"
        );
      }
      getData();
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the season.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const handleOpenEditModal = (id) => {
    try {
      const selectedSeason = seasons?.find((item) => item?.id === id);
      setSelectedSeasonToEdit(selectedSeason);
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
            <span>Add New Season</span>
          </span>
        </InteractiveButton>
      </div>

      <MkdListTable
        columns={columns}
        tableRole={"administrator"}
        table={"season"}
        actionId={"id"}
        deleteItem={handleDeleteSeason}
        loading={loading}
        deleteLoading={deleteLoading}
        showDeleteModal={showDeleteModal}
        currentTableData={seasons}
        setShowDeleteModal={setShowDeleteModal}
        setCurrentTableData={setSeasons}
        handleEditFunction={handleOpenEditModal}
        actions={{ edit: true, delete: true }}
      />

      <AddRecordWithNameModal
        refetch={getData}
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        modalName={"Season"}
        table={"season"}
      />

      <EditNameStatusModal
        showModal={selectedSeasonToEdit?.id}
        refetch={getData}
        selectedRecord={selectedSeasonToEdit}
        setSelectedRecord={setSelectedSeasonToEdit}
        table={"season"}
        modalName={"Season"}
      />
    </div>
  );
}
