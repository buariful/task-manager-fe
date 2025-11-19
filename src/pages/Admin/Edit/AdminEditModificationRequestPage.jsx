import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { GlobalContext, showToast } from "Context/Global";
import { tokenExpireError, AuthContext } from "Context/Auth";
import { InteractiveButton } from "Components/InteractiveButton";
import { Link, useNavigate, useParams } from "react-router-dom";
import TreeSDK from "Utils/TreeSDK";
import { SkeletonLoader } from "Components/Skeleton";
import { FiAlertCircle } from "react-icons/fi";

let sdk = new MkdSDK();
const tdk = new TreeSDK();

const AdminEditModificationRequestPage = () => {
  const schema = yup.object({}).required();

  const { dispatch, state } = React.useContext(AuthContext);
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [modRequest, setModRequest] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [approveLoading, setApproveLoading] = React.useState(false);
  const [declineLoading, setDeclineLoading] = React.useState(false);
  const [prevRaceInfo, setPrevRaceInfo] = React.useState({});
  const [prevPartyInfo, setPrevPartyInfo] = React.useState({});
  const [newPartyInfo, setNewPartyInfo] = React.useState({});
  const [userPrevRaces, setUserPrevRaces] = React.useState([]);
  const { id } = useParams();

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

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      // -- updating profile table Data
      const userNewData = {
        party: newPartyInfo?.name !== "NA" ? newPartyInfo?.name : "",
        parties_id: !modRequest?.party_id ? 0 : modRequest?.party_id,
        precincts: modRequest?.races?.precincts,
      };
      if (
        !userPrevRaces?.find(
          (race) => Number(race?.id) === Number(modRequest?.race_id)
        )
      ) {
        userNewData["races_id"] = JSON.stringify([
          ...userPrevRaces?.filter(
            (race) => Number(race?.id) !== Number(prevRaceInfo?.id)
          ),
          { id: modRequest?.race_id, name: modRequest?.races?.name },
        ]);
      }
      sdk.setTable("profile");
      await sdk.callRestAPI(
        {
          set: userNewData,
          where: { user_id: modRequest?.user_id },
        },
        "PUTWHERE"
      );

      // -- petition table data update
      await tdk.update("petition", modRequest?.petition_id, {
        candidate_name: modRequest?.candidate_name,
        race_id: modRequest?.race_id,
        // parties_id: modRequest?.party_id,
        parties_id: !modRequest?.party_id ? 0 : modRequest?.party_id,
      });

      // --- user table data update
      await tdk.update("user", modRequest?.user_id, {
        first_name: modRequest?.candidate_name?.split(" ")[0],
        last_name: modRequest?.candidate_name?.split(" ").slice(1).join(" "),
      });

      // --- races table data update
      if (Number(prevRaceInfo?.id) !== Number(modRequest?.race_id)) {
        const newRace_candidates = [
          ...(JSON.parse(modRequest?.races?.candidates) || []),
          {
            email: modRequest?.user?.email,
            name: modRequest?.candidate_name,
          },
        ];
        const prevrace_candidates = JSON.parse(
          prevRaceInfo?.candidates
        )?.filter((candidate) => candidate?.email !== modRequest?.user?.email);

        await tdk.update("races", modRequest?.race_id, {
          candidates: JSON.stringify(newRace_candidates),
        });
        await tdk.update("races", prevRaceInfo?.id, {
          candidates: JSON.stringify(prevrace_candidates),
        });
      }

      // update the modification
      await tdk.update("modification", modRequest?.id, {
        approval_status: 1, // approved
      });

      showToast(globalDispatch, "Request approved successfully!");
      navigate("/admin/request");
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
    setApproveLoading(false);
  };

  const handleDecline = async () => {
    setDeclineLoading(true);
    try {
      await tdk.update("modification", modRequest?.id, {
        approval_status: 2, // declined
      });
      showToast(globalDispatch, "Request declined!");
      navigate("/admin/request");
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, error?.message, 4000, "error");
      tokenExpireError(dispatch, error?.message);
    }
    setDeclineLoading(false);
  };

  const getData = async () => {
    setLoading(true);
    try {
      const filter = [`id,eq,${id}`];
      // if (Number(state?.official_type) === 1) {
      //   filter.push(`staci_j_modification.county,eq,'${state?.county}'`);
      // }
      const result = await tdk.getList("modification", {
        filter,
        join: "races,user,parties",
      });
      if (!result.error && result?.list[0]?.id) {
        if (result?.list[0]?.prevParty && result?.list[0]?.prevParty !== "NA") {
          const prevParty = await tdk.getOne(
            "parties",
            result?.list[0]?.prevParty
          );
          setPrevPartyInfo(prevParty?.model);
        } else {
          setPrevPartyInfo({ name: "NA", id: null });
        }

        if (result?.list[0]?.party_id && result?.list[0]?.party_id !== "NA") {
          const newParty = await tdk.getOne(
            "parties",
            result?.list[0]?.party_id
          );
          setNewPartyInfo(newParty?.model);
        } else {
          setNewPartyInfo({ name: "NA", id: null });
        }

        const prevRace = await tdk.getOne("races", result?.list[0]?.prerace);
        const userProfile = await tdk.getList("profile", {
          filter: [`user_id,eq,${result?.list[0]?.user_id}`],
        });
        setUserPrevRaces(JSON.parse(userProfile?.list[0]?.races_id) || []);

        setPrevRaceInfo(prevRace?.model);
      }
      setModRequest(result?.list[0]);
    } catch (error) {
      console.log(error?.message);
      tokenExpireError(dispatch, error?.message);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "candidates",
      },
    });

    getData();
  }, []);

  return (
    <>
      <div
        className="m-5  rounded bg-white p-10 shadow-[0_4px_16px_0_rgba(0,0,0,0.1)]"
        style={{ fontFamily: "Roboto, sans-serif" }}
      >
        <div className="mb-10">
          <h4
            className="text-xl font-[500]"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Modification Request
          </h4>

          {modRequest?.message ? (
            <p className="rounded-md bg-green-100 p-3">{modRequest?.message}</p>
          ) : null}
          <p>{}</p>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : modRequest?.id ? (
          <div className="max-w-lg ">
            <div className="">
              <h4 className="mb-4 text-sm font-[500] capitalize">
                Candidate Details:
              </h4>
              <div className="mb-2 flex items-center justify-between text-base font-[400] capitalize">
                <p className="">Candidate Name</p>
                <p className="">
                  {modRequest?.user?.first_name +
                    " " +
                    modRequest?.user?.last_name}
                </p>
              </div>
              <div className="mb-2 flex items-center justify-between text-base font-[400] capitalize">
                <p className="">Race Name</p>
                <p className="">{prevRaceInfo?.name}</p>
              </div>
              <div className="mb-5 flex items-center justify-between border-b border-b-[#00000033] pb-5 text-base font-[400] capitalize">
                <p className="">Party</p>
                <p className="">{prevPartyInfo?.name}</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="mb-4 text-sm font-[500] capitalize">
                Candidate Modified Details:
              </h4>
              <div className="mb-2 flex items-center justify-between text-base font-[400] capitalize">
                <p className="">Candidate Name</p>
                <p className="">{modRequest?.candidate_name}</p>
              </div>
              <div className="mb-2 flex items-center justify-between text-base font-[400] capitalize">
                <p className="">Race Name</p>
                <p className="">{modRequest?.races?.name}</p>
              </div>
              <div className="mb-2 flex items-center justify-between text-base font-[400] capitalize">
                <p className="">Party</p>
                <p className="">{newPartyInfo?.name}</p>
              </div>
            </div>

            {Number(modRequest?.approval_status) === 0 ? (
              <div
                className="flex items-center gap-2 text-sm font-[600]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <InteractiveButton
                  onClick={handleApprove}
                  loading={approveLoading}
                  disabled={approveLoading || declineLoading}
                  className="mx-1 flex min-h-[40px] min-w-[80px] cursor-pointer items-center rounded-md bg-[#00A859] px-3 py-2 text-center font-medium text-white shadow-md hover:bg-[#0b9152] disabled:cursor-not-allowed disabled:bg-[#2cc07b]"
                >
                  Approve Request
                </InteractiveButton>

                <InteractiveButton
                  loading={declineLoading}
                  disabled={declineLoading || approveLoading}
                  onClick={handleDecline}
                  className="mx-1 flex min-h-[40px] min-w-[80px] cursor-pointer items-center rounded-md bg-[#E73E3E] px-3 py-2 text-center font-medium text-white shadow-md hover:bg-[#e92c2c] disabled:cursor-not-allowed disabled:bg-[#f75656]"
                >
                  Decline Request
                </InteractiveButton>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="my-5 flex max-w-3xl gap-2 rounded-lg bg-red-200 p-5 ">
            {" "}
            <FiAlertCircle className="text-2xl text-orange-500" />{" "}
            <span>The modification request was not found!</span>
          </p>
        )}
      </div>
    </>
  );
};

export default AdminEditModificationRequestPage;
