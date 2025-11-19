import React from "react";
import { GearImg, ProfileBoxImg, MessageImg, EnvelopeImg } from "Assets/images";

const data = [
  {
    img: GearImg,
    title: "Digital Petition Intake",
    text: "Candidates enter key information directly at the kiosk during filing.",
  },
  {
    img: ProfileBoxImg,
    title: "Secure Ballot Review Access",
    text: "Candidates can review and approve their name with confidence using secure PDF files.",
  },
  {
    img: MessageImg,
    title: "Time-Stamped Logs ",
    text: "Track exactly when each change or approval occurred.",
  },
  {
    img: EnvelopeImg,
    title: "Custom Composite Ballot",
    text: "A featured tool developed by Parallel2Software that enables election officials to generate a comprehensive list of all races scheduled for the upcoming election. This composite ballot is created after final approval and can be shared publicly to inform voters about the contest they will see on their ballots.",
  },
];

export default function Features() {
  const Feature = ({ img, title, text }) => {
    return (
      <div className="fontInter rounded-2xl  bg-[#f6f9ff] px-5 py-8 text-center md:py-14">
        <div className="mx-auto max-w-[451px] ">
          <img src={img} alt="" className="mx-auto w-[3.8em]" />
          <h4 className="my-3 text-xl font-semibold text-[#662D91]">{title}</h4>
          <p className="text-base text-black">{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div id="feature">
      <div className="mx-auto w-10/12 lg:w-8/12">
        <div className="mb-10 flex justify-center">
          <h2 className="fontInter text-5xl font-semibold text-[#303030]">
            Features
          </h2>
        </div>

        <div className="mb-28 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10">
          {data.map((d, i) => (
            <Feature img={d.img} text={d.text} title={d.title} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
