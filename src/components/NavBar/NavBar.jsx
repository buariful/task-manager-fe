import React from "react";
import { Logo, Logo2 } from "Assets/images";
import { Link } from "react-router-dom";

function NavBar({ className, loginRole = "official" }) {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className={`fontInter ${className}`}>
      <div className="mx-auto flex min-h-[80px] w-11/12 items-center justify-between gap-5 py-3 sm:w-10/12">
        <Link to={"/"}>
          <img src={Logo2} alt="" className="w-64" />
        </Link>
        <ul className="flex items-center justify-end gap-2 font-bold text-[#183B56] md:gap-8">
          {loginRole?.toLocaleLowerCase() === "official" ? (
            <>
              <li>
                <button
                  className="font-semibold hover:text-purple-700"
                  onClick={() => scrollToSection("about")}
                >
                  About
                </button>
              </li>
              <li>
                <button
                  className="font-semibold hover:text-purple-700"
                  onClick={() => scrollToSection("feature")}
                >
                  Features
                </button>
              </li>
            </>
          ) : null}

          <li>
            <Link
              className="inline-block rounded-xl border border-[#183b5683] px-2 py-1 font-semibold hover:border-purple-700 hover:text-purple-700 md:px-5 "
              to={`/${loginRole}/login`}
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
