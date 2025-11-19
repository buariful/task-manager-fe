import { Spinner } from "Assets/svgs";
import { Card } from "Components/Card";
import { FullPageLoader } from "Components/FullPageLoader";
import { Modal, ModalPrompt } from "Components/Modal";
import { PageWrapper } from "Components/PageWrapper";
import {
  BorderedCheckBox,
  EditWorksheetPageHeader,
  Participant,
  ParticipantResult,
  ToggleOneSkillButton,
  WorksheetDetailsDrawer,
  WorksheetParticipants,
} from "Components/WorkSheet";
import { GlobalContext, showToast } from "Context/Global";
import moment from "moment";
import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import { RiCheckDoubleFill } from "react-icons/ri";
import { useParams } from "react-router";
import { supabase } from "Src/supabase";
import { useNavigate } from "react-router-dom";
import { DetailPageHeader } from "Components/DetailPageHeader";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { AuthContext } from "Context/Auth";
import { worksheetStatus } from "Utils/utils";
import { usePermissionFetcher } from "Src/hooks/useSinglePermissionFetch";
import { PermissionWarning } from "Components/PermissionWarning";

const Heading = ({ title, text }) => {
  return (
    <div>
      <p className="text-neutral-gray text-xs">{title}</p>
      <p className="text-accent font-medium text-sm">{text}</p>
    </div>
  );
};

const SkillHeader = ({ text, isAssisted }) => {
  return (
    <div className={`w-[3.25rem] relative`}>
      <span
        className={`flex h-[3.25rem]  text-xs w-[18rem] items-center text-nowrap gap-2 border-b  border-b-gray-300 rotate-[-65deg] origin-left ml-[2rem] mb-[-2rem] `}
      >
        {/* ml-[2rem] mb-[-1rem] */}
        <span>{text} </span>
        {isAssisted ? <FiUsers /> : null}
      </span>
    </div>
  );
};

