import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import "react-quill/dist/quill.snow.css";
import { handleSingleDropdownChange } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import { SectionTitle } from "Components/SectionTitle";
import { FilterBoxBg } from "Components/FilterBoxBg";
import TreeSDK from "Utils/TreeSDK";
import { SearchDropdown } from "Components/SearchDropdown";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminEditElectionPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [elPrevInfo, setElPrevInfo] = React.useState({});
  const [id, setId] = useState(0);
  const [selectedTempOption, setSelectedTempOption] = useState([]);
  const [selectedStatusOption, setSelectedStatusOption] = useState([]);
  const navigate = useNavigate();
  const params = useParams();

  const templateOptions = [
    { label: "Yes", value: 1 },
    { label: "No", value: 0 },
  ];
  const statusOptions = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  const schema = yup
    .object({
      Name: yup.string().required(),
      Date: yup.string().required(),
      is_template: yup.string().required(),
      status: yup.string().required(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleDropdownChange = (value, setState, name) => {
    try {
      handleSingleDropdownChange(value, setState, setValue, name);
    } catch (error) {
      console.log("handleDropdownChange->>", error);
    }
  };

  const onSubmit = async (_data) => {
    setIsLoading(true);
    try {
      sdk.setTable("elections");
      const result = await sdk.callRestAPI(
        {
          id: id,
          name: _data.Name,
          election_date: _data.Date,
          is_template: Number(_data.is_template),
          status: Number(_data.status),
        },
        "PUT"
      );

      if (!result.error) {
        if (Number(_data.status) != elPrevInfo.status) {
          sdk.setTable("races");
          await sdk.callRestAPI(
            {
              set: { status: _data.status },
              where: { election_id: id },
            },
            "PUTWHERE"
          );

          sdk.setTable("petition");
          await sdk.callRestAPI(
            {
              set: { status: _data.status },
              where: { election_id: id },
            },
            "PUTWHERE"
          );
        }

        showToast(globalDispatch, "Election updated");
        navigate("/admin/election");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error", error);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
  };

  async function getData() {
    try {
      setLoading(true);

      sdk.setTable("elections");
      const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
      if (!result.error) {
        setValue("Name", result.model.name);
        setValue("Date", result.model.election_date);
        setValue("is_template", result.model.is_template);
        setValue("status", result.model.status);
        setElPrevInfo(result.model);
        setId(result.model.id);
        setLoading(false);
        setSelectedStatusOption(
          statusOptions?.filter((op) => op.value == result.model.status)
        );
        setSelectedTempOption(
          templateOptions?.filter((op) => op.value == result.model.is_template)
        );
      }
    } catch (error) {
      setLoading(false);

      console.log("error", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "election",
      },
    });

    getData();
  }, []);

  return (
    <div className=" mx-auto rounded  p-5 sm:p-10 ">
      <FilterBoxBg>
        <SectionTitle className={"mb-8"} text={"Edit Elections"} />
        {loading ? (
          <SkeletonLoader />
        ) : (
          <form
            style={{ fontFamily: "Inter, sans-serif" }}
            className=" w-full max-w-md"
            onSubmit={handleSubmit(onSubmit)}
          >
            <MkdInput
              type={"text"}
              page={"edit"}
              name={"Name"}
              errors={errors}
              label={"Name"}
              placeholder={"Name"}
              register={register}
              className={""}
            />

            <MkdInput
              type={"date"}
              page={"edit"}
              name={"Date"}
              errors={errors}
              label={"Election Date"}
              placeholder={"Election Date"}
              register={register}
              className={""}
            />

            <SearchDropdown
              options={templateOptions}
              selected_states={selectedTempOption}
              label={"Is Template"}
              lableFontLarge={false}
              className={`mb-4 `}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={(value) => {
                handleDropdownChange(
                  value,
                  setSelectedTempOption,
                  "is_template"
                );
              }}
            />
            <SearchDropdown
              options={statusOptions}
              selected_states={selectedStatusOption}
              label={"Status"}
              lableFontLarge={false}
              className={`mb-4 `}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={(value) => {
                handleDropdownChange(value, setSelectedStatusOption, "status");
              }}
            />

            <InteractiveButton
              type="submit"
              className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
              loading={isLoading}
              disable={isLoading}
            >
              Submit
            </InteractiveButton>
          </form>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default AdminEditElectionPage;
