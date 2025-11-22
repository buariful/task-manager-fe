export const MockDataService = {
  // Keys
  USERS_KEY: "stm_users",
  TEAMS_KEY: "stm_teams",
  PROJECTS_KEY: "stm_projects",
  TASKS_KEY: "stm_tasks",
  ACTIVITY_KEY: "stm_activity",
  CURRENT_USER_KEY: "stm_current_user",

  // Helpers
  _get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  init() {
    if (!localStorage.getItem(this.USERS_KEY)) {
      this._set(this.USERS_KEY, [
        {
          id: 1,
          email: "admin@example.com",
          password: "admin",
          role: "admin",
          name: "Admin User",
        },
        {
          id: 2,
          email: "user@example.com",
          password: "user",
          role: "user",
          name: "Regular User",
        },
      ]);
    }
    if (!localStorage.getItem(this.TEAMS_KEY)) this._set(this.TEAMS_KEY, []);
    if (!localStorage.getItem(this.PROJECTS_KEY))
      this._set(this.PROJECTS_KEY, []);
    if (!localStorage.getItem(this.TASKS_KEY)) this._set(this.TASKS_KEY, []);
    if (!localStorage.getItem(this.ACTIVITY_KEY))
      this._set(this.ACTIVITY_KEY, []);
  },

  // Auth
  login(email, password) {
    const users = this._get(this.USERS_KEY);
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    throw new Error("Invalid credentials");
  },

  getCurrentUser() {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  },

  register(email, password, name) {
    const users = this._get(this.USERS_KEY);
    if (users.find((u) => u.email === email)) {
      throw new Error("User already exists");
    }
    const newUser = { id: Date.now(), email, password, role: "user", name };
    users.push(newUser);
    this._set(this.USERS_KEY, users);
    return newUser;
  },

  // Teams
  getTeams() {
    return this._get(this.TEAMS_KEY);
  },

  addTeam(name) {
    const teams = this._get(this.TEAMS_KEY);
    const newTeam = { id: Date.now(), name, members: [] };
    teams.push(newTeam);
    this._set(this.TEAMS_KEY, teams);
    return newTeam;
  },

  addMemberToTeam(teamId, memberName, role, capacity) {
    const teams = this._get(this.TEAMS_KEY);
    const teamIndex = teams.findIndex((t) => t.id === teamId);
    if (teamIndex === -1) throw new Error("Team not found");

    const newMember = {
      id: Date.now(),
      name: memberName,
      role,
      capacity: parseInt(capacity),
      currentTasks: 0, // Derived from tasks, but kept here for quick access if needed, though better to calc on fly
    };

    teams[teamIndex].members.push(newMember);
    this._set(this.TEAMS_KEY, teams);
    return newMember;
  },

  getTeamMembers(teamId) {
    const teams = this._get(this.TEAMS_KEY);
    const team = teams.find((t) => t.id === teamId);
    return team ? team.members : [];
  },

  // Projects
  getProjects() {
    return this._get(this.PROJECTS_KEY);
  },

  addProject(name, teamId) {
    const projects = this._get(this.PROJECTS_KEY);
    const newProject = { id: Date.now(), name, teamId };
    projects.push(newProject);
    this._set(this.PROJECTS_KEY, projects);
    return newProject;
  },

  // Tasks
  getTasks() {
    return this._get(this.TASKS_KEY);
  },

  addTask(task) {
    const tasks = this._get(this.TASKS_KEY);
    const newTask = { ...task, id: Date.now(), status: "Pending" };
    tasks.push(newTask);
    this._set(this.TASKS_KEY, tasks);

    // Update member task count if assigned
    if (newTask.assignedTo) {
      this._updateMemberTaskCount(newTask.assignedTo, 1);
    }

    return newTask;
  },

  updateTask(taskId, updates) {
    const tasks = this._get(this.TASKS_KEY);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) throw new Error("Task not found");

    const oldTask = tasks[taskIndex];
    const newTask = { ...oldTask, ...updates };

    // Handle reassignment count updates
    if (oldTask.assignedTo !== newTask.assignedTo) {
      if (oldTask.assignedTo)
        this._updateMemberTaskCount(oldTask.assignedTo, -1);
      if (newTask.assignedTo)
        this._updateMemberTaskCount(newTask.assignedTo, 1);
    }

    tasks[taskIndex] = newTask;
    this._set(this.TASKS_KEY, tasks);
    return newTask;
  },

  deleteTask(taskId) {
    const tasks = this._get(this.TASKS_KEY);
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.assignedTo) {
      this._updateMemberTaskCount(task.assignedTo, -1);
    }
    const newTasks = tasks.filter((t) => t.id !== taskId);
    this._set(this.TASKS_KEY, newTasks);
  },

  _updateMemberTaskCount(memberId, change) {
    const teams = this._get(this.TEAMS_KEY);
    let updated = false;
    for (let team of teams) {
      const member = team.members.find((m) => m.id === memberId);
      if (member) {
        member.currentTasks = (member.currentTasks || 0) + change;
        updated = true;
        break;
      }
    }
    if (updated) this._set(this.TEAMS_KEY, teams);
  },

  // Activity Log
  logActivity(message) {
    const logs = this._get(this.ACTIVITY_KEY);
    const newLog = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // Add to beginning
    if (logs.length > 50) logs.pop(); // Keep last 50
    this._set(this.ACTIVITY_KEY, logs);
    return newLog;
  },

  getLogs() {
    return this._get(this.ACTIVITY_KEY);
  },

  // Smart Reassignment
  reassignTasks() {
    const tasks = this._get(this.TASKS_KEY);
    const teams = this._get(this.TEAMS_KEY);
    let movedCount = 0;

    // 1. Identify overloaded members
    // We need to look at all members across all teams

    teams.forEach((team) => {
      team.members.forEach((member) => {
        if (member.currentTasks > member.capacity) {
          // Found overloaded member
          const excess = member.currentTasks - member.capacity;
          // Find tasks assigned to this member that are Low or Medium priority
          const memberTasks = tasks.filter(
            (t) => t.assignedTo === member.id && t.status !== "Done"
          );

          // Sort by priority (Low first, then Medium)
          const movableTasks = memberTasks.filter((t) => t.priority !== "High");

          // We can move at most 'excess' tasks, or however many movable tasks we have
          const tasksToMove = movableTasks.slice(0, excess);

          tasksToMove.forEach((task) => {
            // Find a target member in the SAME team who has capacity
            const targetMember = team.members.find(
              (m) => m.id !== member.id && m.currentTasks < m.capacity
            );

            if (targetMember) {
              // Move task
              this.updateTask(task.id, { assignedTo: targetMember.id });
              this.logActivity(
                `Task "${task.title}" reassigned from ${member.name} to ${targetMember.name}.`
              );
              movedCount++;
            }
          });
        }
      });
    });

    return movedCount;
  },
};

MockDataService.init();
