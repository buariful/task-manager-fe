import React from "react";
import ReportTemplateCard from "./ReportTemplateCard";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import { Spinner } from "Assets/svgs";

export default function ReportTemplateList({ role = "user" }) {
  const { state } = useContext(AuthContext);

  const [templates, setTemplates] = React.useState([]);
  const [isTemplateFetching, setIsTemplateFetching] = React.useState([]);

  const fetchTemplates = async () => {
    setIsTemplateFetching(true);
    try {
      const { data } = await supabase
        .from("report_card_template")
        .select("*")
        .eq("organization_id", state?.organization_id)
        .order("id", { ascending: false });

      setTemplates(data);
    } catch (error) {
      console.log("fetchTemplates->>", error?.message);
    }
    setIsTemplateFetching(false);
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div>
      {isTemplateFetching ? (
        <div className="grid place-content-center">
          <Spinner size={100} />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5 md:gap-8 md:grid-cols-4">
          {templates?.map((template) => (
            <ReportTemplateCard
              key={template?.id}
              data={template}
              setTemplates={setTemplates}
              role={role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
