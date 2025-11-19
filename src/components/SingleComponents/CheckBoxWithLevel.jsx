import React from "react";

export default function CheckBoxWithLevel({ level, checked, onChangeFn }) {
  return (
    <label key={level} className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChangeFn(e.target.checked, level)}
        className="w-4 h-4"
      />
      <span className="text-sm text-accent">{level}</span>
    </label>
  );
}
