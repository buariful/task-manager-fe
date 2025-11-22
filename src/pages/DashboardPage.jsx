import React, { useState, useEffect } from "react";
import ActivityLog from "../components/ActivityLog";

import MkdSDK from "../utils/MkdSDK";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
  });
  const [teams, setTeams] = useState([]);
  const [logs, setLogs] = useState([]);
  const [reassignResult, setReassignResult] = useState(null);
  const sdk = new MkdSDK();

  const fetchData = async () => {
    try {
      const projectsRes = await sdk.getProjects();
      const tasksRes = await sdk.getTasks(); // Fetch all tasks (might need adjustment if getTasks requires projectId)
      // Note: getTasks in backend currently filters by projectId if provided, otherwise returns all tasks created by user.
      // So calling sdk.getTasks() without args should return all tasks.

      const projects = projectsRes.success ? projectsRes.data : [];
      const tasks = tasksRes.success ? tasksRes.data : [];

      // Logs are not yet implemented in backend
      const logsData = [];

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
      });
      setLogs(logsData);

      const teamsRes = await sdk.getTeams();
      if (teamsRes.success) {
        setTeams(teamsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReassign = async () => {
    try {
      const result = await sdk.reassignTasks();
      if (result.success) {
        setReassignResult(result.message);
        fetchData();
      }
    } catch (error) {
      console.error("Error reassigning tasks:", error);
      setReassignResult("Failed to reassign tasks.");
    }

    // Clear message after 3 seconds
    setTimeout(() => setReassignResult(null), 3000);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">
            Total Projects
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            {stats.totalProjects}
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-bold uppercase">
            Total Tasks
          </h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded shadow flex flex-col justify-center items-center">
          <button
            onClick={handleReassign}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded shadow w-full"
          >
            ⚡ Reassign Tasks
          </button>
          {reassignResult && (
            <p className="text-green-600 text-sm mt-2 font-medium animate-pulse">
              {reassignResult}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Workload Summary */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Team Workload
          </h3>
          <div className="space-y-6">
            {teams.map((team) => (
              <div key={team._id}>
                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">
                  {team.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.map((member, index) => (
                    <div
                      key={member._id || index}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                (member.currentTasks || 0) > member.capacity
                                  ? "bg-red-600"
                                  : "bg-blue-600"
                              }`}
                              style={{
                                width: `${Math.min(
                                  ((member.currentTasks || 0) /
                                    member.capacity) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-bold ${
                              (member.currentTasks || 0) > member.capacity
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {member.currentTasks || 0}/{member.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {team.members.length === 0 && (
                    <p className="text-gray-400 text-sm italic">No members</p>
                  )}
                </div>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-gray-500 italic">No teams available.</p>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-1">
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