export default function UserEditWorksheetPage() {
  const { dispatch: globalDispatch } = useContext(GlobalContext);
  const { state } = useContext(AuthContext);

  const [isFetching, setIsFetching] = React.useState(false);
  const [worksheet, setWorksheet] = React.useState(null);
  const [allParticipants, setAllParticipants] = React.useState([]); // []
  const [skillLabels, setSkillLabels] = React.useState([]);
  const [groupedSkills, setGroupedSkills] = React.useState([]);
  const [minPassMark, setMinPassMark] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [descriptionDrawerOpen, setDescriptionDrawerOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isAddingParticipant, setIsAddingParticipant] = React.useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] =
    React.useState(false);

  const { data: permission, loading: permissionLoading } =
    usePermissionFetcher("worksheet");
  const { data: participantPermission } = usePermissionFetcher("participant");

  const { id } = useParams();
  const navigate = useNavigate();
  const worksheetRef = useRef();

  const reactToPrintFn = useReactToPrint({
    contentRef: worksheetRef,
    documentTitle: "Worksheet Report",
    pageStyle: `
    @page {
      size: A4 landscape;
      margin: 1cm;
    }

    .bg-accent { background-color: #21272A; } 
    .rounded-full { border-radius: 9999px; }
    .text-white { color: white; }
    .text-lg { font-size: 1.125rem; }
    .font-medium { font-weight: 500; }
    .mb-3 { margin-bottom: 0.75rem; }
    .p-3 { padding: 0.75rem; }
  `,
    // pageStyle: `
    //   @page {
    //     size: A4 landscape /*  fixes layout to portrait */
    //   }
    //         .bg-accent { background-color: #21272A; }
    // .rounded-full { border-radius: 9999px; }
    // .text-white { color: white; }
    // .text-lg { font-size: 1.125rem; }
    // .font-medium { font-weight: 500; }
    // .mb-3 { margin-bottom: 0.75rem; }
    // .p-3 { padding: 0.75rem; }

    // `,
  });

  const getData = async () => {
    setIsFetching(true);
    try {
      // const { data } = await supabase
      //   .from("worksheet")
      //   .select(
      //     "*, level: level_id(*), season: season_id(id, name), location: location_id(id, name), instructor: instructor_id(id, first_name, last_name)"
      //   )
      //   .eq("id", id)
      //   .single();

      const { data } = await supabase
        .from("worksheet")
        .select(
          `
        *,
        level: level_id(
          *,
          level_skill_map(
          is_required,serial,
            skill: skill_id(
              *,
              skill_category: category_id(id, name)
            )
          )
        ),
        season: season_id(id, name),
        location: location_id(id, name),
        instructor: instructor_id(id, first_name, last_name)
      `
        )
        .eq("id", id)
        .single();

      const { data: participants } = await supabase
        .from("worksheet_participant_map")
        .select("*, user: participant_id(*)")
        .order("id", { ascending: false })
        .eq("worksheet_id", id);

      const levelSkills = data.level.level_skill_map.map((l) => ({
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

      setWorksheet(data);
      setMinPassMark(data?.level?.min_percentage);
      setAllParticipants(participants || []);
      setSkillLabels(participants?.[0]?.skill_result || []);
      setGroupedSkills(skillsInGroup);
    } catch (error) {
      console.log(error?.message);
    }
    setIsFetching(false);
  };

  const handleAddParticipant = async () => {
    setIsAddingParticipant(true);
    try {
      const skill_modified = skillLabels?.map((skill) => ({
        ...skill,
        pass: false,
      }));

      const { data: labels } = await supabase
        .from("organization_labels")
        .select("*")
        .eq("organization_id", worksheet?.organization_id)
        .single();

      const participantMap = selectedParticipants?.map((participant) => ({
        worksheet_id: id,
        participant_id: participant?.id,
        skill_result: skill_modified,
        level_id: worksheet?.level?.id,
        next_recommend_level_id:
          worksheet?.level?.next_recommended_level_id || null,
        pass_label: labels?.pass || "pass",
        fail_label: labels?.fail || "fail",
        comment: "",
        heading_items: worksheet?.heading_items,
        result_in_percentage: 0,
        result: "fail",
        organization_id: state?.organization_id,
      }));

      const { data, error: participantError } = await supabase
        .from("worksheet_participant_map")
        .insert(participantMap)
        .select("*, user:participant_id(*)");

      if (participantError) {
        showToast(globalDispatch, participantError?.message, 4000, "error");
      } else {
        showToast(globalDispatch, "Participants are added successfully");
        // setAllParticipants((prev) => [...(data || []), ...prev]);
      }

      if (participantError) {
        showToast(globalDispatch, participantError?.message, 4000, "error");
      } else {
        showToast(globalDispatch, "Participants are added successfully");
        setAllParticipants((prev) => [...(data || []), ...prev]);
      }
    } catch (error) {
      showToast(globalDispatch, error?.message, 4000, "error");
    }
    setSelectedParticipants([]);
    setIsAddingParticipant(false);
    setShowAddParticipantModal(false);
  };

  const handleDeleteItem = async (id) => {
    setDeleteLoading(true);
    try {
      const { error, data } = await supabase
        .from("worksheet")
        .delete()
        .eq("id", id);

      if (error) {
        showToast(
          globalDispatch,
          error?.message || "Failed to delete the worksheet.",
          4000,
          "error"
        );
      }
      showToast(globalDispatch, "Worksheet deleted successfully.");
      navigate("/user/worksheet");
    } catch (error) {
      console.log(error?.message);
      showToast(
        globalDispatch,
        error?.message || "Failed to delete the worksheet.",
        4000,
        "error"
      );
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  const handleMarkAllSeen = () => {
    try {
      const participantModified = allParticipants?.map((participant) => ({
        ...participant,
        skill_result: participant?.skill_result?.map((skill) => ({
          ...skill,
          pass: true,
        })),
        result: "pass",
      }));

      setAllParticipants(participantModified);
    } catch (error) {
      console.log("handleMarkAllSeen->>", error?.message);
    }
  };

  const isSkillPassedByAll = (skillId) => {
    try {
      return allParticipants.every((participant) =>
        participant?.skill_result?.some(
          (skill) => skill.skill_id === skillId && skill.pass === true
        )
      );
    } catch (error) {
      return null;
    }
  };
  const isAllSkillsSelected = (skills) => {
    try {
      let result = true;
      skills?.map((skill) => (skill.pass !== true ? (result = false) : null));

      return result;
    } catch (error) {
      return null;
    }
  };

  const handleUpdateParticipants = async () => {
    setIsUpdating(true);
    try {
      console.log("clicked");

      // chunk function
      const chunkArray = (arr, size) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        );
      };

      // 10 items at once
      const chunks = chunkArray(allParticipants, 10);
      for (const batch of chunks) {
        await Promise.all(
          batch.map((participant) =>
            supabase
              .from("worksheet_participant_map")
              .update({
                // pick only the fields you want to update
                skill_result: participant.skill_result,
                comment: participant.comment,
                result: participant.result,
                updated_at: new Date().toISOString(),
              })
              .eq("id", participant?.id)
          )
        );
      }

      console.log("✅ All participants updated in batches");
    } catch (error) {
      console.error("handleUpdateParticipants->>", error?.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    try {
      reactToPrintFn();
    } catch (error) {
      console.log(error?.message);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);

  return permissionLoading ? (
    <div className="flex justify-center my-10">
      <Spinner size={100} />
    </div>
  ) : permission?.view ? (
    isFetching ? (
      <FullPageLoader />
    ) : (
      <PageWrapper>
        <EditWorksheetPageHeader
          backLink={"/user/worksheet"}
          editDetailsLink={`/user/edit-worksheet-details/${id}`}
          data={worksheet}
          handleMarkAllSeen={handleMarkAllSeen}
          setDescriptionDrawerOpen={setDescriptionDrawerOpen}
          setShowDeleteModal={setShowDeleteModal}
          handlePrintFn={handlePrint}
          isWithAddEdit={permission?.add}
          isWithDelete={permission?.delete}
        />

        <Card>
          <div ref={worksheetRef} className=" print:p-5">
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))]">
              {/* left column */}
              <div className="col-span-3 border-r  border-r-gray-300">
                <div
                  className={` h-[13rem] print:h-[16rem]  p-2 gap-6 print:gap-3 grid grid-cols-2 print:pb-4 print:border-b print:border-b-gray-300`}
                >
                  <Heading title={"Season"} text={worksheet?.season?.name} />
                  <Heading
                    title={"Start Date"}
                    text={moment(worksheet?.start_date_time).format(
                      "MMM DD, YYYY hh:mm A"
                    )}
                  />
                  <Heading
                    title={"Instructor"}
                    text={
                      worksheet?.instructor?.first_name +
                      " " +
                      worksheet?.instructor?.last_name
                    }
                  />
                  <Heading
                    title={"Location"}
                    text={worksheet?.location?.name}
                  />
                  <Heading
                    title={"Days of Week(s)"}
                    text={worksheet?.days_of_week}
                  />
                  <Heading
                    title={"Course Code"}
                    text={worksheet?.course_code}
                  />
                </div>

                <div className="h-[3rem] p-2 border-b border-b-gray-300 print:hidden">
                  {worksheet?.status === worksheetStatus?.active &&
                  participantPermission?.add ? (
                    <button
                      onClick={() => setShowAddParticipantModal(true)}
                      className="w-full  flex justify-center items-center gap-3 text-xs p-2 bg-[#f5f5f5]  text-neutral-gray rounded hover:bg-light-info hover:text-accent"
                    >
                      {" "}
                      <FaPlus />
                      <span>Add participant</span>
                    </button>
                  ) : null}
                </div>

                {allParticipants?.map((participant) => (
                  <Participant
                    key={participant?.id}
                    participant={participant}
                    allParticipants={allParticipants}
                    setAllParticipants={setAllParticipants}
                    disabled={
                      worksheet?.status?.toLowerCase() !==
                      worksheetStatus?.active
                    }
                  />
                ))}
              </div>

              {/* middle column */}
              <div className="col-span-1 border-r border-r-gray-300 ">
                <div
                  className={` print:h-[16rem]  flex items-end justify-center w-full ${
                    worksheet?.status?.toLowerCase() === worksheetStatus?.active
                      ? "h-[13rem]"
                      : "h-[16rem]"
                  }`}
                >
                  <p className="text-sm mb-1 print:mb-0">Results</p>
                </div>
                <div className="border-b  border-b-gray-300">
                  {worksheet?.status?.toLowerCase() ===
                  worksheetStatus?.active ? (
                    <div className="grid place-content-center h-[3rem] print:hidden">
                      <button
                        onClick={handleUpdateParticipants}
                        className="inline-block text-neutral-gray text-xs hover:bg-light-info hover:text-accent p-2  bg-[#f5f5f5]  rounded"
                      >
                        {isUpdating ? (
                          <span>Loading...</span>
                        ) : (
                          <span>Update</span>
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                {allParticipants?.map((p) => {
                  const isAllPassed = isAllSkillsSelected(p?.skill_result);

                  return (
                    <ParticipantResult
                      key={p?.id}
                      allParticipants={allParticipants}
                      setAllParticipants={setAllParticipants}
                      isAllPassed={isAllPassed}
                      participant={p}
                      disabled={
                        worksheet?.status?.toLowerCase() !==
                        worksheetStatus?.active
                      }
                    />
                  );
                })}
              </div>

              {/* right column */}
              <div className="col-span-10 ">
                <div className="overflow-x-auto">
                  <div
                    className={` flex gap-2 px-2 h-[13rem]  w-full items-end`}
                  >
                    {skillLabels?.map((skill) => (
                      <SkillHeader
                        text={skill?.name}
                        key={skill?.skill_id}
                        isAssisted={skill?.is_assisted}
                      />
                    ))}
                  </div>

                  <div className="w-full h-[3rem] flex gap-2 p-2 items-center border-b border-b-gray-300">
                    {skillLabels?.map((skill) => {
                      const isAllPassed = isSkillPassedByAll(skill?.skill_id);
                      return (
                        <ToggleOneSkillButton
                          key={skill?.skill_id}
                          allParticipants={allParticipants}
                          setAllParticipants={setAllParticipants}
                          minPassMark={minPassMark}
                          skillId={skill?.skill_id}
                          isAllPassed={isAllPassed}
                          disabled={
                            worksheet?.status?.toLowerCase() !==
                            worksheetStatus?.active
                          }
                        />
                      );
                    })}
                  </div>

                  {allParticipants?.map((p) => (
                    <div
                      key={p?.id}
                      className="w-full flex gap-2 p-2 items-center"
                    >
                      {p?.skill_result?.map((skill) => (
                        <BorderedCheckBox
                          key={`${p?.id}_${skill?.skill_id}`}
                          participant_id={p?.id}
                          skill_id={skill?.skill_id}
                          isChecked={skill?.pass}
                          allParticipants={allParticipants}
                          setAllParticipants={setAllParticipants}
                          minPassMark={minPassMark}
                          disabled={
                            worksheet?.status?.toLowerCase() !==
                            worksheetStatus?.active
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden print:block" style={{ breakBefore: "page" }}>
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
          </div>
        </Card>

        <WorksheetDetailsDrawer
          open={descriptionDrawerOpen}
          setIsOpen={setDescriptionDrawerOpen}
          levelId={worksheet?.level?.id}
        />

        {showDeleteModal ? (
          <ModalPrompt
            actionHandler={() => {
              handleDeleteItem(id);
            }}
            closeModalFunction={() => {
              setShowDeleteModal(false);
            }}
            title={`Delete Worksheet `}
            message={`You are about to delete the worksheet. Note that this action is irreversible`}
            acceptText={`DELETE`}
            rejectText={`CANCEL`}
            loading={deleteLoading}
          />
        ) : null}

        {showAddParticipantModal ? (
          <Modal
            title={`Add New Location`}
            isOpen={showAddParticipantModal}
            modalCloseClick={() => setShowAddParticipantModal(null)}
            // modalHeader={true}
            classes={{
              modalDialog: " max-h-[98vh] w-full h-[98vh]  overflow-auto",
            }}
          >
            <DetailPageHeader
              pageTitle={"Add Participant"}
              cancelFunction={() => setShowAddParticipantModal(false)}
              isLoading={isAddingParticipant}
              submitBtnText="Add Participants"
              submitFunction={handleAddParticipant}
            />

            <WorksheetParticipants
              selectedParticipants={selectedParticipants}
              setSelectedParticipants={setSelectedParticipants}
              hiddenParticipants={allParticipants?.map(
                (item) => item?.participant_id
              )}
            />
          </Modal>
        ) : null}
      </PageWrapper>
    )
  ) : (
    <PermissionWarning />
  );
}
