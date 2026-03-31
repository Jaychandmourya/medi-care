// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { useAppSelector } from "@/app/hooks"

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

// Lazy loaded components
const Login = lazy(() => import("@/pages/auth/Login"))

// Admin lazy loaded components
const AdminLayout = lazy(() => import("@/components/layout/main-layout/AdminLayout"))
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"))
const AdminPatients = lazy(() => import("@/pages/admin/AdminPatients"))
const AdminAppointments = lazy(() => import("@/pages/admin/AdminAppointments"))
const AdminOpd = lazy(() => import("@/pages/admin/AdminOpd"))
const AdminBeds = lazy(() => import("@/pages/admin/AdminBeds"))
const AdminPrescriptions = lazy(() => import("@/pages/admin/AdminPrescriptions"))
const AdminDoctors = lazy(() => import("@/pages/admin/AdminDoctors"))
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"))

// Doctor lazy loaded components
const DoctorLayout = lazy(() => import("@/components/layout/main-layout/DoctorLayout"))
const DoctorDashboard = lazy(() => import("@/pages/doctor/DoctorDashboard"))

// Nurse lazy loaded components
const NurseLayout = lazy(() => import("@/components/layout/main-layout/NurseLayout"))
const NurseDashboard = lazy(() => import("@/pages/nurse/NurseDashboard"))

// Receptionist lazy loaded components
const ReceptionistLayout = lazy(() => import("@/components/layout/main-layout/ReceptionistLayout"))
const ReceptionistDashboard = lazy(() => import("@/pages/receptionist/ReceptionistDashboard"))
const ReceptionistPatient = lazy(() => import("@/pages/receptionist/ReceptionistPatient"))
const ReceptionistAppointments = lazy(() => import("@/pages/receptionist/ReceptionistAppointments"))
const ReceptionistOpd = lazy(() => import("@/pages/receptionist/ReceptionistOpd"))

import ProtectedRoute from "./ProtectedRoute"
import RoleBasedRoute from "./RoleBasedRoute"

const AppRoutes = () => {
  const user = useAppSelector((state) => state.auth.user)
  const getDefaultRoute = () => {
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
    <Suspense fallback={<LoadingSpinner />}>
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
          <Route path="patients" element={<ReceptionistPatient />} />
          <Route path="appointments" element={<ReceptionistAppointments />} />
          <Route path="opd" element={<ReceptionistOpd />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes