import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  isImage,
  empty,
  isVideo,
  isPdf,
  state_county_change,
  county_change,
  handleSingleDropdownChange,
} from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import TreeSDK from "Utils/TreeSDK";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SearchDropdown } from "Components/SearchDropdown";
import All_states from "../../../utils/states.json";
import All_counties from "../../../utils/counties.json";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AddUserPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      role: yup.string().required(),
      Email: yup.string().email().required(),
      Password: yup.string(),
      full_name: yup.string(),
      status: yup.string(),
      State: yup.string(),
      County: yup.string(),
      // Voters: yup.string() || "",
      // Access: yup.string(),
    })
    .required();

  const { dispatch } = React.useContext(AuthContext);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isStateOfficial, setIsStateOfficial] = React.useState(false);
  const [isOtherUser, setIsOtherUser] = React.useState(false);
  const [dataLoading, setDataLoading] = React.useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [selected_states, setSelected_states] = React.useState([]);
  const [stateError, setStateError] = React.useState(false);
  const [filtered_counties, setFiltered_counties] = React.useState([]);
  const [selected_county, setSelected_county] = React.useState([]);
  const [countyError, setCountyError] = React.useState(false);
  const [prevCounty, setPrevCounty] = React.useState("");
  const [prevState, setPrevState] = React.useState("");
  const [prevVotersNum, setPrevVotersNum] = React.useState(null);
  const [officialType, setOfficialType] = React.useState(null);
  const { id } = useParams();
  const [selectedStatus, setSelectedStatus] = React.useState([]);
  const [selectedRole, setSelectedRole] = React.useState([]);

  const statusOption = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  const roleOptions = [
    { label: "Election Official", value: 1 },
    { label: "State Official", value: 2 },
    { label: "Admin", value: 3 },
  ];

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRoleChange = (value) => {
    if (!value.length) return;
    let result = [];
    if (value?.length < 2) {
      result = value;
    } else {
      result = [value[value?.length - 1]];
    }

    if (result[0]?.value == 3) {
      setIsAdmin(true);
      setValue("role", "admin");
    } else {
      setIsAdmin(false);
      setValue("role", "official");
    }

    if (result[0]?.value == 2) setIsStateOfficial(true);
    else setIsStateOfficial(false);
    setSelectedRole(result);
  };

  const setField_error = (field, message) => {
    setError(field, {
      type: "manual",
      message: message,
    });
  };
  const checkInputs = (_data) => {
    let isError = false;
    if (!isAdmin) {
      if (!_data?.full_name) {
        setField_error("full_name", "Name  is a required field");
        isError = true;
      }
      if (!selected_states[0]?.label || selected_states[0]?.label === null) {
        setStateError(true);
        isError = true;
      }
      if (!selected_county[0]?.label || selected_county[0]?.label === null) {
        setCountyError(true);
        isError = true;
      }
    }
    return !isError; //
  };

  const getVoters = async (_data) => {
    try {
      const userRole = _data?.role;
      if (isAdmin || userRole?.toLocaleLowerCase() != "official") return 0;

      const isSameCounty =
        selected_county[0]?.label?.toLowerCase() ===
        prevCounty?.toLocaleLowerCase();
      const isSameState =
        selected_states[0]?.label?.toLowerCase() ===
        prevState?.toLocaleLowerCase();
      const isSameOfficialType = _data?.role == officialType;
      const filter = [
        `state,eq,'${selected_states[0]?.label}'`,
        `official_type,eq,${isStateOfficial ? 2 : 1}`,
      ];

      if (isStateOfficial && (!isSameState || !isSameOfficialType)) {
        const result = await tdk.getList("profile", { filter });
        if (result?.list?.length) {
          return result?.list[0]?.registered_voters;
        } else {
          return 0;
        }
      } else if (
        !isStateOfficial &&
        (!isSameCounty || !isSameState || !isSameOfficialType)
      ) {
        const result = await tdk.getList("profile", {
          filter: [...filter, `county,eq,'${selected_county[0]?.label}'`],
        });
        if (result?.list?.length) {
          return result?.list[0]?.registered_voters;
        } else {
          return 0;
        }
      } else {
        return prevVotersNum;
      }
    } catch (error) {
      console.log("getVoters->>", error);
      // showToast(globalDispatch, error?.message, 4000, "error");
      // tokenExpireError(dispatch, error?.message);
      return 0;
    }
  };

  const onSubmit = async (_data) => {
    const areInputsOK = await checkInputs(_data);
    if (!areInputsOK) return;

    setIsSubmitLoading(true);
    try {
      if (_data?.Password?.length > 0) {
        const passUpdate = await sdk.updatePasswordByAdmin(_data?.Password, id);
        if (!passUpdate.error) {
          // showToast(globalDispatch, "Password updated");
        } else {
          tokenExpireError(dispatch, passUpdate?.error);
          showToast(
            globalDispatch,
            "Password can not be updated",
            4000,
            "error"
          );
          return;
        }
      }
      /* ------ update user --------- */
      let status = 1;
      if (_data?.role == "admin") {
        status = 1;
      } else {
        status = Number(_data?.status);
      }
      const userUpdate = await tdk.update("user", id, {
        status,
        first_name: _data?.full_name?.split(" ")[0],
        last_name: _data?.full_name?.split(" ")?.slice(1)?.join(" "),
        role: _data?.role,
      });
      /* ------ update profile --------- */
      if (!userUpdate.error) {
        const voters = await getVoters(_data);
        let profileData = {
          registered_voters: voters,
          county: selected_county[0]?.label,
          state: selected_states[0]?.label,
          user_role: _data?.role,
        };

        if (!isAdmin) profileData["official_type"] = selectedRole[0]?.value;
        else profileData["official_type"] = 0;

        sdk.setTable("profile");
        await sdk.callRestAPI(
          {
            set: profileData,
            where: { user_id: id },
          },
          "PUTWHERE"
        );
        setIsSubmitLoading(false);
        showToast(globalDispatch, "Profile updated");
        navigate("/admin/users");
      } else {
        tokenExpireError(dispatch, userUpdate?.error);
        showToast(globalDispatch, "Can not be updated", 4000, "error");
      }
    } catch (error) {
      console.log(error);
      setIsSubmitLoading(false);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error.message);
    }
    setIsSubmitLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "users",
      },
    });

    (async function () {
      setDataLoading(true);
      try {
        const result = await tdk.getOne("user", id, { join: "profile" });

        if (!result.error) {
          const voters = result?.model?.profile[0]?.registered_voters || 0;
          const fullName = `${result?.model?.first_name} ${result?.model?.last_name}`;
          const selectedState = [
            {
              label: result?.model?.profile[0]?.state,
              value: result?.model?.profile[0]?.state,
            },
          ];
          const selectedCounty = [
            {
              label: result?.model?.profile[0]?.county,
              value: result?.model?.profile[0]?.county,
            },
          ];
          const filteredCounties = await All_counties?.filter(
            (county) =>
              county?.state?.toLowerCase() ===
              result?.model?.profile[0]?.state?.toLowerCase()
          );
          let role = 0;
          switch (result?.model?.role?.toLowerCase()) {
            case "admin":
              role = 3;
              setIsAdmin(true);
              setValue("role", "admin");
              setSelectedRole([roleOptions[2]]);
              break;
            case "official":
              setValue("role", "official");
              role = result?.model?.profile[0]?.official_type;
              if (result?.model?.profile[0]?.official_type == 2) {
                setIsStateOfficial(true);
                setSelectedRole([roleOptions[1]]);
              } else {
                setSelectedRole([roleOptions[0]]);
              }
              break;
            default:
              setValue("role", result?.model?.role);
              setIsOtherUser(true);
              role = 0;
              break;
          }

          setValue("Email", result?.model?.email);
          setValue("full_name", fullName);
          setValue("status", result?.model?.status);
          setSelectedStatus(
            statusOption.filter((opt) => opt.value == result?.model?.status)
          );
          setSelected_states(selectedState);
          setSelected_county(selectedCounty);
          setFiltered_counties(filteredCounties);
          setPrevVotersNum(voters);
          setPrevCounty(result?.model?.profile[0]?.county);
          setPrevState(result?.model?.profile[0]?.state);
          setOfficialType(result?.model?.profile[0]?.official_type);
        }
      } catch (error) {
        tokenExpireError(dispatch, error?.message || "Token expired");
      }
      setDataLoading(false);
    })();
  }, []);

  return (
    <div className="p-10">
      <FilterBoxBg>
        <h4 className="mb-5 text-2xl font-medium">Edit User</h4>
        {dataLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <form
              className=" w-full max-w-lg"
              onSubmit={handleSubmit(onSubmit)}
            >
              <SearchDropdown
                options={roleOptions}
                disabled={isOtherUser}
                selected_states={selectedRole}
                label={"Role"}
                lableFontLarge={false}
                className={`mb-4 `}
                stateError={false}
                errorMessage={""}
                disableSearch={true}
                stateChangeFn={handleRoleChange}
              />

              <MkdInput
                type={"text"}
                page={"user"}
                name={"Email"}
                errors={errors}
                label={"Email"}
                // placeholder={"Email"}
                register={register}
                className={"cursor-not-allowed"}
                disabled={true}
              />

              <div className={`${isAdmin ? "hidden" : ""}`}>
                <MkdInput
                  type={"text"}
                  page={"user"}
                  name={"full_name"}
                  errors={errors}
                  label={"Name"}
                  // placeholder={"First Name"}
                  register={register}
                />

                <SearchDropdown
                  options={All_states}
                  selected_states={selected_states}
                  label={"State"}
                  className={"mb-4"}
                  stateError={stateError}
                  errorMessage={"State is a required field"}
                  stateChangeFn={(value) => {
                    setStateError(false);
                    state_county_change(
                      value,
                      setSelected_states,
                      setFiltered_counties,
                      setSelected_county
                    );
                  }}
                />
                <SearchDropdown
                  options={filtered_counties}
                  selected_states={selected_county}
                  label={"County"}
                  disabled={filtered_counties?.length < 1}
                  stateChangeFn={(value) => {
                    setCountyError(false);
                    county_change(value, setSelected_county);
                  }}
                  stateError={countyError}
                  errorMessage={"County is a required field"}
                  className={`mb-4 ${isStateOfficial ? "hidden" : ""}`}
                />

                <SearchDropdown
                  options={statusOption}
                  selected_states={selectedStatus}
                  label={"Status"}
                  lableFontLarge={false}
                  className={`mb-4 `}
                  stateError={false}
                  errorMessage={""}
                  disableSearch={true}
                  stateChangeFn={(value) => {
                    handleSingleDropdownChange(
                      value,
                      setSelectedStatus,
                      setValue,
                      "status"
                    );
                  }}
                />
              </div>
              <MkdInput
                type={"password"}
                page={"user"}
                name={"Password"}
                errors={errors}
                label={"Password"}
                placeholder={"*********"}
                register={register}
                className={""}
              />
              <InteractiveButton
                type="submit"
                loading={isSubmitLoading}
                disabled={isSubmitLoading || isOtherUser}
                className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91] disabled:cursor-not-allowed "
              >
                Submit
              </InteractiveButton>
            </form>
          </>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default AddUserPage;
