import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const CreateGestor = () => {
  const navigate = useNavigate();
  const mounted = useRef(false);
  const userSessionString = sessionStorage.getItem("userSession");
  const userSession = userSessionString ? JSON.parse(userSessionString) : null;

  useEffect(() => {

  }, []); // Empty dependency array since we only want this to run once

  if (!acces_granted) {
    return null;
  }

  // ... rest of your component code ...
}; 