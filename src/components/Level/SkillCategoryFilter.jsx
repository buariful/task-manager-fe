import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { InteractiveButton } from "Components/InteractiveButton";
import { useCallback } from "react";
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";
import { Spinner } from "Assets/svgs";
import { useEffect } from "react";

const SkillCategoryFilter = ({
  open,
  setOpen,
  selectedCatgoryIds,
  setSelectedCatgoryIds,
  onApplyFilters,
  onClearFilters,
}) => {
  const { state } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleApplyFilters = () => {
    onApplyFilters();
    setOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setOpen(false);
  };

  const handleCategoryToggle = (e, value) => {
    const currentValues = selectedCatgoryIds || [];
    const newValues = e.target.checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    setSelectedCatgoryIds(newValues);
  };

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

  useEffect(() => {
    fetchCategoriesCallback();
  }, []);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <div className="fixed inset-0 overflow-hidden">
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-screen max-w-2xl">
                <div className="flex h-full bg-white shadow-xl">
                  {/*  Filter Content */}
                  <div className="flex-1 flex flex-col mt-12">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        Filter
                      </h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                      <div>
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search categories"
                              className="w-full px-4 py-2 pl-10 border border-gray-300 focus:ring-0 focus:border-transparent"
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
                                      selectedCatgoryIds?.includes(
                                        option.value
                                      ) || false
                                    }
                                    onChange={(e) =>
                                      handleCategoryToggle(e, option.value)
                                    }
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {option.label}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer with action buttons */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleClearFilters}
                          className="px-10 py-2 text-sm font-medium text-gray-700 bg-white border border-transparent   hover:bg-gray-50 focus:outline-none hover:border-neutral-gray focus:ring-2 focus:ring-neutral-gray"
                        >
                          Clear Filters
                        </button>
                        <InteractiveButton
                          type="button"
                          onClick={handleApplyFilters}
                          className="!px-10"
                        >
                          Apply Filters
                        </InteractiveButton>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SkillCategoryFilter;
