const CustomButton = ({ className, callBackFn, isForFilter }) => {
  return isForFilter ? (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="submit"
        className=" rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91]"
      >
        Submit
      </button>
      <p
        className=" cursor-pointer rounded bg-gradient-to-tr from-red-600 to-red-500 px-4 py-2 text-sm  font-[600] text-white hover:from-red-600 hover:to-red-600"
        onClick={callBackFn}
      >
        Clear
      </p>
    </div>
  ) : (
    <button
      type="submit"
      className={` rounded bg-gradient-to-tr from-[#662D91] to-[#8C3EC7] px-4 py-2 text-sm  font-[600] text-white hover:from-[#662D91] hover:to-[#662D91] ${className}`}
    >
      Submit
    </button>
  );
};

export default CustomButton;
