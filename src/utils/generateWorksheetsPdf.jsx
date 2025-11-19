import { supabase } from "Src/supabase";
import { createRoot } from "react-dom/client";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import {
  Participant,
  ParticipantResult,
  BorderedCheckBox,
  ToggleOneSkillButton,
} from "Components/WorkSheet";
import { Card } from "Components/Card";
import { FiUsers } from "react-icons/fi";
import { worksheetStatus } from "Utils/utils";

// ------------------ Template ------------------
const WorksheetPrintTemplate = React.forwardRef(({ worksheets }, ref) => {
  const Heading = ({ title, text }) => (
    <div>
      <p className="text-neutral-gray text-xs">{title}</p>
      <p className="text-accent font-medium text-sm">{text}</p>
    </div>
  );

  const SkillHeader = ({ text, isAssisted }) => (
    <div className={`w-[3.25rem] relative`}>
      <span className="flex h-[3.25rem] text-xs w-[18rem] items-center text-nowrap gap-2 border-b border-b-gray-300 rotate-[-65deg] origin-left ml-[2rem] mb-[-2rem]">
        <span>{text}</span>
        {isAssisted ? <FiUsers /> : null}
      </span>
    </div>
  );

  return (
    <div ref={ref}>
      {worksheets.map(
        ({ worksheet, participants, skillLabels, groupedSkills }, index) => (
          <Card key={worksheet.id} className="mb-8">
            {index > 0 && <div className="pagebreak"></div>}
            {console.log(groupedSkills)}
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] print:p-5">
              {/* LEFT */}
              <div className="col-span-3 border-r border-r-gray-300">
                <div className="h-[13rem] print:h-[16rem] p-2 gap-2 grid grid-cols-2 print:border-b print:border-b-gray-300">
                  <Heading title="Season" text={worksheet?.season?.name} />
                  <Heading
                    title="Start Date"
                    text={moment(worksheet?.start_date_time).format(
                      "MMM DD, YYYY hh:mm A"
                    )}
                  />
                  <Heading
                    title="Instructor"
                    text={`${worksheet?.instructor?.first_name || ""} ${
                      worksheet?.instructor?.last_name || ""
                    }`}
                  />
                  <Heading title="Location" text={worksheet?.location?.name} />
                  <Heading
                    title="Days of Week(s)"
                    text={worksheet?.days_of_week}
                  />
                  <Heading title="Course Code" text={worksheet?.course_code} />
                </div>

                {participants.map((p) => (
                  <Participant
                    key={p.id}
                    participant={p}
                    allParticipants={participants}
                    disabled
                  />
                ))}
              </div>

              {/* MIDDLE */}
              <div className="col-span-1 border-r border-r-gray-300">
                <div className="print:h-[16rem] flex items-end justify-center w-full h-[13rem]">
                  <p className="text-sm mb-1 print:mb-0">Results</p>
                </div>

                {participants.map((p) => {
                  const allPassed = p.skill_result?.every((s) => s.pass);
                  return (
                    <ParticipantResult
                      key={p.id}
                      allParticipants={participants}
                      isAllPassed={allPassed}
                      participant={p}
                      disabled
                    />
                  );
                })}
              </div>

              {/* RIGHT */}
              <div className="col-span-10">
                <div className="overflow-x-auto">
                  <div className="flex gap-2 px-2 h-[13rem] w-full items-end">
                    {skillLabels.map((s) => (
                      <SkillHeader
                        key={s.skill_id}
                        text={s.name}
                        isAssisted={s.is_assisted}
                      />
                    ))}
                  </div>

                  <div className="w-full h-[3rem] flex gap-2 p-2 items-center border-b border-b-gray-300">
                    {skillLabels.map((skill) => (
                      <ToggleOneSkillButton
                        key={skill.skill_id}
                        allParticipants={participants}
                        minPassMark={worksheet?.level?.min_percentage}
                        skillId={skill.skill_id}
                        disabled
                      />
                    ))}
                  </div>

                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="w-full flex gap-2 p-2 items-center"
                    >
                      {p.skill_result.map((skill) => (
                        <BorderedCheckBox
                          key={`${p.id}_${skill.skill_id}`}
                          participant_id={p.id}
                          skill_id={skill.skill_id}
                          isChecked={skill.pass}
                          allParticipants={participants}
                          minPassMark={worksheet?.level?.min_percentage}
                          disabled
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="" style={{ breakBefore: "page" }}>
              {groupedSkills?.map((item) => (
                <div key={item?.id} className="mb-5">
                  <p className="bg-accent rounded-full mb-3 text-white text-lg font-medium p-3">
                    {item?.name}
                  </p>
                  <div className="px-3">
                    {item?.skills?.map((skill) => (
                      <div className="mb-4" key={skill?.id}>
                        <h4 className="text-lg font-normal">{skill?.name}</h4>
                        <p className="text-sm">{skill?.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
});

// ------------------ Helper Component that uses hook ------------------
const PrintHandler = ({ worksheets, onDone }) => {
  const ref = useRef();
  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: "Worksheets_Report",
    pageStyle: `
       @page { 
    size: A4 landscape; 
    margin: 10mm 10mm 22mm 10mm ; 
    @top-left { content: ""; }
    @top-center { content: ""; }
    @top-right { content: ""; }
    @bottom-left { content: ""; }
    @bottom-center { content: ""; }
    @bottom-right { content: ""; }
  }
  .pagebreak { page-break-before: always; }
  @media print {
    body { -webkit-print-color-adjust: exact; }
    .Card, .print-safe-area { padding-bottom: 1rem; overflow: visible !important; }
  }
  .pagebreak { page-break-before: always; }`,
    onAfterPrint: onDone,
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handlePrint?.();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return <WorksheetPrintTemplate ref={ref} worksheets={worksheets} />;
};

// ------------------ Main Export ------------------
export async function generateWorksheetsPdf(
  worksheetIds = [],
  setLoading = () => {}
) {
  if (!worksheetIds.length) return;
  setLoading(true);
  const worksheets = await Promise.all(
    worksheetIds.map(async (id) => {
      const { data: worksheet } = await supabase
        .from("worksheet")
        .select(
          `*, level: level_id(
          *,
          level_skill_map(
          is_required,serial,
            skill: skill_id(
              *,
              skill_category: category_id(id, name)
            )
          )
        ), season: season_id(id, name), location: location_id(id, name), instructor: instructor_id(id, first_name, last_name)`
        )
        .eq("id", id)
        .single();

      const { data: participants } = await supabase
        .from("worksheet_participant_map")
        .select("*, user: participant_id(*)")
        .order("id", { ascending: false })
        .eq("worksheet_id", id);

      const levelSkills = worksheet?.level.level_skill_map.map((l) => ({
        ...l.skill,
        is_required: l?.is_required,
      }));

      const skillsInGroup = levelSkills.reduce((acc, skill) => {
        const categoryId = skill.skill_category.id;
        let category = acc.find((c) => c.id === categoryId);
        if (!category) {
          category = {
            id: categoryId,
            name: skill.skill_category.name,
            skills: [],
          };
          acc.push(category);
        }
        category.skills.push(skill);
        return acc;
      }, []);

      return {
        worksheet,
        participants: participants || [],
        skillLabels: participants?.[0]?.skill_result || [],
        groupedSkills: skillsInGroup,
      };
    })
  );

  // Mount temporary React root
  const container = document.createElement("div");
  container.style.display = "none";
  document.body.appendChild(container);
  const root = createRoot(container);

  const handleDone = () => {
    root.unmount();
    container.remove();
  };

  root.render(<PrintHandler worksheets={worksheets} onDone={handleDone} />);
  setLoading(false);
}
