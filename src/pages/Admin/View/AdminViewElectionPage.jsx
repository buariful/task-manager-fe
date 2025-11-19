import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import { isImage, empty, isVideo } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { SkeletonLoader } from "Components/Skeleton";
import { FilterBoxBg } from "Components/FilterBoxBg";

let sdk = new MkdSDK();

const AdminViewElectionPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  const { dispatch } = React.useContext(AuthContext);
  const [viewModel, setViewModel] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const params = useParams();

  async function getData() {
    try {
      setLoading(true);
      sdk.setTable("elections");
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
        path: "election",
      },
    });
    getData();
  }, []);
  return (
    <div className=" p-5 sm:p-10">
      <FilterBoxBg>
        <h4 className="text-2xl font-medium">Election</h4>
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
                <div className="flex-1 font-semibold">Election Date</div>
                <div className="flex-1">{viewModel?.election_date}</div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Races </div>
                <div className="flex-1">
                  {JSON.parse(viewModel?.races_id)
                    ? JSON.parse(viewModel?.races_id)?.map((race, i) => (
                        <span className="capitalize" key={i}>
                          {i !== 0 && ", "} {race?.name}
                        </span>
                      ))
                    : "NA"}
                </div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">
                  Composite Ballot Status
                </div>
                <div className="flex-1">
                  {viewModel?.composite_ballot_status ? "Done" : "Pending"}
                </div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Is Template</div>
                <div className="flex-1">
                  {Number(viewModel?.is_template) === 1 ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="mb-4 mt-4">
              <div className="mb-4 flex">
                <div className="flex-1 font-semibold">Status</div>
                <div className="flex-1">
                  {Number(viewModel?.status) === 1 ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default AdminViewElectionPage;
