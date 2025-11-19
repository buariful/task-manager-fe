import { Modal } from "Components/Modal";
import React from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

export default function PetitionSuccessModal({ isModalOpen, onCloseFn }) {
  return (
    <>
      <Modal
        isOpen={isModalOpen}
        classes={{ modalDialog: "w-10/12 mx-auto max-w-2xl relative" }}
      >
        <IoClose
          className="absolute right-3 top-3 cursor-pointer text-3xl hover:text-red-500"
          onClick={onCloseFn}
        />

        <div className="-mt-4 mb-5 flex flex-col items-center border-b border-b-[#00000033] pb-5">
          <FaCircleCheck className="mb-3 text-6xl text-[#00A859]" />
          <h4 className="text-3xl font-semibold">
            Thank you for submitting your petition!
          </h4>
        </div>

        <p className="mb-5 text-center text-2xl">
          Your petition has been successful. To complete the next steps, please
          check your email for an account setup link. We've sent you an email
          with instructions on how to set up your account. If you don't see the
          email in your inbox, please check your spam folder.
        </p>
        <p className="pb-5 text-center text-2xl">
          Once your account is set up, you will be notified when your sample
          ballot is ready for review.
        </p>
      </Modal>
    </>
  );
}
