import React from "react";
import { AuthContext, tokenExpireError } from "Context/Auth";
import MkdSDK from "Utils/MkdSDK";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "Context/Global";
import { AddButton } from "Components/AddButton";
import Skeleton from "react-loading-skeleton";

let sdk = new MkdSDK();

const columns = [
  {
    header: "Action",
    accessor: "",
  },
  {
    header: "ID",
    accessor: "id",
  },
  {
    header: "Email Type",
    accessor: "slug",
  },
  {
    header: "Subject",
    accessor: "subject",
  },
  {
    header: "Tags",
    accessor: "tag",
  },
];

const AdminEmailListPage = () => {
  const { dispatch } = React.useContext(AuthContext);
  const [data, setCurrentTableData] = React.useState([]);
  const [loadingData, setLoadingData] = React.useState(false);
  const navigate = useNavigate();

  const { dispatch: globalDispatch } = React.useContext(GlobalContext);

  async function getData() {
    try {
      sdk.setTable("email");
      const result = await sdk.callRestAPI({}, "GETALL");

      const { list } = result;

      setCurrentTableData(list);
    } catch (error) {
      console.log("ERROR", error);
      tokenExpireError(dispatch, error.message);
    }
  }

  React.useEffect(() => {
    globalDispatch({
      type: "SETPATH",
      payload: {
        path: "emails",
      },
    });

    (async function () {
      setLoadingData(true);
      await getData();
      setLoadingData(false);
    })();
  }, []);

  return (
    <>
      <div className="overflow-x-auto  rounded  p-10 ">
        <div className="mb-3 flex w-full justify-between text-center  ">
          <h4 className="text-2xl font-medium">Emails </h4>
          <AddButton link={"/admin/add-email"} />
        </div>
        <div className="overflow-x-auto  ">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#E6E6E6]">
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-[600] uppercase tracking-wider"
                  >
                    {column.header}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " ▼"
                          : " ▲"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0000001A]">
              {data.length == 0 ? (
                <tr>
                  <td colSpan={5}>{loadingData && <Skeleton count={4} />}</td>
                </tr>
              ) : null}
              {data.map((row, i) => {
                return (
                  <tr key={i} className="text-xs">
                    {columns.map((cell, index) => {
                      if (cell.accessor == "") {
                        return (
                          <td
                            key={index}
                            className="whitespace-nowrap px-6 py-3"
                          >
                            <button
                              className="text-xs "
                              onClick={() => {
                                navigate("/admin/edit-email/" + row.id, {
                                  state: row,
                                });
                              }}
                            >
                              {" "}
                              Edit
                            </button>
                          </td>
                        );
                      }
                      if (cell.mapping) {
                        return (
                          <td
                            key={index}
                            className="whitespace-nowrap px-6 py-3"
                          >
                            {cell.mapping[row[cell.accessor]]}
                          </td>
                        );
                      }
                      return (
                        <td key={index} className="whitespace-nowrap px-6 py-3">
                          {row[cell.accessor]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminEmailListPage;
