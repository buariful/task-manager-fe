import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  isImage,
  empty,
  isVideo,
  isPdf,
  replacePlaceholders,
  state_county_change,
  county_change,
  handleSingleDropdownChange,
} from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import TreeSDK from "Utils/TreeSDK";
import { Modal } from "Components/Modal/Modal";
import { EnvelopeIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { MultiSelect } from "react-multi-select-component";
import { SearchDropdown } from "Components/SearchDropdown";
import All_states from "../../../utils/states.json";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AddUserPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      role: yup.string().required(),
      Email: yup.string().email().required(),
      Password: yup.string().required(),
      full_name: yup.string(),
      status: yup.string(),
      // Voters: yup.string(),
      // Access: yup.string(),
    })
    .required();

  const { dispatch } = React.useContext(AuthContext);
  const [fileObj, setFileObj] = React.useState({});
  const [isStateOfficial, setIsStateOfficial] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [emailTxt, setEmailTxt] = React.useState("");
  const [officialMailTxt, setOfficialMailTxt] = React.useState("");
  const [successModal, setSuccessModal] = React.useState(false);
  const [selected_states, setSelected_states] = React.useState([]);
  const [stateError, setStateError] = React.useState(false);
  const [filtered_counties, setFiltered_counties] = React.useState([]);
  const [selected_county, setSelected_county] = React.useState([]);
  const [countyError, setCountyError] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState([
    { label: "Active", value: 1 },
  ]);
  const [selectedRole, setSelectedRole] = React.useState([
    { label: "Election Official", value: 1 },
  ]);

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
    setSelected_county([]);
    setSelected_states([]);
    setValue("full_name", "");
    setValue("status", 1);
  };

  const handleStateChange = async (value) => {
    try {
      setStateError(false);
      const counties = await state_county_change(
        value,
        setSelected_states,
        setFiltered_counties,
        setSelected_county
      );

      if (isStateOfficial) {
        setSelected_county([counties[0]]);
      }
    } catch (error) {
      console.log("error", error?.message);
    }
  };

  const setField_error = (field, message) => {
    setError(field, {
      type: "manual",
      message: message,
    });
  };

  const getVoters = async (_data) => {
    try {
      if (isAdmin) return 0;

      const filter = [
        `state,eq,'${selected_states[0]?.label}'`,
        `official_type,eq,${isStateOfficial ? 2 : 1}`,
      ];
      if (!isStateOfficial) {
        filter.push(`county,eq,'${selected_county[0]?.label}'`);
      }
      const result = await tdk.getList("profile", { filter });

      if (result?.list?.length) {
        return result?.list[0]?.registered_voters;
      } else {
        return 0;
      }
    } catch (error) {
      console.log("getVoters->>", error);
      // showToast(globalDispatch, error?.message, 4000, "error");
      // tokenExpireError(dispatch, error?.message);
      return 0;
    }
  };

  const onSubmit = async (_data) => {
    setIsSubmitLoading(true);
    try {
      const voters = await getVoters(_data);
      let email_txt;
      let payload = {
        verify: 1,
        status: 1,
      };
      if (!isAdmin) {
        let isError = false;
        if (!_data?.full_name) {
          setField_error("full_name", "Name  is a required field");
          isError = true;
        }
        if (!selected_states[0]?.label) {
          setStateError(true);
          isError = true;
        }
        if (!selected_county[0]?.label) {
          setCountyError(true);
          isError = true;
        }

        // if (!_data?.Voters && Number(_data?.Voters) === 0) {
        //   setField_error("Voters", "Voters is a required field");
        //   isError = true;
        // }
        if (isError) {
          setIsSubmitLoading(false);
          return;
        }

        email_txt = replacePlaceholders(officialMailTxt?.html, {
          name: _data?.full_name,
          // name: _data?.first_name,
          email: _data?.Email,
          password: _data?.Password,
          role: _data?.role,
          voters: voters,
          state: selected_states[0]?.label,
          county: isStateOfficial ? " " : selected_county[0]?.label,
          link: `${import.meta.env.VITE_SITE_URL}/official/login`,
        });
        payload["first_name"] = _data?.full_name?.split(" ")[0];
        payload["last_name"] = _data?.full_name?.split(" ")?.slice(1).join(" ");
        payload["status"] = _data?.status;
      } else {
        email_txt = replacePlaceholders(emailTxt?.html, {
          name: "Admin",
          email: _data?.Email,
          password: _data?.Password,
          role: _data?.role,
          link: `${import.meta.env.VITE_SITE_URL}/admin/login`,
        });
      }

      const result = await sdk.register(
        _data?.Email,
        _data?.Password,
        _data?.role
      );

      if (!result.error) {
        await tdk.update("user", result?.user_id, payload);
        let profileData = {
          county: selected_county[0]?.label,
          state: selected_states[0]?.value,
          user_role: _data?.role,
        };
        if (!isAdmin) {
          profileData["official_type"] = isStateOfficial ? 2 : 1;
          profileData["registered_voters"] = voters;
        }
        sdk.setTable("profile");
        await sdk.callRestAPI(
          {
            set: profileData,
            where: { user_id: result?.user_id },
          },
          "PUTWHERE"
        );

        await sdk.sendMail({
          email: _data?.Email,
          subject: "Account credentials",
          body: email_txt,
        });
        showToast(globalDispatch, "User added successfully.");
        setSuccessModal(true);
      } else {
      }
      setIsSubmitLoading(false);
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
    setValue("role", "official");
    (async function () {
      try {
        const email = await tdk.getOne("email", 9);
        const officialEmail = await tdk.getOne("email", 10);
        setEmailTxt(email?.model);
        setOfficialMailTxt(officialEmail?.model);
      } catch (error) {
        console.log(error?.message);
        tokenExpireError(dispatch, error?.message);
      }
    })();
  }, []);

  return (
    <div className="p-10">
      <FilterBoxBg>
        <h4 className="mb-5 text-2xl font-medium">Add User</h4>
        <form className=" w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
          <SearchDropdown
            options={roleOptions}
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
            placeholder={"Email"}
            register={register}
            className={""}
          />

          <div className={`${isAdmin ? "hidden" : ""}`}>
            <MkdInput
              type={"text"}
              page={"user"}
              name={"full_name"}
              errors={errors}
              label={"Name"}
              placeholder={"Name"}
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
                handleStateChange(value);
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
            placeholder={"**********"}
            register={register}
            className={""}
          />

          <InteractiveButton
            type="submit"
            loading={isSubmitLoading}
            disabled={isSubmitLoading}
            className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91] "
          >
            Submit
          </InteractiveButton>
        </form>
      </FilterBoxBg>
      <Modal
        // title={"Email Sent"}
        isOpen={successModal}
        // modalHeader={true}
        classes={{ modalDialog: "w-xl max-w-xl text-center relative" }}
      >
        <h3 className="mb-4">Email Sent</h3>
        <div className="flex justify-center">
          <EnvelopeIcon className="mb-4 w-12 text-green-600" />
        </div>
        <p>
          An email containing the account credentials has been sent to the user.
        </p>
        <span className="absolute right-4 top-4">
          <XMarkIcon
            className="w-5 cursor-pointer"
            onClick={() => {
              setSuccessModal(false);
              navigate("/admin/users");
            }}
          />
        </span>
      </Modal>
    </div>
  );
};

export default AddUserPage;
