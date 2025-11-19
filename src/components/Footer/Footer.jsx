import { Logo2 } from "Assets/images";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <div className="">
      <div className="relative mx-auto flex w-10/12 flex-col items-center gap-2 border-b py-2 lg:flex-row lg:py-5">
        <p
          className="text-[
#222222] fontInter text-sm"
        >
          Contact: {import.meta.env.VITE_REQUEST_RECIEVE_MAIL}
        </p>
        <img
          src={Logo2}
          alt=""
          className="w-[10rem] lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[14rem] lg:-translate-x-1/2 lg:-translate-y-1/2 xl:w-[20rem]"
        />
      </div>

      <div className="mx-auto flex w-10/12 flex-col items-center justify-center gap-3 py-5 md:flex-row">
        <p
          className="text-[
#222222] fontInter text-sm"
        >
          &copy; {new Date().getFullYear()} Parallel2Software
        </p>

        {/* <ul className="itmes-center flex gap-5 ">
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaFacebookF className="text-sm text-[#B0B8BC]" />
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn className="text-sm text-[#B0B8BC]" />
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaYoutube className="text-sm text-[#B0B8BC]" />
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-sm text-[#B0B8BC]" />
            </a>
          </li>
          <li>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-sm text-[#B0B8BC]" />
            </a>
          </li>
        </ul> */}
      </div>
    </div>
  );
};

export default Footer;
