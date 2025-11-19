import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/user/login");
  }, []);

  return (
    <main className="bg-white grid place-content-center min-h-screen w-full">
      <div className="flex flex-col items-center">
        <h1>Home</h1>
        <p>Redirecting to login page...</p>
      </div>
    </main>
  );
}
