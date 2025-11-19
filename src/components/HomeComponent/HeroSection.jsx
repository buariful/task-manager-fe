import { OvalSmallImg } from "Assets/images";
import { GradientTxt } from "Components/GradientTxt";
import React from "react";

export default function HeroSection({ setModalOpen }) {
  return (
    <div className="relative mx-auto grid h-full w-11/12 flex-1 grid-cols-1  place-items-center gap-10 lg:w-10/12 lg:grid-cols-2 ">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
        <GradientTxt
          text={"You've been there."}
          classNames={"text-3xl sm:text-5xl   mb-3 font-bold fontInter"}
        />
        <p className="mb-4 max-w-md text-base font-semibold text-[#5A7184] sm:text-lg lg:mb-11 lg:text-xl">
          Reprints. Last-minute edits. Missing name approvals. This is for the
          officials who have stayed late, made calls, and fixed mistakes with
          barely enough time to print. The RX Series helps you catch it early
          and feel more in control without needing to change everything you
          already do.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="z-20 rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-8 py-3 text-lg font-semibold text-white  hover:from-[#662D91] hover:to-[#662D91]"
        >
          Try the Relief
        </button>
      </div>

      <div className="sm:pb-5 lg:pb-0">
        <p className="relative z-10 mb-2 text-base font-semibold text-[#5A7184] md:text-lg ">
          Ballot Proofing Relief - Not a pill, but it might feel like one.
        </p>
        <div className="relative">
          <div className=" relative z-10 rounded-[1.5rem] border border-[#d4d4d4a4] p-1">
            <video
              src={import.meta.env.VITE_HOME_HERO_VIDEO}
              controls
              autoPlay
              muted
              loop
              className="w-full rounded-[1.25rem]"
            ></video>

            <img
              src={OvalSmallImg}
              alt=""
              className="absolute bottom-0 left-0 -z-10 w-11 -translate-x-1/3 translate-y-1/4"
            />
          </div>
        </div>

        <p className="mt-2 font-semibold text-[#5A7184]">
          Election work comes with pressure. We built the RX Series to take some
          of that weight off, starting with tools that help simplify petition
          intake, reduce review mistakes, and create space to breathe during the
          most demanding parts of the cycle.
        </p>
      </div>
    </div>
  );
}
