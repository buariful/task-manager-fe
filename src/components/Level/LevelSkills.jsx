import React from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoFilterCircle } from "react-icons/io5";
import AlphabetFilter from "./AlphabetFilter";
import SkillList from "./SkillList";
import { useEffect } from "react";
import { showToast } from "Context/Global";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import { GlobalContext } from "Src/globalContext";
import { FullPageLoader } from "../FullPageLoader";
import { AdministratorAddSkillModal } from "Components/AdministratorSkill";
import SkillCategoryFilter from "./SkillCategoryFilter";
import { useCallback } from "react";

export default function LevelSkills({ hasAddSkillPermission = true }) {
  const { state } = useContext(AuthContext);
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isFetching, setIsFetching] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isSkillFilterModalOpen, setIsSkillFilterModalOpen] = useState(false);
  const [selectedSkillType, setSelectedSkillType] = useState(0);
  const [groupedAllSkills, setGroupedAllSkills] = useState({});
  const [groupedSkills, setGroupedSkills] = useState({});
  const [selectedAlphabet, setSelectedAlphabet] = useState([]);
  const [selectedCatgoryIds, setSelectedCatgoryIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const getData = async ({ type = "", categoryIds = [], searchTerm = "" }) => {
    setIsFetching(true);
    try {
      let query = supabase
        .from("skill")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .eq("status", 1)
        .order("name", { ascending: true });

      if (type) {
        query = query.eq("type", type);
        setSelectedSkillType(type);
      }
      if (categoryIds?.length) {
        query = query.in("category_id", categoryIds);
      }
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching skills:", error);
        setIsFetching(false);
        return null;
      }

      // Group by first letter
      const grouped = data.reduce((acc, skill) => {
        const firstLetter = skill.name[0].toLowerCase(); // e.g. "a", "b"
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(skill);
        return acc;
      }, {});

      setGroupedSkills(grouped);
      setGroupedAllSkills(grouped);
    } catch (error) {
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setIsFetching(false);
  };

  const handleSkillTypeChange = (type) => {
    setSelectedSkillType(type);
    if (type) {
      getData({
        type,
        categoryIds: selectedCatgoryIds,
        searchTerm: searchTerm,
      });
    } else {
      getData({
        type: "",
        categoryIds: selectedCatgoryIds,
        searchTerm: searchTerm,
      });
    }
  };

  const handleAlphabetSelection = (letter) => {
    try {
      const normalizedLetter = letter.toLowerCase();

      const isExistOnSelection = selectedAlphabet?.find(
        (A) => A?.toLowerCase() === normalizedLetter
      );

      let alphabets = [];

      if (isExistOnSelection) {
        alphabets = selectedAlphabet?.filter(
          (A) => A?.toLowerCase() !== normalizedLetter
        );
      } else {
        alphabets = [...selectedAlphabet, normalizedLetter];
      }

      if (alphabets?.length) {
        const selectedSkills = {};
        alphabets.forEach((A) => {
          selectedSkills[A] = groupedAllSkills[A];
        });
        setGroupedSkills(selectedSkills);
      } else {
        setGroupedSkills(groupedAllSkills);
      }
      setSelectedAlphabet(alphabets);
    } catch (error) {
      console.log(error?.message);
    }
  };

  const handleClearLetterSelection = () => {
    setSelectedAlphabet([]);
    setGroupedSkills(groupedAllSkills);
  };
  const handleApplySkillCategoryFilter = () => {
    getData({
      type: selectedSkillType,
      categoryIds: selectedCatgoryIds,
      searchTerm: searchTerm,
    });
  };
  const handleClearSkillCategoryFilter = () => {
    setSelectedCatgoryIds([]);
    getData({
      type: selectedSkillType,
      categoryIds: selectedCatgoryIds,
      searchTerm: searchTerm,
    });
  };

  const handleSearch = (e) => {
    try {
      const value = e.target?.value;

      setSearchTerm(value);
      getData({
        type: selectedSkillType,
        categoryIds: selectedCatgoryIds,
        searchTerm: value,
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getData({
      type: "",
      categoryIds: selectedCatgoryIds,
      searchTerm: searchTerm,
    });
  }, []);

  return (
    <div className="bg-[#F7F7F7] rounded-lg  flex flex-col gap-6">
      <div className="grid grid-cols-12 mb-2">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 items-center col-span-8  ">
          <div
            className={`flex flex-1 items-center gap-3 border-b  shadow bg-white pl-4  border-accent`}
          >
            {/* Search Icon */}
            <FaSearch className="text-neutral-gray" size={18} />

            <input
              type={"text"}
              // id={name}
              // disabled={disabled}
              value={searchTerm}
              onChange={handleSearch}
              placeholder={"Search Skills"}
              style={{ borderBottom: "none" }}
              className={`w-full resize-none appearance-none  px-4 py-3 flex-1 !text-base leading-tight ring-0 focus:ring-0   focus:outline-none  `}
            />

            <button
              type={"button"}
              className={"bg-white text-accent !text-base font-normal"}
              onClick={() => setIsSkillFilterModalOpen(true)}
            >
              <span className="flex items-center gap-2">
                <span>Filter</span>
                <IoFilterCircle className="" size={25} />
              </span>
            </button>
          </div>

          <div className="flex flex-1 gap-2 items-center">
            <button
              className={`border px-3 py-2 rounded   ${
                selectedSkillType === 0
                  ? "text-accent border-accent"
                  : "text-neutral-gray border-neutral-gray"
              }`}
              onClick={() => handleSkillTypeChange(0)}
            >
              All Skills
            </button>
            <button
              className={`border px-3 py-2 rounded   ${
                selectedSkillType === 1
                  ? "text-accent border-accent"
                  : "text-neutral-gray border-neutral-gray"
              }`}
              onClick={() => handleSkillTypeChange(1)}
            >
              Assisted
            </button>
            <button
              className={`border px-3 py-2 rounded   ${
                selectedSkillType === 2
                  ? "text-accent border-accent"
                  : "text-neutral-gray border-neutral-gray"
              }`}
              onClick={() => handleSkillTypeChange(2)}
            >
              Unassisted
            </button>
          </div>
        </div>

        {hasAddSkillPermission ? (
          <div className="col-span-4 flex justify-end">
            <button
              className="ml-auto border px-3 py-2 rounded bg-primary text-white"
              onClick={() => setIsAddSkillModalOpen(true)}
            >
              Add New Skill
            </button>
          </div>
        ) : null}
      </div>

      {/* Alphabet Filter */}
      <AlphabetFilter
        handleAlphabetSelection={handleAlphabetSelection}
        allSkills={groupedAllSkills}
        selectedLetters={selectedAlphabet}
        handleClear={handleClearLetterSelection}
      />

      {/* Skills List & Selected Skills */}
      {isFetching ? <FullPageLoader /> : <SkillList skills={groupedSkills} />}

      {/* skill add modal */}

      <AdministratorAddSkillModal
        setShowModal={setIsAddSkillModalOpen}
        showModal={isAddSkillModalOpen}
        refetch={getData}
        fnParams={{
          type: selectedSkillType,
          categoryIds: selectedCatgoryIds,
          searchTerm: searchTerm,
        }}
      />

      <SkillCategoryFilter
        open={isSkillFilterModalOpen}
        setOpen={setIsSkillFilterModalOpen}
        onApplyFilters={handleApplySkillCategoryFilter}
        onClearFilters={handleClearSkillCategoryFilter}
        selectedCatgoryIds={selectedCatgoryIds}
        setSelectedCatgoryIds={setSelectedCatgoryIds}
      />
    </div>
  );
}
