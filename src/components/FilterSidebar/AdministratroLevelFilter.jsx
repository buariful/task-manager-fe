import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function FiltersPanel() {
  const [selected, setSelected] = useState([
    "Parent and Tot 1",
    "Parent and Tot 2",
    "Parent and Tot 3",
    "Preschool 1",
    "Fitness",
    "Swimmer 1",
    "Swimmer 2",
  ]);
  const [search, setSearch] = useState("");

  const levels = [
    "Parent and Tot 1",
    "Parent and Tot 2",
    "Parent and Tot 3",
    "Preschool 1",
    "Preschool 2",
    "Preschool 3",
    "Preschool 4",
    "Preschool 5",
    "Fitness",
    "Swimmer 1",
    "Swimmer 2",
  ];

  const toggleLevel = (level) => {
    setSelected((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearFilters = () => setSelected([]);

  const filteredLevels = levels.filter((level) =>
    level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex border rounded-2xl shadow-md w-full max-w-4xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 border-r bg-gray-50 p-4">
        <h2 className="font-bold text-lg mb-4">Filters</h2>
        <ul className="space-y-2">
          <li className="font-semibold text-black">Levels</li>
          <li className="text-gray-600 cursor-pointer hover:text-black">
            Status
          </li>
          <li className="text-gray-600 cursor-pointer hover:text-black">
            Last Modified
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <h3 className="font-semibold text-base mb-3">Select Levels</h3>

        {/* Search */}
        <div className="flex items-center border rounded-lg px-2 mb-4">
          <FaSearch className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search level name or level ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2 py-2 focus:outline-none text-sm"
          />
        </div>

        {/* Levels List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
          {filteredLevels.map((level) => (
            <label
              key={level}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(level)}
                onChange={() => toggleLevel(level)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-800">LO1A32 {level}</span>
            </label>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:underline"
          >
            Clear filters
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
