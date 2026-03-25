// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom"
import { useAppSelector } from "@/app/hooks"

import Login from "@/pages/auth/Login"

// Admin all page import
import AdminLayout from "@/components/layout/main-layout/AdminLayout"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminPatients from "@/pages/admin/AdminPatients"
import AdminAppointments from "@/pages/admin/AdminAppointments"
import AdminOpd from "@/pages/admin/AdminOpd"
import AdminBeds from "@/pages/admin/AdminBeds"
import AdminPrescriptions from "@/pages/admin/AdminPrescriptions"
import AdminDoctors from "@/pages/admin/AdminDoctors"
import AdminReports from "@/pages/admin/AdminReports"

// Doctor all page import
import DoctorLayout from "@/components/layout/main-layout/DoctorLayout"
import DoctorDashboard from "@/pages/doctor/DoctorDashboard"

// Nurse all page import
import NurseLayout from "@/components/layout/main-layout/NurseLayout"
import NurseDashboard from "@/pages/nurse/NurseDashboard"

// Receptionist all page import
import ReceptionistLayout from "@/components/layout/main-layout/ReceptionistLayout"
import ReceptionistDashboard from "@/pages/receptionist/ReceptionistDashboard"

import ProtectedRoute from "./ProtectedRoute"
import RoleBasedRoute from "./RoleBasedRoute"

const AppRoutes = () => {
  const user = useAppSelector((state) => state.auth.user)

  const getDefaultRoute = () => {
    console.log(user)
    if (!user) return "/login"

    switch (user.role) {
      case "doctor":
        return "/doctor"
      case "admin":
        return "/admin"
      case "nurse":
        return "/nurse"
      case "receptionist":
        return "/receptionist"
      default:
        return "/login"
    }
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} />} />

      {/* Doctor */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["doctor"]}>
              <DoctorLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<DoctorDashboard />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="opd" element={<AdminOpd />} />
        <Route path="beds" element={<AdminBeds />} />
        <Route path="prescriptions" element={<AdminPrescriptions />} />
        <Route path="doctors" element={<AdminDoctors />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Nurse */}
      <Route
        path="/nurse/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["nurse"]}>
              <NurseLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<NurseDashboard />} />
      </Route>

      {/* Receptionist */}
      <Route
        path="/receptionist/*"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["receptionist"]}>
              <ReceptionistLayout />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<ReceptionistDashboard />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes