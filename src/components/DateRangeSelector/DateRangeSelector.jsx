import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

const DateRangeSelector = ({ onChange }) => {
  const [range, setRange] = useState([null, null]);
  const [openCalendar, setOpenCalendar] = useState(false);

  const handleChange = (dates) => {
    setRange(dates);
    if (onChange) onChange(dates);
  };

  return (
    <div className="relative w-max">
      <label className="block mb-2 text-sm text-accent font-medium">
        Select Date Range
      </label>
      <div
        className="flex items-center gap-2 bg-input-bg border border-neutral-gray px-3 py-2 rounded shadow-sm cursor-pointer"
        onClick={() => setOpenCalendar(!openCalendar)}
      >
        <span>{range[0] ? format(range[0], "dd MMM yyyy") : "Start Date"}</span>
        <span className="text-sm text-neutral-gray">to</span>
        <span>{range[1] ? format(range[1], "dd MMM yyyy") : "End Date"}</span>
      </div>

      {openCalendar && (
        <div className="absolute z-50 mt-2">
          <Calendar
            selectRange={true}
            onChange={handleChange}
            value={range}
            calendarType="US"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
