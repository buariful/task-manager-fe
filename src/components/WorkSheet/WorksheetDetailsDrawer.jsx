import { Drawer } from "Components/Drawer";
import { FullPageLoader } from "Components/FullPageLoader";
import { AuthContext } from "Context/Auth";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import { FiUsers } from "react-icons/fi";
import { supabase } from "Src/supabase";

const Content = ({ title, description, isAssisted }) => {
  return (
    <div className="mb-3">
      <p className="text-xl capitalize mb-1 flex items-center gap-2">
        <span>{title}</span>{" "}
        {isAssisted ? <FiUsers className="text-neutral-gray" /> : null}
      </p>
      <p className="text-base">{description}</p>
    </div>
  );
};

export default function WorksheetDetailsDrawer({ open, setIsOpen, levelId }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { state } = useContext(AuthContext);
  const [data, setData] = useState(null);

  const getData = async () => {
    setIsLoading(true);
    try {
      // fetching from level table to filter with organization id
      const { data, error } = await supabase
        .from("level")
        .select(
          `id, name,level_skill_map (skill:skill_id (*,skill_category:category_id (
          id,
          name
        )))`
        )
        .eq("id", levelId)
        .eq("organization_id", state?.organization_id)
        .single();

      setData(data);
    } catch (error) {
      console.log(error?.message);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (levelId) {
      getData();
    }
  }, [levelId]);

  return (
    <Drawer open={open} setOpen={setIsOpen} title={"Worksheet Description"}>
      {isLoading ? (
        <FullPageLoader />
      ) : (
        <>
          {data?.level_skill_map?.map((skill) => (
            <Content
              key={skill?.skill?.id}
              description={skill?.skill?.description}
              isAssisted={skill?.skill?.type === 1}
              title={skill?.skill?.name}
            />
          ))}
        </>
      )}
    </Drawer>
  );
}
