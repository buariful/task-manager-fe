import { Spinner } from "Assets/svgs";
import { Card } from "Components/Card";
import { ToggleButton } from "Components/ToggleButton";
import moment from "moment";
import React from "react";
import { useState } from "react";
import { FaGripVertical } from "react-icons/fa6";
import { supabase } from "Src/supabase";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GlobalContext, showToast } from "Context/Global";
import { useContext } from "react";
import { InteractiveButton } from "Components/InteractiveButton";

const Skill = ({ data, setSkills, hasEditPermission }) => {
  const [isLoading, setIsLoading] = useState(false);

  // DND KIT — make the row draggable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: data.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggleSkill = async (value) => {
    setIsLoading(true);
    try {
      await supabase
        .from("level_skill_map")
        .update({ is_required: value, updated_at: new Date().toISOString() })
        .eq("id", data?.id);

      setSkills((prev) =>
        prev?.map((item) =>
          item.id === data.id ? { ...item, is_required: value } : item
        )
      );
    } catch (error) {
      console.log(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3">
      {/* drag handle */}
      <FaGripVertical
        className="text-xl cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      />

      <div className="bg-input-bg rounded flex-1 flex items-center gap-3 justify-between p-2">
        <p className="flex items-center gap-1 text-accent">
          {data?.skill?.name}
        </p>

        <div>
          {isLoading ? (
            <Spinner size={20} />
          ) : (
            <ToggleButton
              value={data?.is_required}
              onChangeFunction={handleToggleSkill}
              disabled={!hasEditPermission}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default function LevelDetailsSkillList({
  skills,
  setSkills,
  updatedAt,
  hasEditPermission,
}) {
  const { dispatch: globalDispatch } = useContext(GlobalContext);

  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = skills.findIndex((item) => item.id === active.id);
    const newIndex = skills.findIndex((item) => item.id === over.id);

    const newOrder = arrayMove(skills, oldIndex, newIndex);

    setSkills(newOrder);
    setIsEdited(true);
  };

  const saveSkillOrder = async () => {
    if (!isEdited) return; // nothing changed
    setIsSaving(true);
    try {
      const updates = skills.map((item, index) => ({
        id: item.id,
        serial: index + 1,
      }));

      // bulk update with PostgREST upsert
      const { error } = await supabase.from("level_skill_map").upsert(updates);

      if (error) throw error;
      showToast(globalDispatch, "Changes saved.");
      setIsEdited(false);
    } catch (error) {
      console.log("Order update error:", error?.message);
      showToast(globalDispatch, "Changes saved.", 3000, "error");
    }
    setIsSaving(false);
  };

  // const handleDragEnd = async (event) => {
  //   const { active, over } = event;

  //   if (!over || active.id === over.id) return;

  //   const oldIndex = skills.findIndex((item) => item.id === active.id);
  //   const newIndex = skills.findIndex((item) => item.id === over.id);

  //   const newOrder = arrayMove(skills, oldIndex, newIndex);

  //   setSkills(newOrder);

  //   // optional: update DB for new serial
  //   try {
  //     for (let i = 0; i < newOrder.length; i++) {
  //       await supabase
  //         .from("level_skill_map")
  //         .update({ serial: i + 1 })
  //         .eq("id", newOrder[i].id);
  //     }
  //   } catch (error) {
  //     console.log("Order update error:", error.message);
  //   }
  // };

  return (
    <Card>
      <div className="flex justify-between items-center gap-5 mb-5">
        <h3>Skills ({skills.length})</h3>
        <p>{moment(updatedAt).format("MMM DD, YYYY hh:MM A")}</p>
      </div>

      <div className="flex justify-end mb-3">
        <p>Required Skill</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={skills.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {skills.map((item) => (
              <Skill
                key={item.id}
                data={item}
                setSkills={setSkills}
                hasEditPermission={hasEditPermission}
              />
            ))}
            {isEdited ? (
              <InteractiveButton loading={isSaving} onClick={saveSkillOrder}>
                Save Changes
              </InteractiveButton>
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
    </Card>
  );
}
