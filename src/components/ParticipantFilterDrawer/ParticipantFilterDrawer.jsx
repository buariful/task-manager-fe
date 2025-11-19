import { FilterDrawer } from "Components/FilterDrawer";
import React from "react";
import ParticipantStatusFilter from "./ParticipantStatusFilter";
import ParticipantDateFilter from "./ParticipantDateFilter";

export default function ParticipantFilterDrawer({
  isOpen,
  setIsOpen,
  handleFilter,
  handleClearFilters,
  filters,
  setFilters,
}) {
  const filterTabs = [
    {
      key: "status",
      label: "Status",
    },
    {
      key: "lastModified",
      label: "Last Modified",
    },
  ];

  return (
    <div>
      <FilterDrawer
        open={isOpen}
        setOpen={setIsOpen}
        filterTabs={filterTabs}
        onApplyFilters={handleFilter}
        onClearFilters={handleClearFilters}
      >
        <ParticipantStatusFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="status"
        />
        <ParticipantDateFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="lastModified"
        />
      </FilterDrawer>
    </div>
  );
}
