import React from "react";
import { UserNavBar } from "Components/NavBar";
import { SearchInput } from "Components/SearchInput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { IoFilterCircle } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { MkdListTable } from "Components/MkdListTable";
import { PaginationBar } from "Components/PaginationBar";
import { GlobalContext } from "Context/Global";
import { PageWrapper } from "Components/PageWrapper";
import {
  AnalyticsTab,
  InstructorAnalytics,
  LevelAnalytics,
  LocationAnalytics,
  ReportAnalytics,
  SkillAnalytics,
} from "Components/Analytics";

const UserAnalyticsPage = () => {
  const [selectedTab, setSelectedTab] = React.useState(1);

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "analytic",
      },
    });
  }, []);

  return (
    <PageWrapper>
      <UserNavBar />

      <AnalyticsTab
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        className="mb-5"
      />

      {selectedTab === 1 ? (
        <ReportAnalytics />
      ) : selectedTab === 2 ? (
        <LevelAnalytics />
      ) : selectedTab === 3 ? (
        <InstructorAnalytics />
      ) : selectedTab === 4 ? (
        <LocationAnalytics />
      ) : selectedTab === 5 ? (
        <SkillAnalytics />
      ) : null}
    </PageWrapper>
  );
};

export default UserAnalyticsPage;
