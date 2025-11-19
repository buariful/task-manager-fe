const LevelStatusFilter = ({ visible, filters, setFilters }) => {
  const options = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];
  const handleStatusSelect = (e, value) => {
    try {
      const currentValues = filters.statuses || [];
      const newValues = e.target.checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      setFilters((prev) => ({ ...prev, statuses: newValues }));
    } catch (error) {
      console.log("handleStatusSelect->>", error?.message);
    }
  };
  return (
    <div className="space-y-2" style={{ display: visible ? "block" : "none" }}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <input
            name={option.value}
            type="checkbox"
            checked={filters?.statuses?.includes(option.value) || false}
            onChange={(e) => handleStatusSelect(e, option?.value)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default LevelStatusFilter;
