import React from "react";

export default function AlphabetFilter({
  handleAlphabetSelection,
  allSkills,
  selectedLetters,
  handleClear = () => {},
}) {
  const alphabets = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  return (
    <div className="flex  gap-1 flex-wrap text-xs mb-2">
      {alphabets.map((char) => (
        <button
          onClick={() => handleAlphabetSelection(char)}
          key={char}
          disabled={!allSkills[char]}
          className={`px-2 py-1 text-sm rounded  capitalize
            ${
              selectedLetters?.includes(char) ? "text-primary" : "text-accent"
            } disabled:text-neutral-gray
            `}
        >
          {char}
        </button>
      ))}
      <button
        onClick={handleClear}
        className="ml-2 text-primary underline text-base"
      >
        Clear Selections
      </button>
    </div>
  );
}
