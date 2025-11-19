import {
  CheckImg,
  EllipseImg,
  MeetingImg_1,
  MeetingImg_2,
  MeetingImg_3,
  OvalImg,
  Shape_1Img,
} from "Assets/images";
import { GradientTxt } from "Components/GradientTxt";
import React from "react";

const data = [
  {
    title: "How do we approach the election process?",
    text: "Spearheaded by a visionary who has navigated the complexities of election management at state, vendor, and county levels, we bring a deep understanding and a heartfelt commitment to enhancing the election process.",
    img: MeetingImg_1,
    isFlexReverse: false,
  },
  {
    title: "Our Expertise",
    text: "Extends from overseeing ballot programming and proofing to implementing election software and equipment. It's not just our job; it's our passion.",
    img: MeetingImg_2,
    isFlexReverse: true,
  },
  {
    title: "Our Goal",
    text: "Parallel2Software embodies a unique blend of professional depth and personal touch. We're dedicated to simplifying the ballot review and preparation process, offering a platform where election officials and candidates can collaborate efficiently and effectively.",
    img: MeetingImg_3,
    isFlexReverse: false,
  },
];

export default function WhoWeAre() {
  const Point = ({ title, text, img, isFlexReverse = false }) => {
    return (
      <div
        className={`mb-14 flex flex-col items-center justify-between gap-8  md:gap-14 ${
          isFlexReverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        <div className="z-10">
          <GradientTxt
            text={title}
            isHeading={false}
            classNames={"text-3xl font-semibold mb-5"}
          />
          <div className="grid  grid-cols-12">
            <div className="block  w-[8px] rounded-md bg-gradient-to-b from-[#662D91] via-[#507AC3] to-[#3DBAED]"></div>
            <p className="col-span-11 py-3 text-base">{text}</p>
          </div>
        </div>

        <img src={img} alt="" className="z-10 max-w-[18rem] rounded-2xl" />
      </div>
    );
  };

  return (
    <div className="fontInter relative py-14" id="about">
      {/* -------- title ---------- */}
      <div className="relative z-10">
        <div className="mx-auto mb-16 w-10/12 text-center lg:w-8/12">
          <GradientTxt
            classNames={"text-5xl font-bold mb-5"}
            text={"Who We Are"}
          />
          <p className="mx-auto max-w-[1114px] text-2xl font-bold text-[#183B56]">
            At Parallel2Software, our foundation is built on nearly{" "}
            <span className="text-[#893EC1]">two decades</span> of dedicated
            service in the election industry.
          </p>
        </div>

        <img
          src={EllipseImg}
          alt=""
          className="absolute bottom-0 left-0 w-32
           md:w-40"
        />
        <img
          src={OvalImg}
          alt=""
          className="absolute -bottom-20 right-0 w-40  md:-bottom-32
           md:w-64"
        />
      </div>

      {/* ---------------- points ---------- */}
      <div className=" mx-auto w-10/12 lg:w-8/12">
        {data.map((d, i) => (
          <Point
            title={d.title}
            text={d.text}
            img={d.img}
            key={i}
            isFlexReverse={d.isFlexReverse}
          />
        ))}
      </div>

      <img
        src={Shape_1Img}
        alt=""
        className="absolute left-0 top-1/2 z-0 w-[30vw] -translate-y-1/2"
      />
      <img
        src={CheckImg}
        alt=""
        className="absolute bottom-[28vh] left-1/2 w-[23vw] "
      />
    </div>
  );
}
