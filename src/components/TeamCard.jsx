import React from "react";

const TeamCard = ({ team, onAddMember }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
        <button
          onClick={() => onAddMember(team._id)}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          + Add Member
        </button>
      </div>
      <div className="space-y-3">
        {team.members.length === 0 ? (
          <p className="text-gray-500 italic">No members yet.</p>
        ) : (
          team.members.map((member, index) => (
            <div
              key={member._id || index}
              className="flex justify-between items-center border-b pb-2 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-700">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-bold ${
                    (member.currentTasks || 0) > member.capacity
                      ? "text-red-500"
                      : "text-gray-600"
                  }`}
                >
                  {member.currentTasks || 0} / {member.capacity}
                </span>
                <p className="text-xs text-gray-400">Load</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamCard;
