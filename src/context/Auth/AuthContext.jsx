import React, { useReducer, useState } from "react";
import { Spinner } from "Assets/svgs";
import { supabase } from "Src/supabase";

// 🟢 Initial state aligned with user_profile schema
const initialState = {
  isAuthenticated: false,
  user: null, // user_id from auth
  user_profile_id: null, // user_id from auth
  token: null,
  role: null,
  role_id: null,
  role_name: null,
  sessionExpired: null,

  // user_profile fields
  email: null,
  address: null,
  city: null,
  state: null,
  country: null,
  zip: null,
  joined_date: null,
  expiry_date: null,
  logo: null,
  login_img: null,

  // org relation
  organization_id: null,
  organization_name: null,
};

export const AuthContext = React.createContext(initialState);

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user", action?.payload?.user_id);
      localStorage.setItem("token", action?.payload?.token);
      localStorage.setItem("role", action?.payload?.role);
      return {
        ...state,
        isAuthenticated: true,
        user: action?.payload?.user_id,
        user_profile_id: action?.payload?.user_profile_id,
        token: action?.payload?.token,
        role: action?.payload?.role,
        role_id: action?.payload?.role_id,
        role_name: action?.payload?.role_name,

        email: action?.payload?.email || null,
        address: action?.payload?.address || null,
        city: action?.payload?.city || null,
        state: action?.payload?.state || null,
        country: action?.payload?.country || null,
        zip: action?.payload?.zip || null,
        joined_date: action?.payload?.joined_date || null,
        expiry_date: action?.payload?.expiry_date || null,
        logo: action?.payload?.logo || null,
        login_img: action?.payload?.login_img || null,

        // org relation
        organization_id: action?.payload?.organization_id || null,
        organization_name: action?.payload?.organization_name || null,
      };

    case "USER_PROFILE":
      return {
        ...state,
        email: action?.payload?.email,
        address: action?.payload?.address,
        city: action?.payload?.city,
        state: action?.payload?.state,
        country: action?.payload?.country,
        zip: action?.payload?.zip,
        joined_date: action?.payload?.joined_date,
        expiry_date: action?.payload?.expiry_date,
        logo: action?.payload?.logo,
        login_img: action?.payload?.login_img,
        role: action?.payload?.role,
        role_id: action?.payload?.role_id,
        role_name: action?.payload?.role_name,
        organization_id: action?.payload?.organization_id,
        organization_name: action?.payload?.organization?.name || null,
      };

    case "LOGOUT":
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return { ...initialState };

    case "SESSION_EXPIRED":
      return { ...state, sessionExpired: action.payload };

    default:
      return state;
  }
};

export const tokenExpireError = (dispatch, errorMessage) => {
  const role = localStorage.getItem("role");
  if (errorMessage === "TOKEN_EXPIRED") {
    dispatch({ type: "SESSION_EXPIRED", payload: true });
    // optionally: dispatch({ type: "LOGOUT" });
    // window.location.href = "/" + role + "/login";
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      (async function () {
        try {
          ("************* Auth context e hit korse *************");
          dispatch({
            type: "LOGIN",
            payload: { user_id: user, token, role },
          });

          // 🟢 Fetch user profile from Supabase with org join
          const { data, error } = await supabase
            .from("user_profile")
            // .select(
            //   `email, address, city, state, country, zip, joined_date, expiry_date, logo, login_img, role, organization_id, organization(name)`
            // )
            .select(`*, organization(name), roles(name)`)
            .eq("user_id", user)
            .single();

          if (error) throw error;

          dispatch({
            type: "USER_PROFILE",
            payload: { ...data, role_name: data?.roles?.name },
          });
        } catch (error) {
          console.error("Auth error:", error.message);
          dispatch({ type: "LOGOUT" });
          if (role) {
            window.location.href = "/" + role + "/login";
          } else {
            window.location.href = "/";
          }
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <Spinner size={100} color="#2CC9D5" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
