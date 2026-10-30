"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/landing/LandingPage";
import MainPage from "@/components/main/MainPage";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <MainPage /> : <LandingPage />;
  //if anyone is authenticated, they will be redirected to the main page, otherwise they will see the landing page.
  // This is next.js Web Client component, so it will be rendered on the client side. The useEffect hook is used to check if the user is authenticated by checking for a token in localStorage. If a token is found, the user is considered authenticated and will be redirected to the main page. If no token is found, the user will see the landing page.
}
