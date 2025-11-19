const FilterBoxBg = ({ children, className }) => {
  return (
    <div
      className={`rounded-lg bg-white p-8 shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] sm:p-10 ${className}`}
    >
      {children}
    </div>
  );
};

export default FilterBoxBg;
