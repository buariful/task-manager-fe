import React from "react";
import { AdministratorNavBar } from "Components/NavBar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { InteractiveButton } from "Components/InteractiveButton";
import { IoFilterCircle } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { GlobalContext, showToast } from "Context/Global";
import { supabase } from "Src/supabase";
import { AuthContext } from "Context/Auth";
import { useContext } from "react";
import { worksheetStatus } from "Utils/utils";
import {
  PublishedReportCardList,
  ReportTemplateList,
  ReportWorksheetList,
} from "Components/Report";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const tabs = [
  { label: "In Review", value: worksheetStatus?.inReview },
  { label: "Published", value: worksheetStatus?.published },
  { label: "Templates", value: "templates" },
];

const primaryFilters = {
  name: "",
  levelIds: [],
  instructorIds: [],
  modified_at_after: "",
  modified_at_before: "",
  locationIds: [],
  seasonIds: [],
  days_of_week: [],
  start_date_after: "",
  start_date_before: "",
};

const AdministratorReportListPage = () => {
  const { state } = useContext(AuthContext);

  const [selectedCards, setSelectedCards] = React.useState([]);
  const [isWorsheetFilterDrawerOpen, setIsWorsheetFilterDrawerOpen] =
    React.useState(false);
  const [filters, setFilters] = React.useState(primaryFilters);
  const [selectedTab, setSelectedTab] = React.useState(
    worksheetStatus?.inReview
  );
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);
  const navigate = useNavigate();
  const publishedReportRef = useRef();

  const schema = yup
    .object({
      searchText: yup.string(),
    })
    .required();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleTabClick = (value) => {
    try {
      setSelectedTab(value);
    } catch (error) {
      console.log("handleTabClick->>", error?.message);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const ids = selectedCards?.map((card) => card?.id);

      const { error } = await supabase
        .from("worksheet_participant_map")
        .update({
          status: "withdrawn",
          updated_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) throw Error("Failed to withdraw");

      setSelectedCards([]);
      showToast(globalDispatch, "Withdrawn successful");
      publishedReportRef?.current?.refetchPublishedReports();
    } catch (error) {
      console.log(error?.message);
      showToast(globalDispatch, "Failed to withdraw", 3000, "error");
    }
    setWithdrawLoading(false);
  };

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "report",
      },
    });
  }, []);

  return (
    <div className="">
      <AdministratorNavBar />

      <div className="px-7">
        {/* Bottom search bar */}
        <div className="flex mb-7 items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="flex items-center">
              {tabs?.map((tab) => (
                <InteractiveButton
                  key={tab.value}
                  className={`!text-base font-normal !px-10 !border-0 ${
                    selectedTab === tab.value
                      ? "!bg-[#D9D9D9] !text-accent"
                      : "!bg-[#F5F5F5] !text-[#B3B3B3]"
                  }`}
                  onClick={() => handleTabClick(tab.value)}
                >
                  {tab.label}
                </InteractiveButton>
              ))}
            </div>

            {selectedTab !== "templates" ? (
              <InteractiveButton
                type={"button"}
                isSecondaryBtn={true}
                onClick={() => setIsWorsheetFilterDrawerOpen(true)}
              >
                <p className="flex items-center gap-2">
                  <span>Filter</span>
                  <IoFilterCircle className="text-secondary" size={25} />
                </p>
              </InteractiveButton>
            ) : null}
          </div>

          <div>
            {selectedCards?.length ? (
              <InteractiveButton
                type={"button"}
                className={`!px-5`}
                loading={withdrawLoading}
                onClick={handleWithdraw}
              >
                <span>Withdraw Report Cards</span>
              </InteractiveButton>
            ) : null}
            {selectedTab === "templates" ? (
              <InteractiveButton
                type={"button"}
                onClick={() => navigate("/administrator/add-template")}
              >
                <span className="flex items-center gap-2">
                  <FaPlus />
                  <span>New Template</span>
                </span>
              </InteractiveButton>
            ) : null}
          </div>
        </div>

        {/* Content */}
        {selectedTab === worksheetStatus?.inReview ? (
          <ReportWorksheetList
            filters={filters}
            setFilters={setFilters}
            isFilterDrawerOpen={isWorsheetFilterDrawerOpen}
            setIsFilterDrawerOpen={setIsWorsheetFilterDrawerOpen}
            role="administrator"
          />
        ) : selectedTab === "templates" ? (
          <ReportTemplateList role="administrator" />
        ) : null}

        <div
          style={{
            display:
              selectedTab === worksheetStatus?.published ? "block" : "none",
          }}
        >
          <PublishedReportCardList
            filters={filters}
            setFilters={setFilters}
            isFilterDrawerOpen={isWorsheetFilterDrawerOpen}
            setIsFilterDrawerOpen={setIsWorsheetFilterDrawerOpen}
            role="administrator"
            selectedCards={selectedCards}
            setSelectedCards={setSelectedCards}
            ref={publishedReportRef}
          />
        </div>
      </div>
    </div>
  );
};

export default AdministratorReportListPage;
