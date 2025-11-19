import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { isImage, empty, isVideo } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { SkeletonLoader } from "Components/Skeleton";
import FilterBoxBg from "Components/FilterBoxBg/FilterBoxBg";

let sdk = new MkdSDK();

const AdminViewRacePage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const { dispatch } = React.useContext(GlobalContext);
  const [viewModel, setViewModel] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const params = useParams();

  async function getData() {
    try {
      setLoading(true);
      sdk.setTable("races");
      const result = await sdk.callRestAPI(
        { id: Number(params?.id), join: "" },
        "GET"
      );
      if (!result.error) {
        setViewModel(result.model);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      console.log("error", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(function () {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "races",
      },
    });

    getData();
  }, []);
  return (
    <div className="p-5 sm:p-10">
      <FilterBoxBg>
        <h4 className="text-2xl font-medium">View Race</h4>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Id</div>
                <div className="flex-1">{viewModel?.id}</div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Create At</div>
                <div className="flex-1">{viewModel?.create_at}</div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Update At</div>
                <div className="flex-1">
                  {viewModel?.update_at?.split("T")[0]}
                </div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Name</div>
                <div className="flex-1">{viewModel?.name}</div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Vote For Phrase</div>
                <div className="flex-1">{viewModel?.vote_for_phrase}</div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Precincts</div>
                <div className="flex-1">
                  {JSON.parse(viewModel?.precincts)?.map((pre, i) => (
                    <span className="capitalize" key={i}>
                      {i !== 0 && ", "} {pre?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Parties</div>
                <div className="flex-1">
                  {JSON.parse(viewModel?.parties)?.map((pre, i) => (
                    <span className="capitalize" key={i}>
                      {i !== 0 && ", "} {pre?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default AdminViewRacePage;
