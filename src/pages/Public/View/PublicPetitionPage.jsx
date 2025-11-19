import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { AuthContext } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { PetitionImage } from "Assets/images";
import { SkeletonLoader } from "Components/Skeleton";
import {
  JsonParse,
  county_change,
  formatDate,
  state_county_change,
} from "Utils/utils";
import { PetitionSuccessModal } from "Components/PetitionSuccessModal";
import { ElectionType } from "Components/PublicPetition";
import PetitionForm from "Components/PublicPetition/PetitionForm";

let sdk = new MkdSDK();

const PublicPetitionPage = () => {
  const schema = yup
    .object({
      name: yup.string().required("Name is a required field."),
      // race: yup.string().required("Races is a required field."),
      // party: yup.string().required("Party is a required field."),
      incumbent: yup.string().required("Incumbent is a required field."),
      email: yup
        .string()
        .email("Email must be a valid email.")
        .required("Email is a required field."),
      address: yup.string().required("Address is a required field."),
    })
    .required();

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const { dispatch } = React.useContext(AuthContext);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [hasSignatureError, setHasSignatureError] = useState(false);
  const signatureRef = useRef();
  const [activeElection, setActiveElection] = useState({});
  const [races, setRaces] = useState([]);
  const [selected_race, setSelected_race] = useState([]);
  const [raceError, setRaceError] = useState(false);
  const [parties, setParties] = useState([]);
  const [selected_party, setSelected_party] = useState([]);
  const [partyError, setPartyError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCountySelected, setIsCountySelected] = useState(false);
  const [selectedElType, setSelectedElType] = useState(1);
  const [selected_states, setSelected_states] = React.useState([]);
  const [stateError, setStateError] = React.useState(false);
  const [filtered_counties, setFiltered_counties] = React.useState([]);
  const [selected_county, setSelected_county] = React.useState([]);
  const [countyError, setCountyError] = React.useState(false);
  const [selectedIncumbOpt, setSelectedIncumbOpt] = React.useState([
    { label: "No", value: 0 },
  ]);

  const incumbentOptions = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
  ];

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

  const resetAll = () => {
    try {
      reset();
      signatureRef.current.clear();
      setSignatureData(null);
      setSelected_race([]);
      setSelected_party([]);
      setIsModalOpen(false);
    } catch (error) {
      console.log(error?.message);
    }
  };

  const onSubmit = async (data) => {
    let isAnyFieldEmpty = false;
    if (!signatureData) {
      isAnyFieldEmpty = true;
      setHasSignatureError(true);
    }
    if (!selected_race?.length) {
      isAnyFieldEmpty = true;
      setRaceError(true);
    }
    if (!selected_party?.length) {
      isAnyFieldEmpty = true;
      setPartyError(true);
    }
    if (isAnyFieldEmpty) return;
    setSubmitLoading(true);

    try {
      const blob = await fetch(signatureData).then((res) => res.blob());
      const formData = new FormData();
      formData.append("file", blob, `${data?.name}_signature.png`);
      const signature = await sdk.uploadFilePublic(formData);

      const result = await sdk.submitPublicPetition({
        candidate_name: data?.name,
        race_id: selected_race[0]?.value,
        parties_id: selected_party[0]?.value,
        incumbent: Number(data?.incumbent),
        status: 1,
        signature: signature?.url,
        email: data?.email,
        address: data?.address,
        election_id: activeElection?.id,
        state: selected_states[0]?.label,
        county: selected_county[0]?.label,
        election_type: selectedElType,
        send_mail: true,
        is_federal: 0,
      });
      if (!result.error) {
        setIsModalOpen(true);
      } else {
        showToast(
          globalDispatch,
          result?.message || "Petition submission unsuccessful!",
          4000,
          "error"
        );
      }
    } catch (error) {
      // tokenExpireError(dispatch, error?.message);
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setSubmitLoading(false);
  };

  const getElection = async () => {
    let isFieldEmpty = false;
    if (!selected_county[0]?.label) {
      isFieldEmpty = true;
      setCountyError(true);
    }
    if (!selected_states[0]?.label) {
      isFieldEmpty = true;
      setStateError(true);
    }
    if (isFieldEmpty) return;

    setIsCountySelected(true);
    setIsLoading(true);
    try {
      const elections = await sdk.getActiveElection(
        selected_states[0]?.label,
        selectedElType,
        selectedElType === 1 ? selected_county[0]?.label : null
      );
      if (elections?.list[0]?.id) {
        const election_allRaces = JsonParse(elections?.list[0]?.races_id);
        setActiveElection(elections?.list[0]);
        if (election_allRaces?.length > 0) {
          const races_mod = [];
          for (let i = 0; i < election_allRaces?.length; i++) {
            if (Number(election_allRaces[i]?.for_candidate_petition) === 1) {
              races_mod.push({
                label: election_allRaces[i]?.name,
                value: election_allRaces[i]?.id,
              });
            }
          }
          setRaces(races_mod);
        } else {
          setError("race", {
            type: "manual",
            message: "No races found under the election!",
          });
        }
      }
      const allParties = await sdk.getParties(
        selected_states[0]?.label,
        selectedElType,
        selectedElType === 1 ? selected_county[0]?.label : null
      );
      setParties([
        { label: "NA", value: undefined },
        ...allParties?.list?.map((party) => {
          return { ...party, label: party?.name, value: party?.id };
        }),
      ]);
    } catch (error) {
      console.log(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {" "}
      <div className="relative m-auto min-h-screen pb-20">
        <div className="mb-5 min-h-[50px] bg-gradient-to-r from-[#662D91] to-[#8C3EC7] py-5 text-white">
          <div
            className={`mx-auto w-11/12 max-w-3xl text-center font-semibold ${
              (!isCountySelected || isLoading) && "hidden"
            }`}
          >
            {activeElection?.id ? (
              <>
                <p className="mb-3 text-2xl uppercase">
                  {activeElection?.name}
                </p>
                <p className="text-2xl">
                  {formatDate(activeElection?.election_date?.split("T")[0])}
                </p>
              </>
            ) : (
              <p className="text-2xl">No ongoing elections are available.</p>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <h1 className="mb-5 text-6xl font-medium">Intake Rx</h1>
        </div>
        <img
          src={PetitionImage}
          alt=""
          className="mx-auto mb-5 w-10/12 max-w-lg"
        />
        <div className="mx-auto w-11/12 max-w-3xl rounded-lg bg-white p-8 shadow-lg">
          {isCountySelected ? (
            /* ------------- the petition form --------------- */
            <div>
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <PetitionForm
                  onSubmit={onSubmit}
                  races={races}
                  selected_race={selected_race}
                  setSelected_race={setSelected_race}
                  setRaceError={setRaceError}
                  raceError={raceError}
                  parties={parties}
                  selected_party={selected_party}
                  setSelected_party={setSelected_party}
                  partyError={partyError}
                  setPartyError={setPartyError}
                  incumbentOptions={incumbentOptions}
                  selectedIncumbOpt={selectedIncumbOpt}
                  setSelectedIncumbOpt={setSelectedIncumbOpt}
                  signatureRef={signatureRef}
                  hasSignatureError={hasSignatureError}
                  setHasSignatureError={setHasSignatureError}
                  setSignatureData={setSignatureData}
                  submitLoading={submitLoading}
                  activeElection={activeElection}
                />
              )}
            </div>
          ) : (
            /* --------------- state and county selection form ---------- */
            <ElectionType
              selectedElType={selectedElType}
              setSelectedElType={setSelectedElType}
              selected_states={selected_states}
              setSelected_states={setSelected_states}
              stateError={stateError}
              setStateError={setStateError}
              filtered_counties={filtered_counties}
              setFiltered_counties={setFiltered_counties}
              selected_county={selected_county}
              setSelected_county={setSelected_county}
              countyError={countyError}
              setCountyError={setCountyError}
              getElection={getElection}
            />
          )}
        </div>
      </div>
      <PetitionSuccessModal isModalOpen={isModalOpen} onCloseFn={resetAll} />
    </>
  );
};

export default PublicPetitionPage;
