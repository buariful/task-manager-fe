import { FilterDrawer } from "Components/FilterDrawer";
import { MkdInput } from "Components/MkdInput";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import moment from "moment";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Spinner } from "Assets/svgs";
import { useCallback } from "react";
import { debounce } from "Utils/utils";
import SelectSkillForFilter from "./SelectSkillForFilter";

export default function AdministratorSkillFilter({
  isOpen,
  setIsOpen,
  filters,
  setFilters,
  handleClearFilters,
  handleFilter,
}) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { state } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async (searchTerm = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("skill_category")
        .select("id, name")
        .eq("organization_id", state?.organization_id);

      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      //   if (error) throw error;

      const formatted = data.map((cat) => ({
        label: cat.name,
        value: cat.id,
      }));

      setCategories(formatted);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
      setCategories([]);
    }
    setLoading(false);
  };

  // Define filter tabs configuration
  const filterTabs = [
    {
      key: "skills",
      label: "Skills",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "type",
      label: "Type",
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

  const CategoryFilter = ({ visible }) => {
    const handleCategoryToggle = (e, value) => {
      const currentValues = filters.categories || [];
      const newValues = e.target.checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      setFilters((prev) => ({ ...prev, categories: newValues }));
    };

    // fetchCategories wrapped in useCallback to stabilize reference
    const fetchCategoriesCallback = useCallback(
      async (term = "") => {
        setLoading(true);
        try {
          let query = supabase
            .from("skill_category")
            .select("id, name")
            .eq("organization_id", state?.organization_id);

          if (term.trim()) {
            query = query.ilike("name", `%${term.trim()}%`);
          }

          const { data, error } = await query;
          if (error) throw error;

          const formatted = data.map((cat) => ({
            label: cat.name,
            value: cat.id,
          }));
          setCategories(formatted);
        } catch (err) {
          console.error(err.message);
          setCategories([]);
        }
        setLoading(false);
      },
      [state?.organization_id]
    );

    // debounce once, stable reference
    const debouncedFetch = React.useMemo(
      () =>
        debounce((term) => {
          fetchCategoriesCallback(term);
        }, 500),
      [fetchCategoriesCallback]
    );

    return (
      <div style={{ display: visible ? "block" : "none" }}>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories"
              className="w-full px-4 py-2 pl-10 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value); // do not trim here
                fetchCategoriesCallback(e.target.value);
              }}
            />
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
              categories?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.categories?.includes(option.value) || false
                    }
                    onChange={(e) => handleCategoryToggle(e, option.value)}
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
  };

  const TypeFilter = ({ visible }) => {
    const schema = yup
      .object({
        skillType: yup.string(),
      })
      .required();

    const {
      register,
      handleSubmit,
      setError,
      formState: { errors },
    } = useForm({
      resolver: yupResolver(schema),
    });

    const handleTypeSelect = (e, value) => {
      try {
        const currentValues = filters.types || [];
        const newValues = e.target.checked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value);
        setFilters((prev) => ({ ...prev, types: newValues }));
      } catch (error) {
        console.log("handleTypeSelect->>", error?.message);
      }
    };

    const onSubmit = (data) => {
      console.log(data);
    };
    const options = [
      { label: "Assisted", value: 1 },
      { label: "Unassisted", value: 2 },
    ];
    return (
      <div
        className="space-y-2"
        style={{ display: visible ? "block" : "none" }}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <input
              name={option.value}
              type="checkbox"
              checked={filters?.types?.includes(option.value) || false}
              onChange={(e) => handleTypeSelect(e, option?.value)}
              // onChange={(e) => {
              //     const currentValues = filters.categories || [];
              //     const newValues = e.target.checked
              //       ? [...currentValues, option.value]
              //       : currentValues.filter((v) => v !== option.value);
              //     setFilters((prev) => ({ ...prev, categories: newValues }));
              //   }}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    );
  };

  const StatusFilter = ({ visible }) => {
    const options = [
      { label: "Active", value: 1 },
      { label: "Inactive", value: 0 },
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
      <div
        className="space-y-2"
        style={{ display: visible ? "block" : "none" }}
      >
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

  const LastModifiedFilter = ({ visible }) => (
    <div className="space-y-4" style={{ display: visible ? "block" : "none" }}>
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={filters.updatedAfter || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, updatedAfter: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent "
        />
        <span>To</span>
        <input
          type="date"
          value={filters.updatedBefore || ""}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, updatedBefore: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300  focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
    </div>
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  //   if (loading) {
  //     return (
  //       <div className="h-full w-full grid place-content-center">
  //         <Spinner size={50} color="#2CC9D5" />
  //       </div>
  //     );
  //   }

  return (
    <div>
      {" "}
      <FilterDrawer
        open={isOpen}
        setOpen={setIsOpen}
        filterTabs={filterTabs}
        onApplyFilters={handleFilter}
        onClearFilters={handleClearFilters}
      >
        {/* <div style={{ display: visible ? "block" : "none" }}> */}

        <SelectSkillForFilter
          tabKey="skills"
          setFilters={setFilters}
          filters={filters}
        />
        <CategoryFilter tabKey="category" />
        <TypeFilter tabKey="type" />
        <StatusFilter tabKey="status" />
        <LastModifiedFilter tabKey="lastModified" />
      </FilterDrawer>
    </div>
  );
}
