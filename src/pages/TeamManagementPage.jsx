import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdInput from "../components/MkdInput/MkdInput";
import TeamCard from "../components/TeamCard";
import { MockDataService } from "../utils/MockDataService";

const teamSchema = yup
  .object({
    name: yup.string().required("Team Name is required"),
  })
  .required();

const memberSchema = yup
  .object({
    name: yup.string().required("Name is required"),
    role: yup.string().required("Role is required"),
    capacity: yup.number().min(1).max(5).required("Capacity is required (1-5)"),
  })
  .required();

const TeamManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Team Form
  const {
    register: registerTeam,
    handleSubmit: handleSubmitTeam,
    reset: resetTeam,
    formState: { errors: teamErrors },
  } = useForm({
    resolver: yupResolver(teamSchema),
  });

  // Member Form
  const {
    register: registerMember,
    handleSubmit: handleSubmitMember,
    reset: resetMember,
    formState: { errors: memberErrors },
  } = useForm({
    resolver: yupResolver(memberSchema),
  });

  const fetchTeams = () => {
    setTeams([...MockDataService.getTeams()]);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const onAddTeam = (data) => {
    MockDataService.addTeam(data.name);
    resetTeam();
    setShowAddTeam(false);
    fetchTeams();
  };

  const onAddMember = (data) => {
    MockDataService.addMemberToTeam(
      selectedTeamId,
      data.name,
      data.role,
      data.capacity
    );
    resetMember();
    setSelectedTeamId(null);
    fetchTeams();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Team Management</h1>
        <button
          onClick={() => setShowAddTeam(!showAddTeam)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          {showAddTeam ? "Cancel" : "+ Create Team"}
        </button>
      </div>

      {/* Add Team Form */}
      {showAddTeam && (
        <div className="bg-white p-6 rounded shadow mb-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Create New Team</h2>
          <form onSubmit={handleSubmitTeam(onAddTeam)}>
            <MkdInput
              name="name"
              label="Team Name"
              register={registerTeam}
              errors={teamErrors}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
            >
              Create Team
            </button>
          </form>
        </div>
      )}

      {/* Add Member Modal/Form Overlay */}
      {selectedTeamId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Member</h2>
            <form onSubmit={handleSubmitMember(onAddMember)}>
              <MkdInput
                name="name"
                label="Member Name"
                register={registerMember}
                errors={memberErrors}
              />
              <MkdInput
                name="role"
                label="Role"
                register={registerMember}
                errors={memberErrors}
              />
              <MkdInput
                name="capacity"
                label="Capacity (1-5)"
                type="number"
                register={registerMember}
                errors={memberErrors}
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTeamId(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-1/2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-1/2"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onAddMember={(id) => setSelectedTeamId(id)}
          />
        ))}
      </div>

      {teams.length === 0 && !showAddTeam && (
        <div className="text-center text-gray-500 mt-10">
          <p>No teams found. Create one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;
