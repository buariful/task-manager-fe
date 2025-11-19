import { AuthContext } from "Context/Auth";
import { GlobalContext } from "Context/Global";
import moment from "moment";
import { useContext } from "react";
import { LuPencilLine } from "react-icons/lu";
import { Link } from "react-router-dom";
import { supabase } from "Src/supabase";

const ReportTemplateCard = ({ data, setTemplates, role }) => {
  const { state } = useContext(AuthContext);

  const handleToggleStatus = async (e) => {
    try {
      const status = e.target?.checked ? "active" : "inactive";

      setTemplates((prev) =>
        prev?.map((template) => ({
          ...template,
          status: template?.id === data?.id ? status : "inactive",
        }))
      );

      await supabase
        .from("report_card_template")
        .update({ status })
        .eq("id", data?.id)
        .eq("organization_id", state?.organization_id);

      await supabase
        .from("report_card_template")
        .update({ status: "inactive" })
        .eq("organization_id", state?.organization_id)
        .neq("id", data?.id);
    } catch (error) {
      console.log("handleToggleStatus->>", error?.message);
    }
  };

  return (
    <div className="border border-gray-400 p-4 rounded">
      <h2 className="text-lg font-medium text-accent capitalize">
        {data?.name}
      </h2>
      <p className="text-neutral-gray text-xs mt-2 mb-3">
        Last Modified {moment(data?.updated_at).format("MMM DD, YYYY hh:MM A")}
      </p>
      <div className="flex justify-between items-center gap-3">
        {data?.published ? (
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              name=""
              id=""
              className="text-primary ring-0 focus:ring-0 rounded"
              checked={data?.status?.toLowerCase() === "active"}
              onChange={handleToggleStatus}
            />
            <span className="text-sm">Active Template</span>
          </label>
        ) : (
          <span className="text-accent bg-gray-300 text-xs rounded-full px-4 py-1">
            Draft
          </span>
        )}

        <Link
          to={`/${role}/edit-template/${data?.id}`}
          className="text-neutral-gray hover:text-primary text-base"
        >
          {" "}
          <LuPencilLine />
        </Link>
      </div>
    </div>
  );
};

export default ReportTemplateCard;
