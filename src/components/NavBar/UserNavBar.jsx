import { useUserViewPermissions } from "Context/Custom";
import { GlobalContext } from "Context/Global";
import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const links = [
  { label: "Dashboard", link: "/user/dashboard", key: "dashboard" },
  { label: "Levels", link: "/user/level", key: "level" },
  { label: "Skills", link: "/user/skill", key: "skill" },
  { label: "Worksheets", link: "/user/worksheet", key: "worksheet" },
  { label: "Report Card", link: "/user/report", key: "report card" },
  {
    label: "Participants",
    link: "/user/participant",
    key: "participant",
  },
  { label: "User Management", link: "/user/user", key: "user" },
  { label: "Analytics", link: "/user/analytic", key: "analytic" },
];

export default function UserNavBar() {
  const { state, labels } = React.useContext(GlobalContext);
  const [menuLinks, setMenuLinks] = React.useState(links);
  const viewPermissions = useUserViewPermissions();

  useEffect(() => {
    if (labels?.dashboard) {
      const linkModified = [
        {
          label: labels?.dashboard || "Dashboard",
          link: "/user/dashboard",
          key: "dashboard",
        },
        {
          label: labels?.level || "Levels",
          link: "/user/level",
          key: "level",
        },
        {
          label: labels?.skill || "Skills",
          link: "/user/skill",
          key: "skill",
        },
        {
          label: labels?.worksheet || "Worksheets",
          link: "/user/worksheet",
          key: "worksheet",
        },
        {
          label: labels?.report_card || "Report Card",
          link: "/user/report",
          key: "report card",
        },
        {
          label: labels?.participant || "Participants",
          link: "/user/participant",
          key: "participant",
        },
        {
          label: labels?.user || "User Management",
          link: "/user/user",
          key: "user",
        },
        {
          label: labels?.analytics || "Analytics",
          link: "/user/analytic",
          key: "analytic",
        },
      ];

      setMenuLinks(linkModified);
    }
  }, [labels]);

  return (
    <div className="mb-7">
      {/* Navigation Tabs */}
      <nav className="flex gap-5 px-6  text-sm bg-white text-gray-600 ">
        {menuLinks?.map((item, i) =>
          viewPermissions?.includes(item?.key) ? (
            <Link
              key={i}
              className={`relative py-1 px-4 border-b-2 border-transparent   transition text-neutral hover:text-neutral-default hover:border-neutral-default text-xl 
                ${
                  state.path === item.key ? "border-b-primary text-primary" : ""
                }`}
              to={item.link}
            >
              {item.label}
            </Link>
          ) : null
        )}
      </nav>
    </div>
  );
}
