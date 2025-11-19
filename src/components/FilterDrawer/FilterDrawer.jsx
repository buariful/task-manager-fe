import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { InteractiveButton } from "Components/InteractiveButton";

const FilterDrawer = ({
  open,
  setOpen,
  filterTabs = [],
  children,
  onApplyFilters,
  onClearFilters,
}) => {
  const [activeTab, setActiveTab] = useState(filterTabs[0]?.key || "");

  const handleApplyFilters = () => {
    onApplyFilters();
    setOpen(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setOpen(false);
  };

  // Find the child component that matches the active tab
  const activeChild = React.Children.toArray(children).find(
    (child) => child.props.tabKey === activeTab
  );

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
              <Dialog.Panel className="w-screen max-w-xl">
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

                      <div className=" divide-y">
                        {filterTabs.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full text-left px-4 py-3  text-sm font-medium transition-colors ${
                              activeTab === tab.key
                                ? "bg-light-info text-gray-900"
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
                  <div className="flex-1 flex flex-col mt-12">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {filterTabs.find((tab) => tab.key === activeTab)
                          ?.label || "Select Filter"}
                      </h3>
                    </div>
                    {/* 
                    <div className="flex-1 p-6 overflow-y-auto">
                      {activeChild || (
                        <div className="text-center text-gray-500 py-8">
                          No filter content available for this tab.
                        </div>
                      )}
                    </div> */}

                    <div className="flex-1 p-6 overflow-y-auto">
                      {React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                          visible: child.props.tabKey === activeTab,
                        })
                      )}
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

export default FilterDrawer;
