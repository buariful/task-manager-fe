import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import MkdInput from "../components/MkdInput/MkdInput";
import TaskCard from "../components/TaskCard";
import { MockDataService } from "../utils/MockDataService";

const projectSchema = yup
  .object({
    name: yup.string().required("Project Name is required"),
    teamId: yup.string().required("Team is required"),
  })
  .required();

const taskSchema = yup
  .object({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    priority: yup.string().required("Priority is required"),
    assignedTo: yup.string().nullable(),
  })
  .required();

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Warning State
  const [capacityWarning, setCapacityWarning] = useState(null); // { memberName, current, capacity }

  // Project Form
  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    reset: resetProject,
    formState: { errors: projectErrors },
  } = useForm({
    resolver: yupResolver(projectSchema),
  });

  // Task Form
  const {
    register: registerTask,
    handleSubmit: handleSubmitTask,
    reset: resetTask,
    watch: watchTask,
    setValue: setTaskValue,
    formState: { errors: taskErrors },
  } = useForm({
    resolver: yupResolver(taskSchema),
  });

  const assignedMemberId = watchTask("assignedTo");

  const fetchData = () => {
    setProjects([...MockDataService.getProjects()]);
    setTeams([...MockDataService.getTeams()]);
    setTasks([...MockDataService.getTasks()]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check capacity when assignee changes
  useEffect(() => {
    if (assignedMemberId && selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        const teamMembers = MockDataService.getTeamMembers(project.teamId);
        const member = teamMembers.find(
          (m) => m.id === parseInt(assignedMemberId)
        );
        if (member && member.currentTasks >= member.capacity) {
          setCapacityWarning({
            memberName: member.name,
            current: member.currentTasks,
            capacity: member.capacity,
          });
        } else {
          setCapacityWarning(null);
        }
      }
    } else {
      setCapacityWarning(null);
    }
  }, [assignedMemberId, selectedProjectId, projects]);

  const onAddProject = (data) => {
    MockDataService.addProject(data.name, parseInt(data.teamId));
    resetProject();
    setShowAddProject(false);
    fetchData();
  };

  const onAddTask = (data) => {
    // If warning exists and user hasn't confirmed (we can just let them submit for "Assign Anyway" as per requirements)
    // The requirement says: "Show warning... Options: [Assign Anyway] or [Choose Another]"
    // Here, clicking submit IS "Assign Anyway". We just show the warning visually.

    MockDataService.addTask({
      ...data,
      projectId: selectedProjectId,
      assignedTo: data.assignedTo ? parseInt(data.assignedTo) : null,
    });
    resetTask();
    setShowAddTask(false);
    setCapacityWarning(null);
    fetchData();
  };

  const getProjectTasks = (projectId) => {
    return tasks.filter((t) => t.projectId === projectId);
  };

  const getProjectTeamMembers = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    return MockDataService.getTeamMembers(project.teamId);
  };

  const autoAssign = () => {
    const members = getProjectTeamMembers(selectedProjectId);
    if (members.length === 0) return;

    // Find member with least load
    const sortedMembers = [...members].sort(
      (a, b) => a.currentTasks - b.currentTasks
    );
    const bestMember = sortedMembers[0];

    if (bestMember) {
      setTaskValue("assignedTo", bestMember.id.toString());
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
        <button
          onClick={() => setShowAddProject(!showAddProject)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          {showAddProject ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {/* Add Project Form */}
      {showAddProject && (
        <div className="bg-white p-6 rounded shadow mb-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Create New Project</h2>
          <form onSubmit={handleSubmitProject(onAddProject)}>
            <MkdInput
              name="name"
              label="Project Name"
              register={registerProject}
              errors={projectErrors}
            />
            <MkdInput
              name="teamId"
              label="Assign Team"
              type="select"
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
              register={registerProject}
              errors={projectErrors}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
            >
              Create Project
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Project List */}
        <div className="lg:col-span-1 space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`p-4 rounded cursor-pointer shadow-sm transition-colors ${
                selectedProjectId === project.id
                  ? "bg-blue-100 border-l-4 border-blue-500"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <h3 className="font-bold text-gray-800">{project.name}</h3>
              <p className="text-xs text-gray-500">
                Team:{" "}
                {teams.find((t) => t.id === project.teamId)?.name || "Unknown"}
              </p>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500 italic">No projects yet.</p>
          )}
        </div>

        {/* Main Area: Tasks */}
        <div className="lg:col-span-3">
          {selectedProjectId ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {projects.find((p) => p.id === selectedProjectId)?.name} Tasks
                </h2>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
                >
                  + Add Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getProjectTasks(selectedProjectId).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    teamMembers={getProjectTeamMembers(selectedProjectId)}
                  />
                ))}
                {getProjectTasks(selectedProjectId).length === 0 && (
                  <p className="text-gray-500 italic col-span-2 text-center py-10">
                    No tasks in this project.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded shadow border-dashed border-2 border-gray-300">
              <p className="text-gray-500 text-lg">
                Select a project to view tasks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && selectedProjectId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <form onSubmit={handleSubmitTask(onAddTask)}>
              <MkdInput
                name="title"
                label="Task Title"
                register={registerTask}
                errors={taskErrors}
              />
              <MkdInput
                name="description"
                label="Description"
                type="textarea"
                rows={3}
                register={registerTask}
                errors={taskErrors}
              />
              <div className="grid grid-cols-2 gap-4">
                <MkdInput
                  name="priority"
                  label="Priority"
                  type="select"
                  options={[
                    { value: "Low", label: "Low" },
                    { value: "Medium", label: "Medium" },
                    { value: "High", label: "High" },
                  ]}
                  register={registerTask}
                  errors={taskErrors}
                />
                <div className="relative">
                  <MkdInput
                    name="assignedTo"
                    label="Assign Member"
                    type="select"
                    options={getProjectTeamMembers(selectedProjectId).map(
                      (m) => ({
                        value: m.id,
                        label: `${m.name} (${m.currentTasks}/${m.capacity})`,
                      })
                    )}
                    register={registerTask}
                    errors={taskErrors}
                  />
                  <button
                    type="button"
                    onClick={autoAssign}
                    className="absolute top-0 right-0 text-xs text-blue-500 hover:underline mt-1"
                  >
                    Auto-assign
                  </button>
                </div>
              </div>

              {capacityWarning && (
                <div
                  className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
                  role="alert"
                >
                  <p className="font-bold">Warning</p>
                  <p>
                    {capacityWarning.memberName} has {capacityWarning.current}{" "}
                    tasks but capacity is {capacityWarning.capacity}. Assign
                    anyway?
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false);
                    setCapacityWarning(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-1/2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-1/2"
                >
                  {capacityWarning ? "Assign Anyway" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagementPage;
