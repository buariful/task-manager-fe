import { FilterBoxBg } from "Components/FilterBoxBg";
import React from "react";
import { SectionTitle } from "Components/SectionTitle";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { GlobalContext } from "Context/Global";
import { AuthContext } from "Context/Auth";
import { CustomButton } from "Components/CustomButton";
import { SearchDropdown } from "Components/SearchDropdown";
import { handleSingleDropdownChange } from "Utils/utils";

const CandidateFilterBox = ({
  className,
  title,
  searchFn,
  getData,
  setFilter,
  allParties,
  prevPetitions = false,
  //  --- if(prevPetitions=true) then no need
  selectedElectionId,
  allElections,
  setSelectedElectionId,
  sendBallotLoading,
  setIsModalOpen,
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
  const { state } = React.useContext(AuthContext);
  const [selectedParty, setSelectedParty] = React.useState([
    { label: "All", value: "" },
  ]);
  const [selectedReqOption, setSelectedReqOption] = React.useState([
    { label: "Done / No Requests", value: "" },
  ]);
  const [elections, setElections] = React.useState([]);
  const [selectedElection, setSelectedElection] = React.useState([]);

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
  React.useEffect(() => {
    if (allElections && !prevPetitions) {
      const election_mod = allElections?.map((el) => {
        return { label: el?.name, value: el?.id };
      });
      setElections(election_mod);
      setSelectedElection([election_mod[0]]);
      setSelectedElectionId(election_mod[0]?.value);
    }
  }, [allElections]);

  return (
    <FilterBoxBg className={className}>
      <form
        action=""
        onSubmit={handleSubmit(searchFn)}
        className="mb-8 "
        style={{ fontFamily: "Inter,sans-serif" }}
      >
        <SectionTitle className={"mb-3"} text={title} fontRoboto={true} />

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
        </div>

        <div className="grid grid-cols-1 gap-5 py-3 sm:grid-cols-2 md:grid-cols-3">
          <SearchDropdown
            options={reqOptions}
            selected_states={selectedReqOption}
            label={"Modification Request"}
            lableFontLarge={false}
            className={`!mb-0 ${
              prevPetitions || state?.official_type == 2 ? "hidden" : ""
            }`}
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
          callBackFn={async () => {
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
          }}
        />
      </form>

      {!prevPetitions && state?.official_type == 1 && (
        <>
          <SectionTitle
            className={"mb-3"}
            text={"Send The Ballot Sample"}
            fontRoboto={true}
          />

          <div className="grid grid-cols-1 gap-5 py-3 sm:grid-cols-2 md:grid-cols-3">
            {/* <div className="">
              <label
                className="mb-2 block text-sm font-[400]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Select Election
              </label>
              <select
                name=""
                className="focus:shadow-outline mb-3 w-full cursor-pointer  appearance-none bg-[#F5F5F5] px-4 py-2.5 text-sm  capitalize leading-tight"
                value={selectedElectionId}
                id=""
                onChange={(e) => {
                  setSelectedElectionId(e.target.value);
                }}
              >
                {allElections?.map((election) => (
                  <option
                    key={election?.id}
                    value={election?.id}
                    className="capitalize"
                  >
                    {election?.name}
                  </option>
                ))}
              </select>
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
            </div> */}

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

export default CandidateFilterBox;
