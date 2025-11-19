const ParticipantDateFilter = ({ visible, filters, setFilters }) => (
  <div className="space-y-4" style={{ display: visible ? "block" : "none" }}>
    <div className="flex items-center gap-1">
      <input
        type="date"
        value={filters?.updatedAfter || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, updatedAfter: e.target.value }))
        }
        className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent "
      />
      <span>To</span>
      <input
        type="date"
        value={filters?.updatedBefore || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, updatedBefore: e.target.value }))
        }
        className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent"
      />
    </div>
  </div>
);

export default ParticipantDateFilter;
