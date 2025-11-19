const FilterWithDate = ({
  visible,
  filters,
  setFilters,
  filterKey = "createdAt",
}) => (
  <div className="space-y-4" style={{ display: visible ? "block" : "none" }}>
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={filters?.[filterKey] || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, [filterKey]: e.target.value }))
        }
        className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent "
      />
    </div>
  </div>
);

export default FilterWithDate;
