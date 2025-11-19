const BorderedCheckBox = ({
  participant_id,
  skill_id,
  isChecked = false,
  allParticipants,
  setAllParticipants,
  minPassMark,
  disabled = false,
}) => {
  const handleCheckToggle = (e) => {
    try {
      const isPass = e.target?.checked;
      const newSkills = allParticipants
        ?.find((item) => item?.id === participant_id)
        ?.skill_result?.map((item) => {
          if (item?.skill_id === skill_id) {
            return { ...item, pass: isPass };
          } else return item;
        });

      let isParticipantPass = true;
      let totalPassSkills = 0;

      newSkills?.map((item) => {
        if (item?.is_required && !item?.pass) {
          isParticipantPass = false;
        }

        if (item?.pass) totalPassSkills += 1;
      });

      // calculate percantage of the pass skills
      const percantage = (totalPassSkills * 100) / newSkills?.length;

      if (percantage < minPassMark) isParticipantPass = false;

      const participantModified = allParticipants?.map((item) => {
        if (item?.id === participant_id) {
          return {
            ...item,
            result: isParticipantPass ? "pass" : "fail",
            skill_result: newSkills,
          };
        } else return item;
      });

      setAllParticipants(participantModified);
    } catch (error) {
      console.log(error?.message);
    }
  };

  return (
    <span className="w-[3.25rem] shrink-0 h-[2.25rem] grid place-content-center border border-gray-300">
      <input
        name="skill"
        type="checkbox"
        checked={isChecked}
        className="ring-0 focus:ring-0 text-primary cursor-pointer disabled:cursor-default"
        disabled={disabled}
        onChange={handleCheckToggle}
      />
    </span>
  );
};

export default BorderedCheckBox;
