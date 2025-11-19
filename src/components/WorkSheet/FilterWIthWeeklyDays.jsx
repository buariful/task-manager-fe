import { Spinner } from "Assets/svgs";
import { AuthContext } from "Context/Auth";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { useCallback } from "react";
import { supabase } from "Src/supabase";
import { weekDays } from "Utils/utils";

export default function FilterWIthWeeklyDays({ visible, filters, setFilters }) {
  const [instructor, setInstructor] = useState([]);
  const [loading, setLoading] = useState(false);

  const { state } = useContext(AuthContext);

  const handleLevelToggle = (e, value) => {
    const currentValues = filters.days_of_week || [];
    const newValues = e.target.checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);

    setFilters((prev) => ({ ...prev, days_of_week: newValues }));
  };

  return (
    <div style={{ display: visible ? "block" : "none" }}>
      <div className="space-y-3">
        <div className="space-y-2">
          {weekDays?.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters?.days_of_week?.includes(option.value) || false}
                onChange={(e) => handleLevelToggle(e, option.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
