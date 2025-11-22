export default function MkdSDK() {
  this._baseurl = "http://localhost:5000";
  // this._baseurl = "https://task-manager-be-five.vercel.app";

  this.login = async function (username, password) {
    const result = await fetch(this._baseurl + "/api/auth/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.register = async function (
    username,
    email,
    password,
    firstName,
    lastName
  ) {
    const result = await fetch(this._baseurl + "/api/auth/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        fullName: {
          firstName,
          lastName,
        },
      }),
    });
    const json = await result.json();

    if (result.status === 401) {
      throw new Error(json.message);
    }

    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.createTeam = async function (name) {
    const result = await fetch(this._baseurl + "/api/team", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name,
      }),
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getTeams = async function () {
    const result = await fetch(this._baseurl + "/api/team", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.addMemberToTeam = async function (teamId, name, role, capacity) {
    const result = await fetch(this._baseurl + `/api/team/${teamId}/members`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name,
        role,
        capacity,
      }),
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.checkToken = async function () {
    const result = await fetch(this._baseurl + "/api/auth/check", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.createProject = async function (name, teamId) {
    const result = await fetch(this._baseurl + "/api/project", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name,
        teamId,
      }),
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getProjects = async function () {
    const result = await fetch(this._baseurl + "/api/project", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.createTask = async function (
    title,
    description,
    projectId,
    assignedTo,
    priority,
    status
  ) {
    const result = await fetch(this._baseurl + "/api/task", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        title,
        description,
        projectId,
        assignedTo,
        priority,
        status,
      }),
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.getTasks = async function (projectId) {
    let url = this._baseurl + "/api/task";
    if (projectId) {
      url += `?projectId=${projectId}`;
    }
    const result = await fetch(url, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.updateTask = async function (taskId, data) {
    const result = await fetch(this._baseurl + `/api/task/${taskId}`, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(data),
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.deleteTask = async function (taskId) {
    const result = await fetch(this._baseurl + `/api/task/${taskId}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  this.reassignTasks = async function () {
    const result = await fetch(this._baseurl + "/api/task/reassign", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const json = await result.json();
    if (result.status === 401) {
      throw new Error(json.message);
    }
    if (result.status === 403) {
      throw new Error(json.message);
    }
    return json;
  };

  return this;
}
