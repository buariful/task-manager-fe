import React, { memo } from "react";
import { CloseIcon, Spinner } from "Assets/svgs";
import ReportCardView from "./ReportCardView";
import { IoCloseSharp } from "react-icons/io5";
import { supabase } from "Src/supabase";
import { useEffect } from "react";
import { useRef } from "react";
import { generatePDF } from "Utils/utils";

const ReportCardViewModal = ({
  reportCardId = null,
  handleClose = () => {},
}) => {
  const [isFetching, setIsFetching] = React.useState(false);
  const [reportData, setReportData] = React.useState(false);

  const reportRef = useRef();

  const getData = async () => {
    setIsFetching(true);
    try {
      const { data } = await supabase
        .from("worksheet_participant_map")
        .select(
          "*, participant:participant_id(id, first_name, last_name),  level: level_id(id, name), worksheet:worksheet_id(*), next_level: next_recommend_level_id(id,name)"
        )
        .order("id", { ascending: false })
        .eq("id", reportCardId)
        .single();
      await supabase
        .from("worksheet_participant_map")
        .update({ is_open: true })
        .eq("id", reportCardId);

      setReportData(data);
    } catch (error) {
      console.log("getData->>", error?.message);
    }
    setIsFetching(false);
  };

  const handleDownloadReport = async () => {
    try {
      await generatePDF({ ref: reportRef });
    } catch (error) {
      console.log("handleDownloadReport->>", error?.message);
    }
  };

  useEffect(() => {
    if (reportCardId) {
      getData();
    }
  }, [reportCardId]);

  return (
    <div
      style={{
        zIndex: 100000002,
        transform: "translate(-50%, -50%)",
      }}
      className={`modal-holder fixed left-[50%] top-[50%] h-[100vh] overflow-auto w-full items-center justify-center bg-[#00000099] p-0 sm:p-14 xl:p-20 ${
        reportCardId ? "flex" : "hidden"
      }`}
    >
      <div className={`rounded-lg bg-white p-5 shadow `}>
        {isFetching ? (
          <div className="w-[32rem] h-[40vh]  grid place-content-center">
            <Spinner size={50} />
          </div>
        ) : (
          <>
            <div className={`flex justify-between  items-center`}>
              <h5 className="text-center text-2xl font-normal capitalize">
                Report Card Preview
              </h5>
              <button
                className="rounded-full px-4 py-2 bg-neutral-gray text-white text-sm "
                onClick={handleDownloadReport}
              >
                Download Report Card
              </button>
              <div className="modal-close cursor-pointer" onClick={handleClose}>
                <IoCloseSharp className="text-lg" />
              </div>
            </div>

            <div className="mt-2">
              <div ref={reportRef}>
                <ReportCardView data={reportData} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ModalMemo = memo(ReportCardViewModal);
export { ModalMemo as ReportCardViewModal };
