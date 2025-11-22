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

  return this;
}
