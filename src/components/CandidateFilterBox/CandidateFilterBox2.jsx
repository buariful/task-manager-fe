import { FilterBoxBg } from "Components/FilterBoxBg";
import React, { useCallback, useState } from "react";
import { SectionTitle } from "Components/SectionTitle";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { GlobalContext, showToast } from "Context/Global";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { CustomButton } from "Components/CustomButton";
import { SearchDropdown } from "Components/SearchDropdown";
import { handleSingleDropdownChange } from "Utils/utils";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";
import TreeSDK from "Utils/TreeSDK";
import { StateCountySelect } from "Components/StateCountySelect";
import MkdSDK from "Utils/MkdSDK";
import { AiOutlineConsoleSql } from "react-icons/ai";

const tdk = new TreeSDK();
const sdk = new MkdSDK();

const AdminCandidateFilterBox = ({
  className,
  title,
  getData,
  setFilter,
  prevPetitions = false,
  selectedElectionId,
  setSelectedElectionId,
  sendBallotLoading,
  setIsModalOpen,
  // activeElectionId,
  elections = [],
  setElections = () => {},
  setActiveElectionId = () => {},
  selected_county,
  setSelected_county,
  selected_states,
  setSelected_states,
  pageSize,
  selectedElection,
  setSelectedElection,
}) => {
  const schema = yup.object({
    race_name: yup.string(),
    candidate_name: yup.string(),
    party: yup.string(),
    modification_req: yup.string(),
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
  const { dispatch } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [allParties, setAllParties] = React.useState([]);
  // const [elections, setElections] = React.useState([]);
  // const [selectedElection, setSelectedElection] = React.useState([]);

  // const [selected_states, setSelected_states] = useState([]);

  const [filtered_counties, setFiltered_counties] = useState([]);
  // const [selected_county, setSelected_county] = useState([]);

  const [electionType, setElectionType] = useState([]);

  const [selectedParty, setSelectedParty] = React.useState([
    { label: "All", value: "" },
  ]);
  const [selectedReqOption, setSelectedReqOption] = React.useState([
    { label: "Done / No Requests", value: "" },
  ]);

  const reqOptions = [
    { label: "Done / No Requests", value: "" },
    { label: "Pending", value: 0 },
  ];

  const handleDropdownChange = (value, setState, name) => {
    try {
      handleSingleDropdownChange(value, setState, setValue, name);
    } catch (error) {
      console.log("handleDropdownChange->>", error);
    }
  };

  const handleElectionChange = (value) => {
    try {
      if (value?.length < 2) {
        setSelectedElectionId(value[0]?.value);
      } else {
        setSelectedElectionId(value[value?.length - 1]?.value);
      }
    } catch (error) {}
  };

  const candidateSearch = (data) => {
    let filter = {
      where: {},
      where2: {},
      where3: {},
      where4: {},
      where5: {},
    };
    const type = electionType?.[0]?.value;
    if (data?.race_name) {
      filter.where4["name"] = data?.race_name;
    }
    if (electionType.length) {
      filter.where4["election_type"] = type;
    }

    if (data?.candidate_name) {
      filter.where["candidate_name"] = data?.candidate_name;
    }

    if (data?.party) {
      filter.where5["name"] = data?.party;
    }

    if (data?.modification_req) {
      filter.where3["status"] = Number(data?.modification_req);
    }

    if (selected_states?.length) {
      filter.where4["state"] = selected_states?.[0]?.value;
    }

    if (Number(type) === 2) {
      where2["election_type"] = 2;
    }
    if (Number(type) === 1) {
      filter.where["is_federal"] = 0;
    }
    if (selected_county?.length) {
      filter.where4["county"] = selected_county[0]?.value;
    }

    setFilter(filter);
    getData(1, pageSize, filter, electionType?.[0]?.value);
  };

  const handleResetSearch = () => {
    try {
      reset();
      getData(1, 10);
      setSelectedParty([{ label: "All", value: "" }]);
      setSelectedReqOption([{ label: "Done / No Requests", value: "" }]);
      setFilter({
        where: {},
        where2: {},
        where3: {},
        where4: {},
        where5: {},
      });

      setElectionType([]);
      setSelected_states([]);
      setSelected_county([]);
    } catch (error) {
      console.log("handleResetSearch->>", error);
    }
  };

  const getDataOfSelectedArea = useCallback(async () => {
    try {
      setElections([]);
      setSelectedElection([]);

      const ifAllSelected = selected_states?.length && selected_county?.length;
      let elections = [];
      const state = selected_states?.[0]?.value;
      const county = selected_county?.[0]?.value;

      if (ifAllSelected) {
        const filter = [
          "election_type,eq,1",
          `state,eq,'${state}'`,
          `county,eq,'${county}'`,
          `status,eq,${prevPetitions ? 0 : 1}`,
        ];

        const [electionRes] = await Promise.all([
          // tdk.getList("elections", {
          //   filter: [...filter],
          // }),
          sdk.getElectionList(state, county),
        ]);

        elections = electionRes;
      }

      // storing data in the states
      const result_mod =
        elections?.list?.map((election) => ({
          ...election,
          label: election?.name,
          value: election?.id,
        })) || [];

      const getActiveCountyElectionId = result_mod.filter(
        (item) => item?.election_type === 1
      )[0]?.id;

      setElections(result_mod);
      setActiveElectionId(getActiveCountyElectionId);
    } catch (error) {
      console.log("getDataOfSelectedArea ->>", error);
    }
  }, [selected_states, selected_county]);

  React.useEffect(() => {
    getDataOfSelectedArea();
  }, [selected_states, selected_county]);

  const getParties = async () => {
    try {
      const parties = await tdk.getList("parties");
      const party_mod =
        parties?.list?.map((pre) => ({
          ...pre,
          label: pre?.name,
          value: pre?.id,
        })) || [];
      setAllParties(party_mod);
    } catch (error) {
      console.log("getParties ->>", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
  };

  React.useEffect(() => {
    getParties();
  }, []);

  return (
    <FilterBoxBg className={className}>
      <form
        action=""
        onSubmit={handleSubmit(candidateSearch)}
        className="mb-8 "
        style={{ fontFamily: "Inter,sans-serif" }}
      >
        <SectionTitle className={"mb-3"} text={title} fontRoboto={true} />

        {/* Filter */}
        <div className=" grid grid-cols-1 gap-5 py-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="">
            <label
              className="mb-2 block text-sm font-[400]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Race Name
            </label>

            <input
              type="text"
              placeholder="Race Name"
              {...register("race_name")}
              className={`focus:shadow-outline w-full appearance-none border-none bg-[#F5F5F5] px-4 py-2.5 text-sm  leading-tight  focus:outline-none`}
            />
          </div>
          <div className="">
            <label
              className="mb-2 block text-sm font-[400]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Candidate Name
            </label>
            <input
              type="text"
              placeholder="Candidate Name"
              {...register("candidate_name")}
              className={`focus:shadow-outline w-full appearance-none  border-none bg-[#F5F5F5] px-4 py-2.5 text-sm leading-tight  focus:outline-none`}
            />
          </div>
          <SearchDropdown
            options={[
              { label: "All", value: "" },
              ...allParties?.map((party) => {
                return { label: party?.name, value: party?.name };
              }),
            ]}
            selected_states={selectedParty}
            label={"Party"}
            lableFontLarge={false}
            className={"!mb-0"}
            stateError={false}
            errorMessage={""}
            disableSearch={true}
            stateChangeFn={(value) =>
              handleDropdownChange(value, setSelectedParty, "party")
            }
          />
          <SearchDropdown
            options={reqOptions}
            selected_states={selectedReqOption}
            label={"Modification Request"}
            lableFontLarge={false}
            className={`!mb-0 `}
            stateError={false}
            errorMessage={""}
            disableSearch={true}
            stateChangeFn={(value) =>
              handleDropdownChange(
                value,
                setSelectedReqOption,
                "modification_req"
              )
            }
          />
        </div>

        <CustomButton
          isForFilter={true}
          className={"mt-2"}
          callBackFn={handleResetSearch}
        />
      </form>

      {/* ballot send */}
      {!prevPetitions && (
        <>
          <SectionTitle
            className={"mb-3"}
            text={"Send The Ballot Sample"}
            fontRoboto={true}
          />

          <div className="grid grid-cols-1 gap-5 py-3 sm:grid-cols-2 md:grid-cols-3">
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

            <div>
              <SearchDropdown
                options={elections}
                selected_states={selectedElection}
                label={"Select Election"}
                lableFontLarge={false}
                className={`mb-4 `}
                stateError={false}
                errorMessage={""}
                disableSearch={true}
                stateChangeFn={(value) => {
                  handleDropdownChange(
                    value,
                    setSelectedElection,
                    "electionID"
                  );
                  handleElectionChange(value);
                }}
              />
            </div>

            <div>
              <InteractiveButton
                className="rounded border border-[#29ABE2] bg-[#29ABE2] px-4 py-2 text-sm font-bold text-white hover:bg-[#299ee2] hover:text-white disabled:cursor-not-allowed"
                disabled={!selectedElectionId || sendBallotLoading}
                loading={sendBallotLoading}
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                Send Ballot
              </InteractiveButton>
            </div>
          </div>
        </>
      )}
    </FilterBoxBg>
  );
};

export default AdminCandidateFilterBox;
