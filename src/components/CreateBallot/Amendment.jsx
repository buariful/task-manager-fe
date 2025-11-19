import React from "react";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { PlusCircleIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { TbOvalVertical } from "react-icons/tb";
import { TiPlus } from "react-icons/ti";
import ReactQuill from "react-quill";
/* 
allRaces = [{column1:[], column2: [], column3:[]}, {}, {}]
parent_index = 1
amendmentArray = [{title: "", summary:"", question:""}, {}, {}]
isEditing = Boolean
arrayName = "column1"/"column2"/"column3"
*/

const Amendment = ({
  amendment,
  isEditing,
  parent_index,
  col_name,
  col_index,
  allRaces,
  setAllRaces,
}) => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);

  const editAmandentSummary = (value) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0)
    )
      return;
    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name][col_index].amendment.summary =
        value;
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("editAmandentSummary", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const addOption = () => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0)
    )
      return;
    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name][col_index].amendment.options = [
        ...copy_allRaces[parent_index][col_name][col_index].amendment.options,
        "",
      ];
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("editOption", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const editOption = (opt_index, value) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0)
    )
      return;
    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name][col_index].amendment.options[
        opt_index
      ] = value;
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("editOption", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  const removeOption = (opt_index) => {
    if (
      (!parent_index && parent_index !== 0) ||
      !col_name ||
      (!col_index && col_index !== 0)
    )
      return;
    let copy_allRaces = [...allRaces];
    try {
      copy_allRaces[parent_index][col_name][col_index].amendment.options.splice(
        opt_index,
        1
      );
      setAllRaces(copy_allRaces);
    } catch (error) {
      console.log("editOption", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  return (
    <>
      <div className="break-words border-t border-t-black px-5">
        <p className="mb-3 text-center text-base font-medium">
          {amendment?.title}
        </p>

        {isEditing ? (
          <>
            <p
              className="text-sm
                          font-semibold text-gray-700"
            >
              Summary
            </p>

            <ReactQuill
              onChange={(content) => editAmandentSummary(content)}
              className={`no_border hide_toolbar editor_border`}
              value={amendment?.summary}
              modules={{
                toolbar: [], // Empty array to hide the toolbar
              }}
            />
          </>
        ) : (
          <div
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: amendment?.summary }}
          />
        )}

        {isEditing ? (
          <div>
            <p
              className="text-sm
                          font-semibold text-gray-700"
            >
              Options
            </p>
            {amendment?.options?.map((opt, opt_index) => (
              <div
                className="relative mb-2"
                key={`${opt_index}_${amendment?.title}`}
              >
                <input
                  value={opt}
                  className="w-full rounded-[5px] border text-sm outline-none focus:border-[#8128c5] focus:ring-0"
                  placeholder="Option"
                  onChange={(e) => {
                    editOption(opt_index, e.target.value);
                  }}
                />
                <span
                  className="absolute -right-1 -top-1 z-30 grid h-3.5 w-3.5 cursor-pointer place-items-center rounded-full bg-red-400 text-white transition-all duration-300 hover:bg-red-500"
                  onClick={() => removeOption(opt_index)}
                >
                  <XMarkIcon className="w-3" strokeWidth={3} />
                </span>
              </div>
            ))}

            <p
              className={`ml-3 inline-block cursor-pointer ${
                isEditing ? "" : "hidden"
              }`}
              onClick={addOption}
            >
              <PlusCircleIcon className="w-8 text-blue-400 duration-300 hover:text-blue-500" />
            </p>
          </div>
        ) : (
          <>
            {amendment?.options?.map((opt, opt_index) => (
              <p
                key={`${opt_index}`}
                className="mb-1 flex items-center gap-2 text-sm"
              >
                <TbOvalVertical className="text-xl" /> <span>{opt}</span>
              </p>
            ))}
          </>
        )}
        {/* {amen?.question && (
              <>
                <p className="mb-1 flex items-center gap-2">
                  <TbOvalVertical className="text-2xl" /> <span>Yes</span>
                </p>
                <p className="mb-1 flex items-center gap-2">
                  <TbOvalVertical className="text-2xl" /> <span>No</span>
                </p>
              </>
            )} */}
      </div>
    </>
  );
};

export default Amendment;
