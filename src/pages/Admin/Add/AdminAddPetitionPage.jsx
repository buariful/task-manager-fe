import React from "react";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { SearchDropdown } from "Components/SearchDropdown";
import { GlobalContext, showToast } from "Context/Global";
import MkdSDK from "Utils/MkdSDK";
import { CandidateFilterBox } from "Components/CandidateFilterBox";
import { CandidateTable } from "Components/CandidateTable";
import { InteractiveButton } from "Components/InteractiveButton";
import { PetitionFilterBox } from "Components/PetitionFilterBox";
import { useNavigate } from "react-router";
import { handleSingleDropdownChange } from "Utils/utils";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";

const sdk = new MkdSDK();

export default function AdminAddPetitionPage() {
  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [races, setRaces] = React.useState([]);
  const [selectedRace, setSelectedRace] = React.useState([]);
  const [currentTableData, setCurrentTableData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [petitionId, setPetitionId] = React.useState(null);
  const [signature, setSignature] = React.useState("");
  const [petitionInfo, setPetitionInfo] = React.useState({});
  const [isSearchBefore, setIsSearchBefore] = React.useState(false);

  const [electionType, setElectionType] = React.useState([]);
  const [selected_states, setSelected_states] = React.useState([]);
  const [filtered_counties, setFiltered_counties] = React.useState([]);
  const [selected_county, setSelected_county] = React.useState([]);

  const [electionTypeErrorMessage, setElectionTypeErrorMessage] =
    React.useState("");
  const [stateErrorMessage, setStateErrorMessage] = React.useState(false);
  const [countyErrorMessage, setCountyErrorMessage] = React.useState(false);

  const navigate = useNavigate();

  const schema = yup
    .object({
      race_name: yup.string(),
      candidate_name: yup.string(),
      // email: yup.string().required("Email is required"),
      email: yup.string(),
    })
    .required();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const schema2 = yup
    .object({
      name: yup.string().required("Name is a required field."),
      race: yup.string().required("Race is a required field."),
      party: yup.string().required("Party is a required field."),
      incumbent: yup.string().required("Incumbent is a required field."),
      email: yup
        .string()
        .email("Email must be a valid email.")
        .required("Email is a required field."),
      message: yup.string().max(250, "Please write shorter message."),
    })
    .required();
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    setError: setError2,
    setValue: setValue2,
    reset: reset2,
    formState: { errors: errors2 },
  } = useForm({
    resolver: yupResolver(schema2),
  });

  const onSelect = async (data) => {
    try {
      setPetitionId(data?.id);
      setPetitionInfo(data);
      setValue2("email", data?.email);
      setValue2("incumbent", data?.Incumbent);
      setValue2("name", data?.candidate_name);
      setValue2("party", data?.party_name ? data?.party_name : "NA");
      setSignature(data?.signature);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async (_data) => {
    setLoading(true);
    setIsSearchBefore(true);
    try {
      reset2();
      setSelectedRace([races[0]]);
      setPetitionId(null);
      setPetitionInfo({});
      let where = {};
      let where4 = { status: 0 };

      if (_data?.candidate_name) {
        where["candidate_name"] = _data?.candidate_name;
      }
      if (_data?.email) {
        where["email"] = _data?.email;
      }
      if (_data?.race_name) {
        where4["name"] = _data?.race_name;
      }
      const result = await sdk.getCandidates({
        where,
        where4,
        page: 1,
        limit: 9999999,
        orderBy: "id",
        direction: "DESC",
      });
      const { list } = result;

      setCurrentTableData(list);
      setLoading(false);
    } catch (error) {
      console.log("Error", error);
      setError("name", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
    setLoading(false);
  };

  const onSubmit = async (_data) => {
    setSubmitLoading(true);
    try {
      if (selectedRace[0].value) {
        const result = await sdk.submitPublicPetition({
          user_id: petitionInfo?.user_id,
          candidate_name: petitionInfo?.candidate_name,
          race_id: _data?.race,
          parties_id: petitionInfo?.parties_id,
          incumbent: petitionInfo?.Incumbent,
          status: 1,
          signature: signature,
          email: petitionInfo?.email,
          address: petitionInfo?.address,
          election_type: petitionInfo?.election_type,
          election_id: selectedRace[0]?.election_id,
          state: selectedRace[0]?.state,
          county: selectedRace[0]?.county,
          countyInCharge: selectedRace[0]?.countyInCharge,
          send_mail: true,
          is_federal: 0,
        });
        if (!result.error) {
          showToast(globalDispatch, "Petition submission successful");
          navigate("/official/candidates");
        } else {
          showToast(globalDispatch, result?.message, 4000, "error");
        }
      }
    } catch (error) {
      console.log("Error", error);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error.message);
    }
    setSubmitLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "candidates",
      },
    });

    // (async function () {
    //   try {
    //     const where = {
    //       state: state?.state,
    //       county: state?.county,
    //       status: 1,
    //     };

    //     const result = await sdk.getRacesPaginate({
    //       where,
    //       page: 1,
    //       limit: 999999999,
    //       orderBy: "id",
    //       direction: "DESC",
    //     });
    //     const { list } = result;
    //     const list_mod = list?.map((race) => {
    //       return { label: race?.name, value: race?.id, ...race };
    //     });
    //     setSelectedRace([list_mod[0]]);
    //     setValue2("race", list_mod[0]?.value);
    //     setRaces(list_mod);
    //   } catch (error) {
    //     console.log(error);
    //     tokenExpireError(dispatch, error.message);
    //   }
    // })();
  }, []);

  const getDataOfSelectedArea = React.useCallback(async () => {
    try {
      const ifAllSelected =
        electionType?.length &&
        selected_states?.length &&
        selected_county?.length;
      const ifStateTypeSelected =
        electionType?.length && selected_states?.length;

      const type = Number(electionType?.[0]?.value);
      const state = selected_states?.[0]?.value;
      const county = selected_county?.[0]?.value;

      const where = {
        election_type: type,
        status: 1,
      };

      //   if state election type
      if (ifStateTypeSelected && type === 2) {
        where["state"] = state;
      }

      //   if county election type
      if (ifAllSelected && type === 1) {
        where["state"] = state;
        where["county"] = county;
      }

      const result = await sdk.getRacesPaginate({
        where,
        page: 1,
        limit: 999999999,
        orderBy: "id",
        direction: "DESC",
      });
      const { list } = result;
      const list_mod = list?.map((race) => {
        return { label: race?.name, value: race?.id, ...race };
      });
      setSelectedRace([list_mod[0]]);
      setValue2("race", list_mod[0]?.value);
      setRaces(list_mod);
    } catch (error) {
      console.log("getDataOfSelectedArea ->>", error);
    }
  }, [electionType, selected_states, selected_county]);

  React.useEffect(() => {
    getDataOfSelectedArea();
  }, [electionType, selected_states, selected_county]);

  return (
    <div className="p-10">
      <h4
        className={`fontRoboto mb-5 text-2xl`}
        style={{
          fontFamily: `Roboto, sans-serif `,
        }}
      >
        Add a Petition for Tied Race
      </h4>

      {/* Search candidate petitions */}
      <PetitionFilterBox
        isAdmin={true}
        handleSearch={handleSearch}
        electionType={electionType}
        selected_county={selected_county}
        selected_states={selected_states}
        setElectionType={setElectionType}
        setSelected_county={setSelected_county}
        setSelected_states={setSelected_states}
        // setValue={setValue}
        electionTypeErrorMessage={electionTypeErrorMessage}
        setElectionTypeErrorMessage={setElectionTypeErrorMessage}
        stateErrorMessage={stateErrorMessage}
        setStateErrorMessage={setStateErrorMessage}
        countyErrorMessage={countyErrorMessage}
        setCountyErrorMessage={setCountyErrorMessage}
        filtered_counties={filtered_counties}
        setFiltered_counties={setFiltered_counties}
      />

      {/* Candidate petition table */}
      <CandidateTable
        className={"mb-12 mt-10"}
        // ----- for table -----
        currentTableData={currentTableData}
        loading={loading}
        isModalOpen={false}
        petitionId={petitionId}
        setPetitionId={setPetitionId}
        prevPetition={false}
        setIsDltingPrevPetition={false}
        isWithElectionDate={true}
        // --- for pagination ---
        currentPage={1}
        pageCount={1}
        pageSize={9999999}
        canPreviousPage={false}
        canNextPage={false}
        // setPageSize={setPageSize}
        getData={() => {}}
        filterState={{}}
        // ---
        isAddingPetiton={true}
        onSelectFn={onSelect}
      />

      {isSearchBefore && currentTableData?.length < 1 ? (
        <p className="mb-4 w-full rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-800">
          No petitions found!
        </p>
      ) : null}

      {/* Petition form */}
      <div
        className={` w-11/12 max-w-2xl rounded-lg bg-white p-8 shadow-lg ${
          !petitionId ? "hidden" : ""
        }`}
      >
        <SectionTitle
          className="mb-5"
          text={"Candidate's selected petition information"}
          fontRoboto={true}
        />

        <form
          onSubmit={handleSubmit2(onSubmit)}
          className={`${!petitionId ? "hidden" : ""}`}
        >
          <div className="relative mb-4">
            <label className="mb-2 block text-sm " htmlFor="name">
              Candidate Name
            </label>

            <input
              id="name"
              disabled={false}
              {...register2("name")}
              className={`focus:shadow-outline w-full appearance-none  bg-[#F5F5F5] px-3 py-2 text-sm leading-tight   disabled:cursor-not-allowed ${
                errors2?.name?.message ? "border border-red-500" : "border-none"
              }`}
              type="text"
              placeholder="Name"
            />
            <p className="text-field-error italic text-red-500">
              {errors2?.name?.message}
            </p>
            {/* <p className="mt-2 text-lg text-[#E73E3E]">
                  I desire my name to appear as the above.
                </p> */}
          </div>

          <div className="mb-4">
            {races.length ? (
              <>
                <SearchDropdown
                  options={races}
                  selected_states={selectedRace}
                  label={"Select New Race"}
                  lableFontLarge={false}
                  className={` `}
                  stateError={false}
                  errorMessage={""}
                  disableSearch={true}
                  stateChangeFn={(value) => {
                    handleSingleDropdownChange(
                      value,
                      setSelectedRace,
                      setValue2,
                      "race"
                    );
                  }}
                />
              </>
            ) : (
              <p className="mb-4 w-full rounded-lg bg-red-300 p-4 text-sm text-red-800">
                <span className="font-medium">No active races found</span>
              </p>
            )}

            <p className="text-field-error italic text-red-500">
              {errors2?.race?.message}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 items-center justify-between gap-5 sm:grid-cols-2">
            <div className="">
              <label className="mb-2 block text-sm" htmlFor="Party">
                Party
              </label>
              <input
                disabled
                {...register2("party")}
                className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5]  px-3 py-2 text-sm leading-tight text-gray-700  disabled:cursor-not-allowed ${
                  errors2?.name?.message
                    ? "border border-red-500"
                    : "border-none"
                }`}
                type="text"
                placeholder="Name"
              />
            </div>

            <div className="">
              <label className="mb-2 block text-sm" htmlFor="Incumbent">
                Incumbent
              </label>
              <select
                id="Incumbent"
                disabled
                placeholder={"Incumbent"}
                {...register2("incumbent")}
                className={`focus:shadow-outline w-full appearance-none border border-transparent bg-[#F5F5F5] px-3 py-2 text-sm leading-tight text-gray-700 disabled:cursor-not-allowed ${
                  errors2?.incumbent?.message ? "border border-red-500" : ""
                }`}
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
              <p className="text-field-error italic text-red-500">
                {errors2?.incumbent?.message}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm" htmlFor="Email">
              Email
            </label>
            <input
              id="Email"
              disabled
              className={`focus:shadow-outline w-full appearance-none bg-[#F5F5F5] px-3 py-2 text-sm leading-tight text-gray-700  disabled:cursor-not-allowed ${
                errors2?.email?.message
                  ? "border border-red-500"
                  : "border-none"
              }`}
              {...register2("email")}
              type="email"
              placeholder="example@mail.com"
            />
            <p className="text-field-error italic text-red-500">
              {errors2?.email?.message}
            </p>
          </div>

          <div className="relative mb-8">
            <label className="mb-2 block text-sm">Signature </label>
            <img src={signature} alt="" className="bg-[#f5f5f5]" />
          </div>

          <div className={`flex items-center justify-center `}>
            <InteractiveButton
              className="text- rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:from-[#b877eb] disabled:to-[#b877eb]"
              type="submit"
              loading={submitLoading}
              disabled={submitLoading}
            >
              Submit
            </InteractiveButton>
          </div>
        </form>
      </div>
    </div>
  );
}
