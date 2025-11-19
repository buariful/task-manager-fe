import React, { memo } from "react";
import { CloseIcon } from "Assets/svgs";

const Modal = ({
  children,
  title,
  isOpen = false,
  modalCloseClick,
  modalHeader,
  classes,
}) => {
  return (
    <div
      style={{
        zIndex: 100000002,
        transform: "translate(-50%, -50%)",
      }}
      className={`modal-holder fixed left-[50%] top-[50%] h-[100vh] w-full items-center justify-center bg-[#00000099] p-0 sm:p-14 xl:p-20 ${
        isOpen ? "flex" : "hidden"
      }`}
    >
      <div
        className={`rounded-lg bg-white p-10 shadow ${classes?.modalDialog}`}
      >
        {modalHeader && (
          <div className={`flex justify-between border-b pb-2`}>
            <h5 className="text-center text-2xl font-bold uppercase">
              {title}
            </h5>
            <div
              className="modal-close cursor-pointer"
              onClick={modalCloseClick}
            >
              <CloseIcon />
            </div>
          </div>
        )}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const ModalMemo = memo(Modal);
export { ModalMemo as Modal };
