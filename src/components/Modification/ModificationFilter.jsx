import React, { useState } from "react";
import { CustomButton } from "Components/CustomButton";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { MkdInput } from "Components/MkdInput";
import { SectionTitle } from "Components/SectionTitle";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import TreeSDK from "Utils/TreeSDK";
import { SearchDropdown } from "Components/SearchDropdown";
import { handleSingleDropdownChange } from "Utils/utils";
import { StateCountySelect } from "Components/StateCountySelect";

const tdk = new TreeSDK();

const RaceFilterBox = ({
  onSubmitFn,
  title,
  setFilterConditions,
  getDataFn,
  prevRaceBox,
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState([]);
  const [selected_states, setSelected_states] = useState([]);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);

  const statusOption = [
    { label: "All", value: "" },
    { label: "Pending", value: 0 },
    { label: "Approved", value: 1 },
    { label: "Declined", value: 2 },
  ];

  const schema = yup.object({
    election_name: yup.string(),
    race_name: yup.string(),
    candidate_name: yup.string(),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleStatusChange = (value) => {
    try {
      if (!value.length) return;
      if (value?.length < 2) setSelectedStatus(value);
      else setSelectedStatus([value[value?.length - 1]]);
    } catch (error) {
      console.log("handleStatusChange", error?.message);
    }
  };
  const onSubmit = (data) => {
    try {
      /*
      where = modification fields
      where2 = election fields
      where3 =  party fields
      where4 =  current race fields
      where5 = wanted race fields
      */
      const where = {};
      const where2 = {};
      const where3 = {};
      const where4 = {};
      const where5 = {};
      if (
        (selectedStatus?.length && selectedStatus[0]?.value) ||
        selectedStatus[0]?.value === 0
      )
        where["approval_status"] = selectedStatus[0]?.value;

      if (data?.race_name) where4["name"] = data?.race_name;
      if (data?.candidate_name) where["candidate_name"] = data?.candidate_name;

      if (selected_county?.length) where2["county"] = selected_county[0]?.value;
      if (selected_states?.length) where2["state"] = selected_states[0]?.value;

      const filter = { where, where2, where3, where4, where5 };
      setFilterConditions(filter);
      getDataFn(1, 10, filter);
    } catch (error) {
      console.log("onSubmit->>", error?.message);
    }
  };

  const handleClearFilter = () => {
    try {
      reset();
      setSelectedStatus([]);
      getDataFn(1, 10, {});
      setFiltered_counties([]);
      setSelected_county([]);
      setSelected_states([]);
    } catch (error) {
      console.log("handleClearFilter->>", error?.message);
    }
  };

  return (
    <FilterBoxBg className={"mb-10"}>
      <form
        action=""
        style={{ fontFamily: "Inter, sans-serif" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <SectionTitle
          fontRoboto={true}
          text={"Search Requests"}
          className={"mb-5"}
        />
        <div className="grid grid-cols-1  gap-5 sm:grid-cols-2 md:grid-cols-3">
          {/* <MkdInput
            type={"text"}
            name={"election_name"}
            errors={errors}
            label={"Election Name"}
            placeholder={"Election Name"}
            register={register}
            className={""}
          /> */}
          <StateCountySelect
            selected_county={selected_county}
            selected_states={selected_states}
            setSelected_county={setSelected_county}
            setSelected_states={setSelected_states}
            stateErrorMessage={""}
            setStateErrorMessage={() => {}}
            countyErrorMessage={""}
            setCountyErrorMessage={() => {}}
            filtered_counties={filtered_counties}
            setFiltered_counties={setFiltered_counties}
            electionType={1}
          />
          <MkdInput
            type={"text"}
            name={"race_name"}
            errors={errors}
            label={"Race Name"}
            placeholder={"Race Name"}
            register={register}
            className={""}
          />

          <MkdInput
            type={"text"}
            name={"candidate_name"}
            errors={errors}
            label={"Candidate Name"}
            placeholder={"Candidate Name"}
            register={register}
            className={""}
          />

          <SearchDropdown
            options={statusOption}
            selected_states={selectedStatus}
            label={"Status"}
            lableFontLarge={false}
            className={"mb-4"}
            stateError={false}
            errorMessage={""}
            disableSearch={true}
            stateChangeFn={handleStatusChange}
          />
        </div>
        <CustomButton isForFilter={true} callBackFn={handleClearFilter} />
      </form>
    </FilterBoxBg>
  );
};

export default RaceFilterBox;
