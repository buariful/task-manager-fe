import { CloseIcon } from "Assets/svgs";
import { ElectionTypeStateCountySelect } from "Components/AdminElectionComponents";
import { InteractiveButton } from "Components/InteractiveButton";
import { StateCountySelect } from "Components/StateCountySelect";
import React, { useState } from "react";

export default function ReportDownloadModal({
  setModalOpen,
  loading,
  downloadFunction,
  withElectionType = true,
}) {
  const [electionType, setElectionType] = useState([]);
  const [selected_states, setSelected_states] = useState([]);
  const [filtered_counties, setFiltered_counties] = useState([]);
  const [selected_county, setSelected_county] = useState([]);

  const [electionTypeErrorMessage, setElectionTypeErrorMessage] = useState("");
  const [countyErrorMessage, setCountyErrorMessage] = useState("");
  const [stateErrorMessage, setStateErrorMessage] = useState("");

  const handleReportDownload = () => {
    try {
      setElectionTypeErrorMessage("");
      setCountyErrorMessage("");
      setStateErrorMessage("");

      const type = electionType[0]?.value;
      const county = selected_county[0]?.value;
      const state = selected_states[0]?.value;

      let isError = false;
      if (!type && withElectionType) {
        setElectionTypeErrorMessage("Please select a election type.");
        isError = true;
      }

      if (!state) {
        setStateErrorMessage("Please select a state.");
        isError = true;
      }

      if (Number(type) === 1 && !county) {
        setCountyErrorMessage("Please select a county");
        isError = true;
      }

      if (isError) return;

      downloadFunction(
        electionType[0]?.value,
        selected_states[0]?.value,
        selected_county[0]?.value
      ); // downloadFunction(type, state, county)
    } catch (error) {}
  };

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center "
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: "1000",
      }}
    >
      <section className="flex w-[25rem] min-w-[25rem]  flex-col gap-6 rounded-[.5rem] bg-white px-6 py-6">
        <div className="flex justify-between ">
          <div>
            <h4>Download Report</h4>
          </div>
          <button onClick={() => setModalOpen(false)}>
            <CloseIcon />
            {/* <img src={Close} width={30} height={30} alt='close' /> */}
          </button>
        </div>

        <div>
          {withElectionType ? (
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
          ) : (
            <StateCountySelect
              selected_county={selected_county}
              selected_states={selected_states}
              setSelected_county={setSelected_county}
              setSelected_states={setSelected_states}
              stateErrorMessage={stateErrorMessage}
              setStateErrorMessage={setStateErrorMessage}
              countyErrorMessage={countyErrorMessage}
              setCountyErrorMessage={setCountyErrorMessage}
              filtered_counties={filtered_counties}
              setFiltered_counties={setFiltered_counties}
              electionType={1}
            />
          )}
        </div>

        <div className="flex justify-between font-medium leading-[1.5rem] text-[base]">
          <button
            disabled={loading}
            className="flex h-[2.75rem] items-center justify-center rounded-[.5rem] border border-[#d8dae5] text-[#667085] hover:border-[#5c6577] hover:text-[#454c58]"
            style={{
              width: "10.375rem",
              height: "2.75rem",
            }}
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
          <InteractiveButton
            disabled={loading}
            loading={loading}
            className={`flex h-[2.75rem] w-[10.375rem] items-center justify-center gap-x-5 rounded-[.5rem] border border-purple-500 bg-purple-500  text-white transition-all hover:border-[#692E95] hover:bg-[#692E95]`}
            onClick={handleReportDownload}
          >
            Download
          </InteractiveButton>
        </div>
      </section>
    </aside>
  );
}
