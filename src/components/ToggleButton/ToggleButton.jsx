import { Switch } from "@headlessui/react";
import React from "react";

export default function ToggleButton({
  value = true,
  onChangeFunction = (v) => {
    console.log(v);
  },
  withLabel = false,
  activeLable = "Enabled",
  disabledLabel = "Disabled",
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={value}
        onChange={onChangeFunction}
        disabled={disabled}
        className={`${
          value ? "bg-primary" : "bg-white"
        } relative inline-flex h-6 w-11 items-center rounded-full border border-primary`}
      >
        <span
          className={`${
            value ? "translate-x-6 bg-gray-300" : "translate-x-1 bg-primary"
          } inline-block h-4 w-4 transform rounded-full  transition`}
        />
      </Switch>
      {withLabel ? (
        <span className="text-sm">{value ? activeLable : disabledLabel}</span>
      ) : null}
    </div>
  );
}
