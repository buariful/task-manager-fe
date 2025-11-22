import React from "react";

const TaskCard = ({ task, teamMembers, onEdit, onDelete }) => {
  let assignedMember = null;
  if (task.assignedTo && typeof task.assignedTo === "object") {
    assignedMember = task.assignedTo;
  } else if (task.assignedTo) {
    assignedMember = teamMembers.find(
      (m) => m._id === task.assignedTo || m.id === parseInt(task.assignedTo)
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-green-500 text-white";
      case "In Progress":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-300 text-gray-800";
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 mb-2 border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">{task.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
              task.status
            )}`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Assigned to: </span>
          {assignedMember ? (
            <span>{assignedMember.name}</span>
          ) : (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </div>

        {/* Actions could go here if needed, e.g. Edit/Delete */}
      </div>
    </div>
  );
};

export default TaskCard;
