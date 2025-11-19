import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { tokenExpireError, AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  isImage,
  empty,
  isVideo,
  isPdf,
  handleSingleDropdownChange,
  state_county_change,
  county_change,
} from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import Select from "react-select";
import TreeSDK from "Utils/TreeSDK";
import { MultiSelect } from "react-multi-select-component";
// import " ./officialAddElectione.css";
// import "../../Official/Add/officialAddElectione.css";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SearchDropdown } from "Components/SearchDropdown";
import { ElectionTypeSelect } from "Components/AdminElectionComponents";
import All_states from "../../../utils/states.json";

const AdminAddElectionPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      Name: yup.string(),
      Date: yup.string().required(),
      state: yup.string(),
      county: yup.string(),
      type: yup.string(),
    })
    .required();

  const { dispatch, state } = React.useContext(AuthContext);
  const [fileObj, setFileObj] = React.useState({});
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [isUsingTemplate, setIsUsingTemplate] = React.useState(false);
  const [addAsTemplate, setAddAsTemplate] = React.useState(false);
  const [electionTemplates, setElectioanTemplates] = React.useState([]);
  const [filteredElectionTemplates, setFilteredElectionTemplates] =
    React.useState([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState([]);
  const [templateError, setTemplateError] = React.useState(false);

  const [electionTypeErrorMessage, setElectionTypeErrorMessage] = useState("");
  const [electionType, setElectionType] = useState([]);
  const [selected_states, setSelected_states] = useState([]);
  const [stateErrorMessage, setStateErrorMessage] = useState(false);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);
  const [countyErrorMessage, setCountyErrorMessage] = useState(false);

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const handleChangeElection = (value) => {
    if (value?.length < 2) {
      setSelectedTemplate(value);
    } else {
      setSelectedTemplate([value[value?.length - 1]]);
    }
    setTemplateError(false);
  };

  const onSubmit = async (_data) => {
    let sdk = new MkdSDK();
    setIsSubmitLoading(true);
    try {
      const type = electionType[0]?.value;
      let data = {
        election_date: _data.Date,
        is_template: addAsTemplate ? 1 : 0,
        composite_ballot_status: 0,
        status: 1,
        state: selected_states[0]?.value,
        county:
          Number(type) === 1
            ? selected_county[0]?.value
            : filtered_counties[0]?.value,
        election_type: type,
      };

      if (isUsingTemplate) {
        if (selectedTemplate?.length < 1) {
          setTemplateError(true);
          setIsSubmitLoading(false);
          return;
        } else {
          data["name"] = selectedTemplate[0]?.name;
          data["races_id"] = selectedTemplate[0]?.races_id;
          data["template_id"] = selectedTemplate[0]?.id;
          data["state"] = selectedTemplate[0]?.state;
          data["county"] = selectedTemplate[0]?.county;
          data["election_type"] = selectedTemplate[0]?.election_type;
        }
      } else {
        const message = " is a required field.";
        let isError = false;

        if (!electionType.length) {
          setElectionTypeErrorMessage("Election type" + message);
          isError = true;
        }
        if (!selected_states.length) {
          setStateErrorMessage("State" + message);
          isError = true;
        }
        if (!selected_county.length && electionType[0]?.value === 1) {
          setCountyErrorMessage("County" + message);
          isError = true;
        }

        if (!_data.Name) {
          setError("Name", {
            type: "manual",
            message: "Name is a required field.",
          });
          isError = true;
        }

        if (isError) {
          setIsSubmitLoading(false);
          return;
        }

        data["name"] = _data.Name;
      }

      const result = await sdk.createElection(data, "POST");
      if (!result.error) {
        showToast(globalDispatch, "Election added successfully.");
        navigate("/admin/election");
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
      setIsSubmitLoading(false);
    } catch (error) {
      setIsSubmitLoading(false);
      console.log("Error", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
      setError("name", {
        type: "manual",
        message: error.message,
      });
    }
  };

  const handleElectionTypeChange = (value) => {
    try {
      setElectionTypeErrorMessage("");
      setCountyErrorMessage("");
      handleSingleDropdownChange(value, setElectionType, setValue, "type");

      let stateType = "";
      value?.length < 2
        ? (stateType = value[0]?.value)
        : (stateType = value[value?.length - 1]?.value);

      if (Number(stateType) === 2) {
        setValue("county", "");
        setSelected_county([]);
      }
    } catch (error) {
      console.log("handleElectionTypeChange->>", error?.message);
    }
  };

  const handleStateChange = (value) => {
    try {
      setStateErrorMessage("");
      setCountyErrorMessage("");
      state_county_change(
        value,
        setSelected_states,
        setFiltered_counties,
        setSelected_county,
        electionType
      );
      handleSingleDropdownChange(value, setSelected_states, setValue, "state");
    } catch (error) {
      console.log("handleStateChange", error?.message);
    }
  };
  const handleCountyChange = (value) => {
    try {
      setCountyErrorMessage("");
      county_change(value, setSelected_county);
      handleSingleDropdownChange(value, setSelected_county, setValue, "county");
    } catch (error) {
      console.log("handleStateChange", error?.message);
    }
  };

  const handleSelectTemplate = (e) => {
    try {
      setIsUsingTemplate(e.target.checked);
      setSelectedTemplate([]);
      if (e.target.checked) {
        setAddAsTemplate(false);
      }
      setElectionType([]);
      setSelected_county([]);
      setSelected_states([]);
    } catch (error) {
      console.log("handleSelectTemplate", error?.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "election",
      },
    });

    (async function () {
      try {
        const filter = ["is_template,eq,1"];

        if (Number(state?.official_type) === 1) {
          filter.push(`county,eq,'${state?.county}'`);
        }

        const result = await new TreeSDK().getList("elections", {
          filter,
        });

        const result_mod = result?.list?.map((res) => {
          return { ...res, label: res?.name, value: res?.name };
        });
        setElectioanTemplates(result_mod);
      } catch (error) {
        tokenExpireError(dispatch, "Token expired");
      }
    })();
  }, []);

  return (
    <div className=" mx-auto min-h-screen rounded p-5 shadow-md sm:p-10">
      <FilterBoxBg>
        <h4
          className="mb-8 text-xl font-medium"
          style={{ fontFamily: "Roboto, sans-serif " }}
        >
          Create Elections
        </h4>
        <form
          style={{ fontFamily: "Inter, sans-serif" }}
          className=" w-full max-w-2xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {!isUsingTemplate ? (
              <>
                <ElectionTypeSelect
                  errorMessage={electionTypeErrorMessage}
                  selectedValue={electionType}
                  electionTypeChangeFn={handleElectionTypeChange}
                />

                <SearchDropdown
                  options={All_states}
                  selected_states={selected_states}
                  label={"State"}
                  lableFontLarge={false}
                  className={"mb-4"}
                  stateError={stateErrorMessage}
                  errorMessage={stateErrorMessage}
                  stateChangeFn={handleStateChange}
                />
                <SearchDropdown
                  options={filtered_counties}
                  selected_states={selected_county}
                  label={"County"}
                  lableFontLarge={false}
                  disabled={filtered_counties?.length < 1}
                  stateChangeFn={handleCountyChange}
                  stateError={countyErrorMessage}
                  errorMessage={countyErrorMessage}
                  className={`mb-8 ${
                    Number(electionType[0]?.value) == 2 ? "hidden" : ""
                  }`}
                />
              </>
            ) : null}

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="block  text-sm font-[400]">
                  Election Name
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    onChange={handleSelectTemplate}
                    id="useTemp"
                    className="cursor-pointer text-purple-600 focus:ring-0"
                  />
                  <label
                    htmlFor="useTemp"
                    className="block  cursor-pointer text-sm font-[400]"
                  >
                    Use Template
                  </label>
                </div>
              </div>

              {isUsingTemplate ? (
                <>
                  <MultiSelect
                    options={electionTemplates}
                    value={selectedTemplate}
                    onChange={(value) => handleChangeElection(value)}
                    closeOnChangedValue={true}
                    hasSelectAll={false}
                    labelledBy="Select..."
                    className={`multiSelect_customStyle singleSelect ${
                      templateError && "error"
                    }`}
                  />

                  {templateError && (
                    <p className="text-field-error italic text-red-500">
                      Please select a template.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    {...register("Name")}
                    className={`active: focus:shadow-outline w-full resize-none appearance-none rounded border  bg-[#f5f5f5] px-2.5  py-2.5 text-sm leading-tight  outline-none focus:outline-none ${
                      errors?.Name?.message
                        ? "border-red-500"
                        : "border-transparent"
                    }`}
                  />
                  <p className="text-field-error italic text-red-500">
                    {errors?.Name?.message}
                  </p>
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block  text-sm font-[400]">
                Election Date
              </label>
              <input
                type={"date"}
                id={"startDate"}
                name={"startDate"}
                min={getCurrentDate()}
                {...register("Date")}
                className={`focus:shadow-outline box-shadow w-full resize-none appearance-none rounded border bg-[#f5f5f5] p-2  px-4 py-2.5 text-sm  leading-tight outline-none focus:outline-none ${
                  errors?.Date?.message
                    ? "border-red-500"
                    : "border-transparent"
                } `}
              />
              <p className="text-field-error italic text-red-500">
                {errors?.Date?.message}
              </p>
            </div>
          </div>

          {!isUsingTemplate ? (
            <div className="mb-6 flex items-center gap-1">
              <input
                type="checkbox"
                checked={addAsTemplate}
                onChange={(e) => setAddAsTemplate(e.target.checked)}
                className="cursor-pointer text-purple-600 focus:ring-0"
                id="addAsTemp"
              />
              <label
                htmlFor="addAsTemp"
                className="block  cursor-pointer text-sm font-[400]"
              >
                Add As Template
              </label>
            </div>
          ) : null}

          <InteractiveButton
            type="submit"
            loading={isSubmitLoading}
            disabled={isSubmitLoading}
            className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
          >
            Submit
          </InteractiveButton>
        </form>
      </FilterBoxBg>
    </div>
  );
};

export default AdminAddElectionPage;
