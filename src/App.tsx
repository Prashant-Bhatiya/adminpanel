import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import KycReview from "@/pages/KycReview";
import Matrimonial from "@/pages/Matrimonial";
import Reports from "@/pages/Reports";
import Broadcast from "@/pages/Broadcast";
import FamilyTree from "@/pages/FamilyTree";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/kyc" element={<KycReview />} />
              <Route path="/matrimonial" element={<Matrimonial />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/broadcast" element={<Broadcast />} />
              <Route path="/family-tree" element={<FamilyTree />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
