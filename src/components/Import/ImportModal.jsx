import { Spinner } from "Assets/svgs";
import { InteractiveButton } from "Components/InteractiveButton";
import { Modal } from "Components/Modal";
import React from "react";
import { FiUpload } from "react-icons/fi";
import { downloadCsv } from "Utils/utils";

export default function ImportModal({
  isOpen,
  handleModalCloseFn = () => {},
  title = "Import",
  fileName,
  importDataFunction,
  isLoading,
  errorMessage,
  data,
  isParsingFile = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      modalCloseClick={handleModalCloseFn}
      classes={{ modalDialog: "w-[32rem] bg-red-500" }}
    >
      <div className="flex items-center flex-col gap-8">
        <h2 className="text-xl  font-semibold text-accent">{title}</h2>

        {errorMessage ? (
          <div className="flex flex-col items-center">
            <p className="text-sm text-red-500 mb-2 text-center">
              {errorMessage}
            </p>
            <button
              onClick={() => downloadCsv(data)}
              className="bg-neutral-gray text-sm px-3 py-1 rounded text-white"
            >
              Download sample file
            </button>
          </div>
        ) : isParsingFile ? (
          <div className="flex items-center justify-center">
            <Spinner size={50} />
          </div>
        ) : (
          <div className="text-center flex flex-col items-center gap-4">
            <FiUpload className="text-5xl text-neutral-gray" />
            <p className="text-sm">{fileName}</p>
          </div>
        )}

        <div className="flex itesm-center gap-5">
          <InteractiveButton
            type={"button"}
            isSecondaryBtn={true}
            onClick={handleModalCloseFn}
          >
            <span>Cancel</span>
          </InteractiveButton>
          <InteractiveButton
            disabled={isLoading || errorMessage}
            loading={isLoading}
            onClick={importDataFunction}
            type={"button"}
          >
            <span>Import</span>
          </InteractiveButton>
        </div>
      </div>
    </Modal>
  );
}
