import React from "react";

const ActivityLog = ({ logs }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Activity Log</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">No activity yet.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-1">
              <p className="text-sm text-gray-800">{log.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
