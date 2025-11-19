import { SearchInput } from "Components/SearchInput";
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import { PageWrapper } from "Components/PageWrapper";
import { MkdListTable } from "Components/MkdListTable";
import { Pagination } from "Components/Pagination";
import { Card } from "Components/Card";
import { HiOutlineXMark } from "react-icons/hi2";
import { supabase } from "Src/supabase";
import { useContext } from "react";
import { AuthContext } from "Context/Auth";

const columns = [
  {
    header: "",
    accessor: "id",
    select: true,
  },
  { header: "Unique ID", accessor: "unique_id" },
  { header: "First Name", accessor: "first_name" },
  { header: "Last Name", accessor: "last_name" },
  { header: "Email", accessor: "parent_email" },
  { header: "Contact", accessor: "contact_number" },
];

const schema = yup
  .object({
    searchText: yup.string(),
  })
  .required();

export default function WorksheetParticipants({
  selectedParticipants = [],
  setSelectedParticipants = () => {},
  hiddenParticipants = [],
}) {
  const { state } = useContext(AuthContext);

  const [isFetching, setIsFetching] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [filters, setFilters] = useState({});

  const [pageSize, setPageSize] = React.useState(10);
  const [pageCount, setPageCount] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [currentPage, setPage] = React.useState(1);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const getData = async ({ page = 1, limit = 10, filters = {} }) => {
    setIsFetching(true);
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("participant")
        .select("*", { count: "exact" }) // fetch count too
        .eq("organization_id", state?.organization_id)
        .not("id", "in", `(${hiddenParticipants.join(",")})`);

      // Apply filters
      if (filters?.name) {
        query = query.or(
          `first_name.ilike.%${filters?.name}%,last_name.ilike.%${filters?.name}%`
        );
      }

      query = query.range(from, to).order("id", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      setPageSize(limit);
      setPageCount(Math.ceil((count || 0) / limit));
      setTotalRecords(count || 0);
      setPage(page);
      setParticipants(data);
    } catch (error) {
      console.error(error);
    }
    setIsFetching(false);
  };

  const handleRemoveParticipant = async (id) => {
    try {
      setSelectedParticipants((prev) =>
        prev?.filter((item) => item?.id !== id)
      );
    } catch (error) {
      console.log("handleRemoveParticpant->>", error?.message);
    }
  };

  const onSubmit = (data) => {
    getData({
      page: currentPage,
      limit: pageSize,
      filters: { name: data?.name },
    });
    setFilters((prev) => ({ ...prev, name: data?.name }));
  };

  const handlePagination = (page) => {
    try {
      getData({ page, limit: pageSize, filters });
    } catch (error) {
      console.log("handlePagination->>", error?.message);
    }
  };

  useEffect(() => {
    getData({ page: currentPage, limit: pageSize, filters: {} });
  }, []);

  return (
    <div>
      <Card className={"!p-4 mb-5"}>
        <form className=" " onSubmit={handleSubmit(onSubmit)}>
          <SearchInput
            errors={errors}
            register={register}
            name={"name"}
            placeholder={"Search by Participant Name"}
            parentClassName="max-w-xl"
          />
        </form>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-8">
          {/* table */}
          <MkdListTable
            columns={columns}
            tableRole={"administrator"}
            table={"participant"}
            actionId={"id"}
            loading={isFetching}
            currentTableData={participants}
            setCurrentTableData={setParticipants}
            actions={{ select: true }}
            selectedItems={selectedParticipants}
            setSelectedItems={setSelectedParticipants}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            totalRecords={totalRecords}
            limit={pageSize}
            onPageChange={handlePagination}
          />
        </div>
        <div className="col-span-12 md:col-span-4 bg-white shadow p-2 rounded-sm">
          {" "}
          <h3 className="mb-4">Selected Participants</h3>
          {selectedParticipants?.map((sp, i) => (
            <div key={i} className="flex items-center gap-3 justify-between">
              <span>
                {sp?.first_name} {sp?.last_name}
              </span>
              <button
                onClick={() => handleRemoveParticipant(sp?.id)}
                className="text-accent hover:text-red-500"
              >
                <HiOutlineXMark />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
