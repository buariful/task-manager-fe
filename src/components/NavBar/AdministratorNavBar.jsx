import { GlobalContext } from "Context/Global";
import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const links = [
  { label: "Dashboard", link: "/administrator/dashboard", key: "dashboard" },
  { label: "Levels", link: "/administrator/level", key: "level" },
  { label: "Skills", link: "/administrator/skill", key: "skill" },
  { label: "Worksheets", link: "/administrator/worksheet", key: "worksheet" },
  { label: "Report Card", link: "/administrator/report", key: "report" },
  {
    label: "Participants",
    link: "/administrator/participant",
    key: "participant",
  },
  { label: "User Management", link: "/administrator/user", key: "user" },
  { label: "Analytics", link: "/administrator/analytic", key: "analytic" },
];

export default function AdministratorNavBar() {
  const { state, labels } = React.useContext(GlobalContext);
  const [menuLinks, setMenuLinks] = React.useState(links);

  useEffect(() => {
    if (labels?.dashboard) {
      const linkModified = [
        {
          label: labels?.dashboard || "Dashboard",
          link: "/administrator/dashboard",
          key: "dashboard",
        },
        {
          label: labels?.level || "Levels",
          link: "/administrator/level",
          key: "level",
        },
        {
          label: labels?.skill || "Skills",
          link: "/administrator/skill",
          key: "skill",
        },
        {
          label: labels?.worksheet || "Worksheets",
          link: "/administrator/worksheet",
          key: "worksheet",
        },
        {
          label: labels?.report_card || "Report Card",
          link: "/administrator/report",
          key: "report",
        },
        {
          label: labels?.participant || "Participants",
          link: "/administrator/participant",
          key: "participant",
        },
        {
          label: labels?.user || "User Management",
          link: "/administrator/user",
          key: "user",
        },
        {
          label: labels?.analytics || "Analytics",
          link: "/administrator/analytic",
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
        {menuLinks?.map((item, i) => (
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
        ))}
      </nav>
    </div>
  );
}
