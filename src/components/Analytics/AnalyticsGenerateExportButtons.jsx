import { InteractiveButton } from "Components/InteractiveButton";
import React from "react";

export default function AnalyticsGenerateExportButtons({
  handleGenerateFn = () => {},
  handleExportPdfFn = () => {},
  showGenerateButton = true,
  showExportButton = true,
  disabledGenerateButton = false,
  disabledExportButton = false,
}) {
  return (
    <div className="flex items-center gap-4">
      {showGenerateButton ? (
        <InteractiveButton
          className={`!bg-neutral-gray !text-white hover:!bg-gray-500`}
          onClick={handleGenerateFn}
          disabled={disabledGenerateButton}
        >
          Generate
        </InteractiveButton>
      ) : null}

      {showExportButton ? (
        <InteractiveButton
          disabled={disabledExportButton}
          className={`!border`}
          isSecondaryBtn={true}
          onClick={handleExportPdfFn}
        >
          Export as PDF
        </InteractiveButton>
      ) : null}
    </div>
  );
}
