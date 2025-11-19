import {
  FilterDrawer,
  FilterWithDate,
  FilterWithDateRange,
} from "Components/FilterDrawer";
import React from "react";
import { SelectFilteredLevels } from "Components/Level";
// import InstructorFilter from "./InstructorFilter";
// import SeasonFilter from "./SeasonFilter";
// import LocationFilter from "./LocationFilter";
// import FilterWIthWeeklyDays from "./FilterWIthWeeklyDays";
import {
  FilterWIthWeeklyDays,
  InstructorFilter,
  LocationFilter,
  SeasonFilter,
} from "Components/WorkSheet";

export default function ReportFilterDrawer({
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
      key: "instructors",
      label: "Instructors",
    },
    {
      key: "last_modified_date",
      label: "Last Modified",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "seasons",
      label: "Season",
    },
    {
      key: "days_of_week",
      label: "Day of the Week",
    },
    {
      key: "start_date",
      label: "Start Date",
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
        <InstructorFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="instructors"
        />
        <SeasonFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="seasons"
        />
        <LocationFilter
          filters={filters}
          setFilters={setFilters}
          tabKey="location"
        />
        <FilterWIthWeeklyDays
          filters={filters}
          setFilters={setFilters}
          tabKey="days_of_week"
        />
        <FilterWithDateRange
          filters={filters}
          setFilters={setFilters}
          tabKey="last_modified_date"
          startDateFilterKey="modified_at_after"
          endDateFilterKey="modified_at_before"
        />
        <FilterWithDateRange
          filters={filters}
          setFilters={setFilters}
          tabKey="start_date"
          startDateFilterKey="start_date_after"
          endDateFilterKey="start_date_before"
        />
      </FilterDrawer>
    </div>
  );
}
