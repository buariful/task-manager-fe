import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { InteractiveButton } from "Components/InteractiveButton";
import { MkdInput } from "Components/MkdInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const FilterDrawerOld = ({
  open,
  setOpen,
  filterTabs = [],
  onApplyFilters,
  onClearFilters,
  initialFilters = {},
}) => {
  const [activeTab, setActiveTab] = useState(filterTabs[0]?.key || "");
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  const schema = yup.object({
    searchText: yup.string(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialFilters,
  });

  const activeTabData = filterTabs.find((tab) => tab.key === activeTab);

  const handleFilterChange = (key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(selectedFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    onClearFilters();
    setOpen(false);
  };

  const renderFilterContent = () => {
    if (!activeTabData) return null;

    switch (activeTabData.type) {
      case "checkbox":
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {activeTabData.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedFilters[activeTabData.key]?.includes(
                        option.value
                      ) || false
                    }
                    onChange={(e) => {
                      const currentValues =
                        selectedFilters[activeTabData.key] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v) => v !== option.value);
                      handleFilterChange(activeTabData.key, newValues);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "select":
        return (
          <div className="space-y-3">
            <MkdInput
              errors={errors}
              label={activeTabData.label}
              name={activeTabData.key}
              type="mapping"
              mapping={activeTabData.mapping || {}}
              options={activeTabData.options?.map((opt) => opt.label) || []}
              register={register}
              onChange={(value) => handleFilterChange(activeTabData.key, value)}
            />
          </div>
        );

      case "dateRange":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={selectedFilters[`${activeTabData.key}_from`] || ""}
                onChange={(e) =>
                  handleFilterChange(
                    `${activeTabData.key}_from`,
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={selectedFilters[`${activeTabData.key}_to`] || ""}
                onChange={(e) =>
                  handleFilterChange(`${activeTabData.key}_to`, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-3">
            <MkdInput
              errors={errors}
              label={activeTabData.label}
              name={activeTabData.key}
              type="text"
              placeholder={
                activeTabData.placeholder || `Enter ${activeTabData.label}`
              }
              register={register}
              onChange={(e) =>
                handleFilterChange(activeTabData.key, e.target.value)
              }
            />
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            No filter options available for this tab.
          </div>
        );
    }
  };

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
                  {/* Left Side - Filter Tabs */}
                  <div className="w-1/3 bg-gray-50 border-r border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <button
                          onClick={() => setOpen(false)}
                          className="mr-3 p-1 rounded-md text-gray-400 hover:text-gray-600"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Filters
                        </Dialog.Title>
                      </div>

                      <div className="space-y-1">
                        {filterTabs.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                              activeTab === tab.key
                                ? "bg-gray-200 text-gray-900"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Filter Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {activeTabData?.label || "Select Filter"}
                      </h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto">
                      {renderFilterContent()}
                    </div>

                    {/* Footer with action buttons */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Clear filters
                        </button>
                        <InteractiveButton
                          type="button"
                          onClick={handleApplyFilters}
                          className="px-6 py-2"
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

export default FilterDrawerOld;
