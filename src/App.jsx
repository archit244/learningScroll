import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Feed from "./pages/Feed";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth"; // Assuming you have an Auth page

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<Auth />} />

        {/* 🔒 Protected App Routes (Wrapped in Layout) */}
        <Route element={<Layout />}>
          {/* Redirect root "/" to "/feed" */}
          <Route path="/" element={<Navigate to="/feed" replace />} />
          
          <Route path="/feed" element={<Feed />} />
          <Route path="/feed/:category" element={<Feed />} /> {/* Handle category filter */}
          
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch-all for 404s */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Router>
  );
}