import {
  LayoutDashboard,
  Users,
  Calendar,
  Bed,
  ClipboardList,
  FileText,
  Stethoscope,
  BarChart3,
  Activity,
} from "lucide-react";

export const ROLE_CONFIG = {
  admin: {
    color: "blue",
    menu: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
      { name: "Patients", icon: Users, path: "/admin/patients" },
      { name: "Appointments", icon: Calendar, path: "/admin/appointments" },
      { name: "OPD Queue", icon: ClipboardList, path: "/admin/opd" },
      { name: "Beds", icon: Bed, path: "/admin/beds" },
      { name: "Prescriptions", icon: FileText, path: "/admin/prescriptions" },
      { name: "Doctors", icon: Stethoscope, path: "/admin/doctors" },
      { name: "Reports", icon: BarChart3, path: "/admin/reports" },
    ],
  },

  doctor: {
    color: "green",
    menu: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/doctor" },
      { name: "My Patients", icon: Users, path: "/doctor/patients" },
      { name: "Appointments", icon: Calendar, path: "/doctor/appointments" },
      { name: "Prescriptions", icon: FileText, path: "/doctor/prescriptions" },
    ],
  },

  receptionist: {
    color: "purple",
    menu: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/receptionist" },
      { name: "Patients", icon: Users, path: "/receptionist/patients" },
      { name: "Appointments", icon: Calendar, path: "/receptionist/appointments" },
      { name: "OPD Queue", icon: ClipboardList, path: "/receptionist/opd" },
    ],
  },

  nurse: {
    color: "orange",
    menu: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/nurse" },
      { name: "Beds", icon: Bed, path: "/nurse/beds" },
      { name: "Vitals", icon: Activity, path: "/nurse/vitals" },
    ],
  },
};