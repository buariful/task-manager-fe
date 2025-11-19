import React from "react";
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

const tdk = new TreeSDK();

const RaceFilterBox = ({
  onSubmitFn,
  title,
  setFilterConditions,
  getDataFn,
  prevRaceBox,
}) => {
  const schema = yup.object({
    name: yup.string(),
    party: yup.string(),
    electionID: yup.string(),
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

  const [allElections, setAllElections] = React.useState([]);
  const [selectedElection, setSelectedElection] = React.useState([]);

  const handleElChange = (value) => {
    try {
      handleSingleDropdownChange(
        value,
        setSelectedElection,
        setValue,
        "electionID"
      );
    } catch (error) {
      console.log("handleElChange->>", error);
    }
  };

  const getElections = async () => {
    try {
      const result = await tdk.getList("elections", {
        filter: [`status,eq,0`],
      });

      const list_mod = result?.list?.map((el) => {
        return {
          ...el,
          label: el?.name,
          value: el?.id,
        };
      });
      setAllElections(list_mod);
      // setValue("electionID", list_mod[0]?.id);
    } catch (error) {
      console.log("getElections->>", error);
    }
  };

  React.useEffect(() => {
    getElections();
  }, []);

  const navigate = useNavigate();
  return (
    <FilterBoxBg className={"mb-10"}>
      <form
        action=""
        style={{ fontFamily: "Inter, sans-serif" }}
        onSubmit={handleSubmit(onSubmitFn)}
      >
        <SectionTitle fontRoboto={true} text={title} className={"mb-5"} />
        <div className="grid grid-cols-1  gap-5 sm:grid-cols-2 md:grid-cols-3">
          <MkdInput
            type={"text"}
            name={"name"}
            errors={errors}
            label={"Race Name"}
            placeholder={"Race Name"}
            register={register}
            className={""}
          />

          <MkdInput
            type={"text"}
            name={"party"}
            errors={errors}
            label={"Party Name"}
            placeholder={"Party Name"}
            register={register}
            className={""}
          />
          {prevRaceBox ? (
            <SearchDropdown
              options={allElections}
              selected_states={selectedElection}
              label={"Election"}
              lableFontLarge={false}
              className={"mb-4"}
              stateError={false}
              errorMessage={""}
              disableSearch={true}
              stateChangeFn={handleElChange}
            />
          ) : null}
        </div>
        <CustomButton
          isForFilter={true}
          callBackFn={() => {
            reset();
            if (!prevRaceBox) {
              navigate("/official/races");
            }
            setSelectedElection([]);
            setFilterConditions([]);
            getDataFn(1, 10);
          }}
        />
      </form>
    </FilterBoxBg>
  );
};

export default RaceFilterBox;
