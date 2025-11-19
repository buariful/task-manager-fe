import { FilterDrawer } from "Components/FilterDrawer";
import React from "react";
import UserStatusFilter from "./UserStatusFilter";
import UserRoleFilter from "./UserRoleFilter";

export default function UserFilterDrawer({
  isOpen,
  setIsOpen,
  handleFilter,
  handleClearFilters,
  filters,
  setFilters,
}) {
  const filterTabs = [
    {
      key: "role",
      label: "Role",
    },
    {
      key: "status",
      label: "Status",
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
        <UserStatusFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="status"
        />

        <UserRoleFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="role"
        />
      </FilterDrawer>
    </div>
  );
}
