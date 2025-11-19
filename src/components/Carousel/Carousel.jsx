import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SlideImg1, SlideImg2, SlideImg3, SlideImg4 } from "Assets/images";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import "./carousel.css";

const SlickCarousel = () => {
  const [isLastSlide, setIsLastSlide] = useState(false);
  const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
      <button
        className=" absolute left-2 top-[50%] z-50 -translate-y-1/2  rounded bg-[#662d916e] px-3 py-2 text-white hover:bg-[#662d91d8]"
        onClick={onClick}
      >
        <MdNavigateBefore className="text-xl sm:text-3xl lg:text-4xl" />
      </button>
    );
  };

  const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
      <button
        className=" absolute right-2 top-[50%] z-50 -translate-y-1/2  rounded bg-[#662d916e] px-3 py-2 text-white hover:bg-[#662d91d8]"
        onClick={onClick}
      >
        <MdNavigateNext className="text-xl sm:text-3xl lg:text-4xl" />
      </button>
    );
  };

  const totalSlides = 4;
  const settings = {
    dots: false,
    infinite: true,
    // centerMode: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    // prevArrow: <CustomPrevArrow />,
    // nextArrow: <CustomNextArrow />,
    arrows: false,
    afterChange: (currentSlide) => {
      // Check if it's the last slide
      setIsLastSlide(currentSlide === totalSlides - 1);
    },
  };

  return (
    <div className="relative">
      <Slider {...settings} className="">
        <div className="">
          <img
            className=" h-[93vh] w-full object-cover object-center"
            src={SlideImg1}
            alt="Image 1"
          />
          <div className="absolute inset-0 flex flex-wrap items-center justify-center bg-black bg-opacity-50">
            <h2 className="slideText text-center">
              Ballot Review <br /> Platform
            </h2>
          </div>
        </div>
        <div className="relative">
          <img
            className="h-[93vh] w-full object-cover object-center"
            src={SlideImg2}
            alt="Image 2"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <h2 className="slideText">User-Friendly</h2>
          </div>
        </div>
        <div>
          <img
            className="h-[93vh] w-full object-cover object-center"
            src={SlideImg3}
            alt="Image 3"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <h2 className="slideText">Secure and</h2>
          </div>
        </div>
        <div>
          <img
            className="h-[93vh] w-full object-cover object-center"
            src={SlideImg4}
            alt="Image 4"
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <h2 className="slideText">Efficient</h2>
          </div>
          <div className="absolute inset-0 flex items-end justify-center bg-black bg-opacity-50">
            <h2
              className={`${isLastSlide ? "slideText_small" : ""} pb-10`}
            ></h2>
          </div>
        </div>
      </Slider>

      {/* <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <h2 className="videoTxt"></h2>
      </div> */}
    </div>
  );
};

export default SlickCarousel;
