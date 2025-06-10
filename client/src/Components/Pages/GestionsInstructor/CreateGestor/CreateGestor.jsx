import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CreateGestor = () => {
  const navigate = useNavigate();
  const mounted = useRef(false);
  const userSessionString = sessionStorage.getItem("userSession");
  const userSession = userSessionString ? JSON.parse(userSessionString) : null;
  const acces_granted = userSessionString && userSession.accountType === "Administrador";

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (!acces_granted) {
        navigate("/ProtectedRoute");
      }
    }
  }, []); // Empty dependency array since we only want this to run once

  if (!acces_granted) {
    return null;
  }

  // ... rest of your component code ...
}; 