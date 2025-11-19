import React from "react";
import { MenuImg, PeopleImg, DatabaseImg, WarningImg } from "Assets/images";
import "./whyToChoose.css";

const data = [
  {
    title: "Candidate Intake Kiosk",
    text: "Let candidates enter their information digitally at the time of petition filing. Designed to reduce data entry errors at the source and free up time for staff review.",
    img: DatabaseImg,
    right: false,
  },
  {
    title: "Ballot Review Portal",
    text: "Provides a secure place for candidates to review how their name appears before final approval. Helps prevent reprints, and lowers the chance of last-minute changes.",
    img: PeopleImg,
    right: true,
  },
  {
    title: "Built-In Review Log",
    text: "Every change is tracked. Every sign-off is documented. ",
    img: WarningImg,
    right: false,
  },
  {
    title: "Works with your Process",
    text: "Developed to support the workflows election officials already rely on, no new systems to overhaul, no major adjustments to make. The RX Series fits into what you're already doing and helps you catch issues earlier with less disruption.",
    img: MenuImg,
    right: true,
  },
];

export default function WhyToChoose() {
  const Advantage = ({ img, isToRight, title, text }) => {
    return (
      <div
        className={`relative mb-10 w-full rounded-lg bg-[#0000004D] py-10 pl-[4.5rem] pr-16 md:w-3/5 ${
          isToRight ? "ms-auto" : ""
        }`}
      >
        <h4 className="mb-2 text-2xl font-bold">{title}</h4>
        <p className="text-base tracking-[0.2px]">{text}</p>

        <img
          src={img}
          alt=""
          className="absolute left-0 top-1/2 w-[14vw] -translate-x-1/2 -translate-y-1/2 md:w-[6vw]"
        />
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="bg-[#ECF7FB]">
        <div className="wave_top bg-gradient-to-r from-[#662D91] via-[#507AC3] to-[#3DBAED] py-10"></div>
      </div>
      <div className="fontInter z-[11] bg-gradient-to-r from-[#662D91] via-[#507AC3] to-[#3DBAED] py-20 text-white">
        {/* -------- title ---------- */}
        <div className="mx-auto mb-16 w-10/12 text-center text-white lg:w-8/12">
          <h2 className="fontInter mb-5 text-[2rem] font-bold text-white sm:text-5xl">
            Introducing the Parallel2Software RX Series
          </h2>
          <p className="mx-auto max-w-[1114px] text-2xl">
            Our RX Series is a suite of tools designed to reduce stress,
            increase visibility, and improve confidence across the candidate
            intake and ballot proofing process.
          </p>
        </div>

        {/* ------------ advantages --------- */}

        <div className="mx-auto w-10/12 lg:w-8/12">
          {data.map((d, i) => (
            <Advantage
              key={i}
              img={d.img}
              isToRight={d.right}
              text={d.text}
              title={d.title}
            />
          ))}
        </div>
      </div>
      <div className="wave_bottom bg-gradient-to-r from-[#662D91] via-[#507AC3] to-[#3DBAED] py-10"></div>
    </div>
  );
}
