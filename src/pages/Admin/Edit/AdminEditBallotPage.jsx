import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdSDK from "Utils/MkdSDK";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext, tokenExpireError } from "Context/Auth";
import { GlobalContext, showToast } from "Context/Global";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { SkeletonLoader } from "Components/Skeleton";
import { SectionTitle } from "Components/SectionTitle";
import { FilterBoxBg } from "Components/FilterBoxBg";

let sdk = new MkdSDK();

const AdminEditBallotPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const schema = yup
    .object({
      country_name: yup.string(),
      description: yup.string(),
      pdf_file: yup.string(),
      com_ballot_status: yup.string(),
      published: yup.string(),
    })
    .required();
  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const [fileObj, setFileObj] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = React.useState(false);
  const [description, setDescription] = useState("");
  const [id, setId] = useState(0);

  const navigate = useNavigate();

  const [country_name, setCountryName] = useState("");
  const [pdf_file, setPdfFile] = useState("");
  const [com_ballot_status, setComBallotStatus] = useState("");
  const [published, setPublished] = useState(0);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const params = useParams();

  useEffect(function () {
    (async function () {
      try {
        setLoading(true);

        sdk.setTable("ballots_layout");
        const result = await sdk.callRestAPI({ id: Number(params?.id) }, "GET");
        if (!result.error) {
          setDescription(result.model.description);
          setId(result.model.id);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);

        console.log("error", error);
        tokenExpireError(dispatch, error.message);
      }
    })();
  }, []);

  const handleCheckEmpty = async (content, editor) => {
    setDescription(content);
    const isEmpty = !editor.getText().trim();
    setIsEditorEmpty(isEmpty);
    return isEmpty;
  };

  const onSubmit = async (_data) => {
    setIsLoading(true);
    try {
      sdk.setTable("ballots_layout");
      const result = await sdk.callRestAPI(
        {
          id: id,

          description: description,
        },
        "PUT"
      );

      if (!result.error) {
        showToast(globalDispatch, "Updated");
        navigate("/admin/ballots-layout");
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
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showToast(globalDispatch, "Can not be updated!", 4000, "error");
    }
  };
  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "ballot",
      },
    });
  }, []);

  return (
    <div className=" mx-auto min-h-screen rounded  p-10">
      <FilterBoxBg>
        <SectionTitle
          fontRoboto={true}
          text={"Edit Ballot Header Description"}
          className={"mb-5"}
        />
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="mb-4 w-full max-w-lg">
              <label className="[400] mb-2 block text-sm">
                Ballot Header Description
              </label>
              <ReactQuill
                onChange={(content, _delta, _source, editor) =>
                  handleCheckEmpty(content, editor)
                }
                className={isEditorEmpty ? "quill_empty_error" : ""}
                value={description}
                // onChange={setDescription}
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline", "strike"], // Toggle buttons
                    [{ header: [1, 2, 3, 4, 5, 6, false] }], // Font size dropdown
                    [{ align: [] }], // align texts
                    [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered list
                    [{ indent: "-1" }, { indent: "+1" }],
                    // ["script", "superscript"], // Sub/Superscript
                    //   [{ script: "sub" }, { script: "super" }],
                    //   [{ indent: "-1" }, { indent: "+1" }],
                    ["clean"], // Clear formatting
                  ],
                }}
              />
            </div>
            <button
              onClick={onSubmit}
              className="rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4  py-3 text-sm font-[600] text-white"
              // disable={isLoading || isEditorEmpty}
              disabled={isLoading || isEditorEmpty}
            >
              {isLoading ? "Loading..." : "Save Description"}
            </button>
          </>
        )}
      </FilterBoxBg>
    </div>
  );
};

export default AdminEditBallotPage;
