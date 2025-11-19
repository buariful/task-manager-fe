import { RxDownload } from "react-icons/rx";

const DownloadButton = ({ downloading, callBackFn, className }) => {
  return (
    <button
      disabled={downloading}
      onClick={callBackFn}
      className={`group mx-1 flex cursor-pointer items-center gap-1 text-center text-sm font-medium text-[#3E8EE7] disabled:cursor-not-allowed ${className}`}
    >
      <RxDownload className="text-xl" />{" "}
      {downloading ? (
        <span className="border-b border-b-transparent">Downloading...</span>
      ) : (
        <span className="border-b border-b-transparent group-hover:border-b-[#3E8EE7]">
          Download as Excel
        </span>
      )}
    </button>
  );
};

export default DownloadButton;
