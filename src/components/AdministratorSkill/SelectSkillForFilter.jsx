import { Spinner } from "Assets/svgs";
import { AuthContext } from "Context/Auth";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { useCallback } from "react";
import { supabase } from "Src/supabase";

export default function SelectSkillForFilter({ visible, filters, setFilters }) {
  const { state } = useContext(AuthContext);

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLevelToggle = (e, value) => {
    const currentValues = filters?.ids || [];
    const newValues = e.target?.checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    setFilters((prev) => ({ ...prev, ids: newValues }));
  };

  const getData = async (term = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("skill")
        .select("id, name")
        .eq("organization_id", state?.organization_id);

      if (term.trim()) {
        query = query.ilike("name", `%${term.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted = data.map((skill) => ({
        label: skill?.name,
        value: skill?.id,
      }));
      setSkills(formatted);
    } catch (err) {
      console.error(err.message);
      setSkills([]);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    try {
      e?.preventDefault();
      getData(e?.target?.searchTerm?.value);
    } catch (error) {}
  };

  useEffect(() => {
    // fetchCategoriesCallback();
    getData();
  }, []);

  return (
    <div style={{ display: visible ? "block" : "none" }}>
      <div className="space-y-3">
        <div className="relative">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              name="searchTerm"
              placeholder="Search Skills"
              className="w-full px-4 py-2 pl-10 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="h-full w-full grid place-content-center">
              <Spinner size={30} color="#000" />
            </div>
          ) : (
            skills?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters?.ids?.includes(option.value) || false}
                  onChange={(e) => handleLevelToggle(e, option.value)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
