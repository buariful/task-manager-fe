import { FilterDrawer } from "Components/FilterDrawer";
import React from "react";
import SelectFilteredLevels from "./SelectFilteredLevels";
import LevelLastModifiedFilter from "./LevelLastModifiedFilter";
import LevelStatusFilter from "./LevelStatusFilter";

export default function LevelFilterDrawer({
  isOpen,
  setIsOpen,
  handleFilter,
  handleClearFilters,
  filters,
  setFilters,
}) {
  const filterTabs = [
    {
      key: "levels",
      label: "Levels",
    },
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
        {/* <div style={{ display: visible ? "block" : "none" }}> */}
        <SelectFilteredLevels
          filters={filters}
          setFilters={setFilters}
          tabKey="levels"
        />
        <LevelStatusFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="status"
        />
        <LevelLastModifiedFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="lastModified"
        />
      </FilterDrawer>
    </div>
  );
}
