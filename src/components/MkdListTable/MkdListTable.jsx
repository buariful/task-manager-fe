import React from "react";
import ModalPrompt from "Components/Modal/ModalPrompt";
import { useNavigate } from "react-router-dom";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { capitalize } from "Utils/utils";
import { Spinner } from "Assets/svgs";
import { colors } from "Utils/config";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { LuEye, LuPencilLine, LuTrash } from "react-icons/lu";
import { ToggleButton } from "Components/ToggleButton";
import { Loader } from "Components/Loader";
import MoonLoader from "react-spinners/MoonLoader";
import { Link } from "react-router-dom";

const SortingIcon = ({ isOrderDesc }) => {
  return (
    <span className="flex flex-col items-center justify-center">
      <FaSortUp
        className={`${isOrderDesc ? "text-accent" : "text-neutral-gray"}`}
      />
      <FaSortDown
        className={`${!isOrderDesc ? "text-accent" : "text-neutral-gray"}`}
      />
    </span>
  );
};

const MkdListTable = ({
  table,
  onSort,
  loading,
  columns,
  actions,
  tableRole,
  deleteItem,
  deleteLoading,
  actionId = "id",
  deletingNameAccessor,
  showDeleteModal,
  currentTableData,
  setShowDeleteModal,
  handleTableCellChange,
  toggleBtnOnchangeFn,
  handleEditFunction,
  handleViewFunction,
  // checkbox
  handleItemSelect = () => {},
  selectedItems = [],
  setSelectedItems = () => {},
}) => {
  const [deleteId, setIdToDelete] = React.useState(null);
  const [deleteItemName, setDeleteItemName] = React.useState(null);

  const [areAllRowsSelected, setAreAllRowsSelected] = React.useState(false);
  // const [selectedIds, setSelectedIds] = React.useState([]);
  const [toggleId, setToggleId] = React.useState(null);
  const [primaryColor, setPrimaryColor] = React.useState("red");

  // function handleSelectRow(id) {
  //   setIsOneOrMoreRowSelected(true);
  //   setSelectedIds((prevSelectedIds) => {
  //     if (prevSelectedIds.includes(id)) {
  //       return prevSelectedIds.filter((selectedId) => selectedId !== id);
  //     } else {
  //       return [...prevSelectedIds, id];
  //     }
  //   });
  // }
  function handleSelectRow(row) {
    try {
      const id = row[actionId];
      let items = [];
      const findItem = selectedItems?.find((item) => item[actionId] === id);

      if (findItem?.[actionId]) {
        items = selectedItems?.filter((si) => si[actionId] !== id);
      } else {
        items = [...selectedItems, row];
      }
      setSelectedItems(items);
    } catch (error) {
      console.log("handleSelectRow->>", error?.message);
    }

    // handleItemSelect(items);
    // const id = row[actionId];
    // let items = [];

    // if (selectedIds?.includes(id)) {
    //   items = selectedIds?.filter((selectedId) => selectedId !== id);
    // } else {
    //   items = [...selectedIds, id];
    // }
    // setSelectedIds(items?.map((i)=>i[actionId]));
    // handleItemSelect(items);
  }

  const handleToggle = async (value, id) => {
    setToggleId(id);
    try {
      await toggleBtnOnchangeFn(value, id);
    } catch (error) {
      console.log("handleToggle->>", error?.value);
    }
    setToggleId(null);
  };

  const handleSelectAll = () => {
    setAreAllRowsSelected((prevSelectAll) => !prevSelectAll);
    if (!areAllRowsSelected) {
      // const allIds = currentTableData.map((item) => item[actionId]);
      setSelectedItems(currentTableData);
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteAll = async (id) => {
    setShowDeleteModal(true);
    setIdToDelete(id);
  };

  const navigate = useNavigate();

  const setDeleteId = async (id, name) => {
    setShowDeleteModal(true);
    setIdToDelete(id);
    if (name) {
      setDeleteItemName(name);
    } else {
      setDeleteItemName(null);
    }
  };

  React.useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const color = rootStyle.getPropertyValue("--color-primary").trim();
    if (color) setPrimaryColor(color);
  }, []);

  React.useEffect(() => {
    if (selectedItems.length <= 0) {
      setAreAllRowsSelected(false);
    }
    if (selectedItems.length === currentTableData.length) {
      setAreAllRowsSelected(true);
    }
    if (
      selectedItems.length < currentTableData.length &&
      selectedItems.length > 0
    ) {
      setAreAllRowsSelected(false);
    }
  }, [selectedItems, currentTableData]);

  return (
    <>
      {/* {loading ? (
        <div
          className={`flex max-h-fit min-h-fit min-w-fit max-w-full items-center justify-center  py-5`}
        >
          <Spinner size={50} color={colors.primary} />
        </div>
      ) : } */}

      {!loading && currentTableData?.length < 1 ? (
        <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <span className="font-medium">No {table} found</span>
        </p>
      ) : (
        <div
          className={`${
            loading ? "" : "overflow-x-auto"
          } border-b border-[#0000001A] shadow`}
        >
          <table
            style={{ fontFamily: "Roboto, sans-serif" }}
            className="min-w-full bg-white  divide-y text-accent divide-[#0000001A] "
          >
            <thead className=" bg-light-info text-sm font-medium">
              <tr className="">
                {columns.map((column, i) => {
                  if (column?.accessor === "") {
                    if (
                      [
                        // actions?.select,
                        actions?.view,
                        actions?.edit,
                        actions?.delete,
                      ].includes(true)
                    ) {
                      return (
                        <th
                          key={i}
                          scope="col"
                          className={`px-6 py-4 text-left text-sm font-[600] uppercase tracking-wider  ${
                            column.isSorted ? "cursor-pointer" : ""
                          } `}
                          onClick={
                            column.isSorted ? () => onSort(i) : undefined
                          }
                        >
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " ▼"
                                : " ▲"
                              : ""}
                          </span>
                        </th>
                      );
                    }
                  } else if (column?.select) {
                    return (
                      <th
                        key={i}
                        scope="col"
                        className={`px-6 py-4 text-left text-sm font-[600] uppercase tracking-wider  `}
                      >
                        <span className=" flex justify-around items-center">
                          <input
                            type="checkbox"
                            id=""
                            className="text-primary focus:ring-primary"
                            checked={areAllRowsSelected}
                            onChange={handleSelectAll}
                          />
                        </span>
                      </th>
                    );
                  } else {
                    return (
                      <th
                        key={i}
                        scope="col"
                        className={` px-6 py-4 text-left text-sm font-medium  uppercase tracking-wider  ${
                          column.isSorted ? "cursor-pointer" : ""
                        } `}
                        onClick={
                          column.isSorted
                            ? () =>
                                onSort(
                                  column?.sortingKey,
                                  !column?.isSortedDesc,
                                  column?.accessor
                                )
                            : undefined
                        }
                      >
                        <span className="flex items-center gap-1">
                          {column.header === "Action" ? (
                            <input
                              type="checkbox"
                              id="select_all_rows"
                              className="mr-3"
                              checked={areAllRowsSelected}
                              onChange={handleSelectAll}
                            />
                          ) : null}
                          <span>{column.header}</span>
                          <span>
                            {/* {!column?.toggle_button ? <FaSort /> : null} */}
                            {!column?.toggle_button && column?.isSorted ? (
                              <SortingIcon isOrderDesc={column?.isSortedDesc} />
                            ) : null}
                          </span>
                        </span>
                      </th>
                    );
                  }
                  return null;
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#0000001A] ">
              {loading ? (
                <tr>
                  <td className="col" colSpan={columns?.length + 1}>
                    <div
                      className={`flex max-h-fit min-h-fit min-w-fit max-w-full items-center justify-center  py-5`}
                    >
                      <Spinner size={50} color={colors.primary} />
                    </div>
                  </td>
                </tr>
              ) : (
                currentTableData.map((row, i) => {
                  return (
                    <tr key={i} className="text-sm capitalize">
                      {columns.map((cell, index) => {
                        if (cell.accessor.indexOf("image") > -1) {
                          return (
                            <td
                              key={index}
                              className="whitespace-nowrap px-6 py-3"
                            >
                              <img
                                src={row[cell.accessor]}
                                className="h-auto w-[100px]"
                                alt=""
                              />
                            </td>
                          );
                        }
                        if (
                          cell.accessor.indexOf("pdf") > -1 ||
                          cell.accessor.indexOf("doc") > -1 ||
                          cell.accessor.indexOf("file") > -1 ||
                          cell.accessor.indexOf("video") > -1
                        ) {
                          return (
                            <td
                              key={index}
                              className="whitespace-nowrap px-6 py-3"
                            >
                              <a
                                className="text-blue-500"
                                target="_blank"
                                href={row[cell.accessor]}
                                rel="noreferrer"
                              >
                                {" "}
                                View
                              </a>
                            </td>
                          );
                        }
                        if (cell.accessor === "") {
                          if (cell?.customLinkComponent) {
                            return (
                              <th
                                key={i}
                                scope="col"
                                className={`px-6 py-4 text-left text-sm font-[600] uppercase tracking-wider  `}
                              >
                                <Link
                                  className="text-normal hover:underline font-normal text-[0.85rem] capitalize text-nowrap"
                                  to={`${cell?.link}/${row[actionId]}`}
                                >
                                  {cell?.text}
                                </Link>
                              </th>
                            );
                          } else if (
                            [
                              // actions?.select,
                              actions?.view,
                              actions?.edit,
                              actions?.delete,
                            ].includes(true)
                          ) {
                            return (
                              <td
                                key={index}
                                className=" gap-2 whitespace-nowrap  px-6 py-3"
                              >
                                <span className=" flex justify-around items-center">
                                  {/* {actions?.select && (
                              <span>
                                <input
                                  type="checkbox"
                                  name="select_item"
                                  // checked={selectedIds.includes(
                                  //   row[actionId]
                                  // )}
                                  checked={selectedItems?.some(
                                    (item) =>
                                      item[actionId] === row[actionId]
                                  )}
                                  onChange={() =>
                                    // handleSelectRow(row[actionId])
                                    handleSelectRow(row)
                                  }
                                  className={
                                    "text-primary focus:ring-primary "
                                  }
                                />
                              </span>
                            )} */}
                                  {actions?.edit && (
                                    <button
                                      className="mr-2 cursor-pointer text-sm font-medium text-neutral hover:text-primary"
                                      onClick={() => {
                                        if (handleEditFunction) {
                                          handleEditFunction(row[actionId]);
                                        } else {
                                          navigate(
                                            `/${tableRole}/edit-${table}/` +
                                              row[actionId],
                                            {
                                              state: row,
                                            }
                                          );
                                        }
                                      }}
                                    >
                                      <LuPencilLine size={20} />
                                    </button>
                                  )}
                                  {actions?.view && (
                                    <button
                                      className="mr-2 cursor-pointer text-sm font-medium text-neutral hover:text-primary"
                                      onClick={() => {
                                        if (handleViewFunction) {
                                          handleViewFunction(row[actionId]);
                                        } else {
                                          navigate(
                                            `/${tableRole}/view-${table}/` +
                                              row[actionId],
                                            {
                                              state: row,
                                            }
                                          );
                                        }
                                      }}
                                    >
                                      <LuEye size={20} />
                                    </button>
                                  )}
                                  {actions?.delete && (
                                    <button
                                      className="cursor-pointer px-1 text-sm font-medium text-neutral hover:text-red-500 hover:underline"
                                      onClick={() =>
                                        setDeleteId(
                                          row[actionId],
                                          row[deletingNameAccessor]
                                        )
                                      }
                                    >
                                      <LuTrash size={20} />
                                    </button>
                                  )}
                                </span>
                              </td>
                            );
                          } else {
                            return null;
                          }
                        }

                        if (cell?.select) {
                          return (
                            <td
                              key={index}
                              className=" gap-2 whitespace-nowrap  px-6 py-3"
                            >
                              <span>
                                <input
                                  type="checkbox"
                                  name="select_item"
                                  // checked={selectedIds.includes(
                                  //   row[actionId]
                                  // )}
                                  checked={selectedItems?.some(
                                    (item) => item[actionId] === row[actionId]
                                  )}
                                  onChange={() =>
                                    // handleSelectRow(row[actionId])
                                    handleSelectRow(row)
                                  }
                                  className={"text-primary focus:ring-primary "}
                                />
                              </span>
                            </td>
                          );
                        }
                        if (cell.mappingExist) {
                          return (
                            <td
                              key={index}
                              className="whitespace-nowrap px-6 py-3"
                            >
                              <select
                                onChange={(e) =>
                                  handleTableCellChange(
                                    row[actionId],
                                    e.target.value,
                                    i,
                                    cell.accessor
                                  )
                                }
                              >
                                {Object.keys(cell.mappings).map(
                                  (cellDataKey, index) => (
                                    <option
                                      key={index}
                                      value={cellDataKey}
                                      selected={
                                        cellDataKey === row[cell.accessor]
                                      }
                                    >
                                      {cell.mappings[cellDataKey]}
                                    </option>
                                  )
                                )}
                              </select>
                              {/* {cell.mappings[row[cell.accessor]]} */}
                            </td>
                          );
                        }
                        if (cell.toggle_button) {
                          return (
                            <td
                              key={index}
                              className="whitespace-nowrap px-6 py-3"
                            >
                              {toggleId === row[actionId] ? (
                                <MoonLoader
                                  color={primaryColor}
                                  loading={true}
                                  size={20}
                                />
                              ) : (
                                <ToggleButton
                                  value={row[cell?.accessor]}
                                  onChangeFunction={(v) => {
                                    handleToggle(v, row[actionId]);
                                  }}
                                />
                              )}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={index}
                            className="whitespace-nowrap px-6 py-3"
                          >
                            <span className="flex items-center gap-1">
                              {cell.showDot ? <GoDotFill /> : null}
                              <span>{row[cell.accessor]}</span>
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      {showDeleteModal ? (
        <ModalPrompt
          actionHandler={() => {
            deleteItem(deleteId);
          }}
          closeModalFunction={() => {
            setIdToDelete(null);
            setShowDeleteModal(false);
          }}
          title={`Delete ${capitalize(table)} `}
          message={`You are about to delete ${capitalize(table)}, ${
            deleteItemName ? capitalize(deleteItemName) : deleteId
          }. Note that this action is irreversible`}
          acceptText={`DELETE`}
          rejectText={`CANCEL`}
          loading={deleteLoading}
        />
      ) : null}
    </>
  );
};

export default MkdListTable;
