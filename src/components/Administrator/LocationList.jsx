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
import AddLocationModal from "./AddLocationModal";
import EditLocationModal from "./EditLocationModal";

const columns = [
  {
    header: "Location Name",
    accessor: "name",
  },
  {
    header: "Address",
    accessor: "address",
  },
  {
    header: "Phone Number",
    accessor: "phone",
  },

  {
    header: "Action",
    accessor: "",
  },
];

export default function LocationList() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);
  const { organization_id } = state;

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocationToEdit, setSelectedLocationToEdit] = useState({});

  const getData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("location")
        .select("*")
        .eq("organization_id", organization_id)
        .order("id", { ascending: false });

      // address:`${street}, ${city}, ${province}, ${postal_code}`;
      const dataModified = data?.map((item) => ({
        ...item,
        address: `${item?.street}, ${item?.city}, ${item?.province}, ${item?.postal_code}`,
      }));

      setLocations(dataModified);
    } catch (error) {
      console.log("failed to get", error?.message);
    }
    setLoading(false);
  };

  const handleDeleteLocation = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("location")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the location.",
          4000,
          "error"
        );
      }
      getData();
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the location.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const handleOpenEditModal = (id) => {
    try {
      const selectedLocation = locations?.find((item) => item?.id === id);
      setSelectedLocationToEdit(selectedLocation);
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
            <span>New Location</span>
          </span>
        </InteractiveButton>
      </div>

      <MkdListTable
        columns={columns}
        tableRole={"administrator"}
        table={"location"}
        actionId={"id"}
        deleteItem={handleDeleteLocation}
        loading={loading}
        deleteLoading={deleteLoading}
        showDeleteModal={showDeleteModal}
        currentTableData={locations}
        setShowDeleteModal={setShowDeleteModal}
        setCurrentTableData={setLocations}
        handleEditFunction={handleOpenEditModal}
        actions={{ edit: true, delete: true }}
      />

      <AddLocationModal
        refetch={getData}
        showModal={showAddModal}
        setShowModal={setShowAddModal}
      />

      <EditLocationModal
        showModal={selectedLocationToEdit?.id}
        refetch={getData}
        selectedRecord={selectedLocationToEdit}
        setSelectedRecord={setSelectedLocationToEdit}
      />
    </div>
  );
}
