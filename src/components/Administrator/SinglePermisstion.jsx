import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import { ToggleButton } from "Components/ToggleButton";
import React from "react";

export default function SinglePermisstion({ data, onChangeFn }) {
  return (
    <div className="mb-5 border rounded-lg overflow-hidden">
      <Disclosure defaultOpen={true}>
        {({ open }) => (
          <>
            {/* Accordion Header */}
            <Disclosure.Button className="flex w-full justify-between items-center bg-light-info p-3">
              <span className="capitalize font-medium">{data?.name}</span>
              <ChevronUpIcon
                className={`${
                  open ? "rotate-180 transform" : ""
                } h-5 w-5 text-gray-600 transition-transform duration-200`}
              />
            </Disclosure.Button>

            {/* Accordion Panel */}
            <Disclosure.Panel className="bg-input-bg">
              <div className="grid grid-cols-10 md:grid-cols-12 border-b">
                <p className="col-span-2 p-2 font-semibold">Features</p>
                <div className="col-span-8 grid grid-cols-3 p-2">
                  <span>View</span>
                  <span>Create/Edit</span>
                  <span>Delete</span>
                </div>
              </div>

              <div className="grid grid-cols-10 md:grid-cols-12">
                <p className="col-span-2 p-2 capitalize">{data?.name}</p>
                <div className="col-span-8 grid grid-cols-3 p-2">
                  <ToggleButton
                    value={data?.view}
                    onChangeFunction={(v) => onChangeFn(v, "view", data?.id)}
                  />
                  <ToggleButton
                    value={data?.add}
                    onChangeFunction={(v) => onChangeFn(v, "add", data?.id)}
                  />
                  <ToggleButton
                    value={data?.delete}
                    onChangeFunction={(v) => onChangeFn(v, "delete", data?.id)}
                  />
                </div>
              </div>
              {/* enable disable */}
              {["skill", "level", "participant", "user"]?.includes(
                data?.name?.toLowerCase()
              ) ? (
                <div className="grid grid-cols-10 md:grid-cols-12">
                  <p className="col-span-2 p-2 capitalize">Enable/Disable</p>
                  <div className="col-span-8 grid grid-cols-3 p-2">
                    <div></div>
                    <ToggleButton
                      value={data?.enable_disable}
                      onChangeFunction={(v) =>
                        onChangeFn(v, "enable_disable", data?.id)
                      }
                    />
                    <div></div>
                  </div>
                </div>
              ) : null}

              {["worksheet", "participant"]?.includes(
                data?.name?.toLowerCase()
              ) ? (
                <div className="grid grid-cols-10 md:grid-cols-12">
                  <p className="col-span-2 p-2 capitalize">
                    {/* Import {data?.name} */}
                    Import
                  </p>
                  <div className="col-span-8 grid grid-cols-3 p-2">
                    <div></div>
                    <ToggleButton
                      value={data?.import}
                      onChangeFunction={(v) =>
                        onChangeFn(v, "import", data?.id)
                      }
                    />
                    <div></div>
                  </div>
                </div>
              ) : null}

              {/* worksheet */}

              {["worksheet", "participant"]?.includes(
                data?.name?.toLowerCase()
              ) ? (
                <>
                  {/* Export */}
                  <div className="grid grid-cols-10 md:grid-cols-12">
                    <p className="col-span-2 p-2 capitalize">Export</p>
                    <div className="col-span-8 grid grid-cols-3 p-2">
                      <div></div>
                      <ToggleButton
                        value={data?.export}
                        onChangeFunction={(v) =>
                          onChangeFn(v, "export", data?.id)
                        }
                      />
                      <div></div>
                    </div>
                  </div>
                  {/* Download */}
                  <div className="grid grid-cols-10 md:grid-cols-12">
                    <p className="col-span-2 p-2 capitalize">Download</p>
                    <div className="col-span-8 grid grid-cols-3 p-2">
                      <div></div>
                      <ToggleButton
                        value={data?.download}
                        onChangeFunction={(v) =>
                          onChangeFn(v, "download", data?.id)
                        }
                      />
                      <div></div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* report card */}
              {data?.name?.toLowerCase() === "report card" ? (
                <>
                  {/* publish */}
                  <div className="grid grid-cols-10 md:grid-cols-12">
                    <p className="col-span-2 p-2 capitalize">Publish</p>
                    <div className="col-span-8 grid grid-cols-3 p-2">
                      <div></div>
                      <ToggleButton
                        value={data?.publish}
                        onChangeFunction={(v) =>
                          onChangeFn(v, "publish", data?.id)
                        }
                      />
                      <div></div>
                    </div>
                  </div>
                  {/* review */}
                  <div className="grid grid-cols-10 md:grid-cols-12">
                    <p className="col-span-2 p-2 capitalize">Review</p>
                    <div className="col-span-8 grid grid-cols-3 p-2">
                      <div></div>
                      <ToggleButton
                        value={data?.review}
                        onChangeFunction={(v) =>
                          onChangeFn(v, "review", data?.id)
                        }
                      />
                      <div></div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* document_upload*/}
              {data?.name?.toLowerCase() === "level" ? (
                <>
                  {/* publish */}
                  <div className="grid grid-cols-10 md:grid-cols-12">
                    <p className="col-span-2 p-2 capitalize">Document Upload</p>
                    <div className="col-span-8 grid grid-cols-3 p-2">
                      <div></div>
                      <ToggleButton
                        value={data?.document_upload}
                        onChangeFunction={(v) =>
                          onChangeFn(v, "document_upload", data?.id)
                        }
                      />
                      <div></div>
                    </div>
                  </div>
                </>
              ) : null}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
