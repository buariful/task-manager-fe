import React from "react";
import { InteractiveButton } from "Components/InteractiveButton";
import { CloseIcon, DangerIcon } from "Assets/svgs";

// type Props = {
//   closeModalFunction: () => void
//   actionHandler: any
//   message?: string
//   title?: string
//   rejectText?: string
//   acceptText?: string
//   titleClasses?: string
//   messageClasses?: string
// }

const ModalPrompt = ({
  closeModalFunction,
  actionHandler,
  message,
  title,
  messageClasses,
  titleClasses,
  acceptText = "YES",
  rejectText = "NO",
  loading = false,
  callAnotherFn_OnRejection = false,
  anotherFunction,
  isDangerBtn = true,
}) => {
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
            {title ? (
              <p className={`font-bold ${titleClasses}`}>{title}</p>
            ) : null}
          </div>
          <button disabled={loading} onClick={closeModalFunction}>
            <CloseIcon />
            {/* <img src={Close} width={30} height={30} alt='close' /> */}
          </button>
        </div>

        {message ? (
          <div className={`text-[#667085] ${messageClasses}`}>{message}</div>
        ) : null}

        <div className="flex justify-between font-medium leading-[1.5rem] text-[base]">
          <button
            disabled={loading}
            className="flex h-[2.75rem] items-center justify-center rounded-[.5rem] border border-[#d8dae5] text-[#667085] hover:border-[#5c6577] hover:text-[#454c58]"
            style={{
              width: "10.375rem",
              height: "2.75rem",
            }}
            onClick={
              callAnotherFn_OnRejection ? anotherFunction : closeModalFunction
            }
          >
            {rejectText}
          </button>
          <InteractiveButton
            disabled={loading}
            loading={loading}
            className={`flex h-[2.75rem] w-[10.375rem] items-center justify-center gap-x-5 rounded-[.5rem] border text-white transition-all  ${
              isDangerBtn
                ? "border-[#DC5A5D] bg-[#DC5A5D] hover:border-red-500 hover:bg-red-600"
                : "border-purple-500 bg-purple-500 hover:border-[#692E95] hover:bg-[#692E95]"
            }`}
            onClick={actionHandler}
          >
            {acceptText}
          </InteractiveButton>
        </div>
      </section>
    </aside>
  );
};

export default ModalPrompt;
