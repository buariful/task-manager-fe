import { InteractiveButton } from "Components/InteractiveButton";
import { Modal } from "Components/Modal";
import { GlobalContext, showToast } from "Context/Global";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { parseCsvData, parseExcelData } from "Utils/utils";
import ImportModal from "./ImportModal";

export default function ImportWorksheet({
  title,
  importDataFunction = () => {},
  refetch = () => {},
  sampleData,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileRef = useRef();

  const handleFileChange = async (e) => {
    try {
      setErrorMessage("");
      const file = e.target.files?.[0];
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!file) {
        setFile(null);
        return;
      }
      // ✅ Check file type
      if (!allowedTypes.includes(file.type)) {
        showToast(
          globalDispatch,
          "Please upload a valid CSV or Excel file!",
          4000,
          "error"
        );
        e.target.value = ""; // clear input
        return;
      }
      setFile(file);

      let parsedData = [];
      if (file.type === "text/csv") {
        parsedData = await parseCsvData(file);
      } else {
        parsedData = await parseExcelData(file);
      }

      console.log("parsedData", parsedData);

      // ✅ Validate parsed data against required fields
      const requiredFields = Object.keys(sampleData[0] || {});
      const missingFields = [];

      const firstRow = parsedData[0];
      if (firstRow) {
        requiredFields.forEach((field) => {
          if (!Object.prototype.hasOwnProperty.call(firstRow, field)) {
            missingFields.push(field);
          }
        });
      }

      if (missingFields.length > 0) {
        setErrorMessage(
          `The uploaded file is missing required fields: ${missingFields.join(
            ", "
          )}`
        );
        setFileData([]);
        e.target.value = "";
        return;
      }

      setFileData(parsedData);
      // you can handle file upload logic here
    } catch (error) {
      console.log("handleFileChange->>", error?.message);
    }
    e.target.value = "";
  };

  const handleImportData = async () => {
    setIsImporting(true);
    try {
      await importDataFunction(fileData);
      setFile(null);
      refetch();
    } catch (error) {}
    setIsImporting(false);
  };

  return (
    <>
      <InteractiveButton
        onClick={() => fileRef.current?.click()}
        type={"button"}
        isSecondaryBtn={true}
      >
        <span className="flex items-center gap-3">
          {" "}
          <span>{title}</span>
        </span>
      </InteractiveButton>
      <input
        type="file"
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        name=""
        id=""
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <ImportModal
        fileName={file?.name}
        isOpen={file}
        handleModalCloseFn={() => {
          setFile(null);
          setErrorMessage("");
        }}
        title={title}
        importDataFunction={handleImportData}
        isLoading={isImporting}
        errorMessage={errorMessage}
        data={sampleData}
      />
    </>
  );
}
