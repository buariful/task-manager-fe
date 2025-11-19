import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { isImage, empty, isVideo, isPdf } from "Utils/utils";
import { MkdInput } from "Components/MkdInput";
import { InteractiveButton } from "Components/InteractiveButton";
import { SkeletonLoader } from "Components/Skeleton";
import { FilterBoxBg } from "Components/FilterBoxBg";
import { SectionTitle } from "Components/SectionTitle";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";

const AdminAddPartyPage = () => {
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const schema = yup
    .object({
      name: yup.string().required(),
      // electionType: yup.string(),
      // state: yup.string(),
      // county: yup.string(),
    })
    .required();

  const { dispatch, state } = React.useContext(AuthContext);
  const [fileObj, setFileObj] = React.useState({});
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
  const [partyPicture, setPartyPicture] = React.useState({
    file: "",
    preview: "",
  });

  const [electionType, setElectionType] = useState([]);
  const [selected_states, setSelected_states] = useState([]);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);

  const [electionTypeErrorMessage, setElectionTypeErrorMessage] = useState("");
  const [stateErrorMessage, setStateErrorMessage] = useState(false);

  const [countyErrorMessage, setCountyErrorMessage] = useState(false);
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

  const [pageDetails, setPageDetails] = React.useState([]);

  const getPageDetails = async () => {
    const result = await new TreeSDK()
      .getList("table")
      .catch((e) => console.error(object));
    setPageDetails(result.list);
  };

  const selectImg = (e) => {
    if (e.target.files[0]) {
      setPartyPicture({
        file: e.target.files[0],
        preview: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const onSubmit = async (_data) => {
    let sdk = new MkdSDK();

    setIsSubmitLoading(true);
    try {
      // validation
      let isError = false;
      if (!electionType.length) {
        setElectionTypeErrorMessage("Election type is required");
        isError = true;
      }
      if (!selected_states.length) {
        setStateErrorMessage("State is required");
        isError = true;
      }
      if (!selected_county.length && electionType[0]?.value === 1) {
        setCountyErrorMessage("County is required");
        isError = true;
      }
      if (isError) {
        setIsSubmitLoading(false);
        return;
      }

      let picture = "";
      if (partyPicture?.file) {
        const formData = new FormData();
        formData.append("file", partyPicture?.file);
        const uploadedResult = await sdk.uploadImage(formData);
        picture = uploadedResult?.url;
      }
      sdk.setTable("parties");
      const result = await sdk.callRestAPI(
        {
          name: _data.name,
          logo: picture,
          state: selected_states[0]?.value,
          county: selected_county[0]?.value,
          election_type: electionType[0]?.value,
        },
        "POST"
      );
      if (!result.error) {
        showToast(globalDispatch, "Party added successfully.");
        navigate("/admin/party");
      } else {
        if (result.validation) {
          const keys = Object.keys(result.validation);
          for (let i = 0; i < keys.length; i++) {
            const field = keys[i];
            setError(field, {
              type: "manual",
              message: result.validation[field],
            });
          }
        }
      }
      setIsSubmitLoading(false);
    } catch (error) {
      setIsSubmitLoading(false);
      console.log("Error", error);
      setError("name", {
        type: "manual",
        message: error.message,
      });
      tokenExpireError(dispatch, error.message);
    }
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "party",
      },
    });
  }, []);

  return (
    <div className=" p-10">
      <FilterBoxBg>
        <div>
          {" "}
          <SectionTitle
            className={"mb-8"}
            text={"Create Party"}
            fontRoboto={true}
          />
          <form
            className=" w-full max-w-lg"
            style={{ fontFamily: "Inter, sans-serif" }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <ElectionTypeStateCountySelect
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

            <MkdInput
              type={"text"}
              page={"parties"}
              name={"name"}
              errors={errors}
              label={"Name"}
              placeholder={"Name"}
              register={register}
              className={""}
            />

            <div className="">
              {" "}
              <img
                src={partyPicture?.preview}
                alt=""
                className="mx-auto h-auto w-60 rounded-full"
                loading="lazy"
              />
            </div>
            <div className="mb-8">
              <label className="mb-2 block  text-sm font-[400] ">
                Select Party Logo
              </label>
              <input
                className="block w-full cursor-pointer  rounded border border-transparent bg-[#f5f5f5] p-1  text-xs text-gray-900 file:rounded file:border-none file:bg-[#6b3099] file:px-2 file:py-2 file:text-white focus:outline-none"
                type="file"
                accept="image/*"
                onChange={selectImg}
              />
            </div>

            <InteractiveButton
              type="submit"
              loading={isSubmitLoading}
              disabled={isSubmitLoading}
              className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-3 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
            >
              Create
            </InteractiveButton>
          </form>
        </div>
      </FilterBoxBg>
    </div>
  );
};

export default AdminAddPartyPage;
