import { Menu, Bell, User, LogOut, Check, Clock, AlertCircle, Info, UserCog, Stethoscope, Activity, Sun, Moon, Users } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { login, logout } from "@/features/auth/authSlice"
import { toggleTheme } from "@/features/theme/themeSlice"
import { useNavigate } from "react-router-dom"
import type { Role } from "@/types/auth/auth"
import { DoctorSelectionDialog } from "@/components/auth/login/DoctorSelectionDialog"
import { doctorDBOperations } from "@/services/doctorServices"
import type { LocalDoctor } from "@/types/doctors/doctorType"
import toast from "react-hot-toast"

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, title: "New Appointment", message: "Patient John Doe scheduled for 2:00 PM", type: "info", time: "5 min ago", read: false },
  { id: 2, title: "Lab Results Ready", message: "Blood test results for Patient #1024 are ready", type: "success", time: "30 min ago", read: false },
  { id: 3, title: "System Alert", message: "Database backup completed successfully", type: "info", time: "1 hour ago", read: true },
];

interface RoleConfig {
  id: string;
  role: Role;
  roleTitle: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}

const roles: RoleConfig[] = [
  {
    id: "admin1",
    role: "admin",
    roleTitle: "Admin",
    name: "John Administrator",
    desc: "Full system control & analytics",
    icon: UserCog,
    color: "text-indigo-600",
  },
  {
    id: "doctor2",
    role: "doctor",
    roleTitle: "Doctor",
    name: "Dr. Sarah Johnson",
    desc: "Manage patients & prescriptions",
    icon: Stethoscope,
    color: "text-emerald-600",
  },
  {
    id: "nurse4",
    role: "nurse",
    roleTitle: "Nurse",
    name: "Michael Wilson",
    desc: "Manage beds & vitals",
    icon: Activity,
    color: "text-red-600",
  },
  {
    id: "receptionist5",
    role: "receptionist",
    roleTitle: "Receptionist",
    name: "Lisa Thompson",
    desc: "Manage appointments & check-ins",
    icon: Users,
    color: "text-orange-600",
  },
];

interface HeaderProps {
  setIsOpen: (isOpen: boolean) => void;
}

const Header = ({ setIsOpen }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctors, setDoctors] = useState<LocalDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const theme = useAppSelector((state) => state.theme.theme);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
      if (!notifDropdownRef.current?.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const generateId = useCallback(() => {
    return Date.now();
  }, []);

  const handleDoctorSelect = (doctor: LocalDoctor) => {
    dispatch(
      login({
        role: 'doctor' as Role,
        name: doctor.firstName && doctor.lastName
          ? `${doctor.firstName} ${doctor.lastName}`
          : `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor',
        id: generateId(),
        avatar: "https://i.pravatar.cc/150",
        doctorId: doctor.id,
      })
    );
    setShowDoctorModal(false);
    navigate('/doctor');
  };

  const handleSwitchRole = async (roleConfig: RoleConfig) => {
    setOpen(false);

    // If role is doctor, show doctor selection modal
    if (roleConfig.role === 'doctor') {
      setLoadingDoctors(true);
      try {
        const doctorList = await doctorDBOperations.getAll();

        if (doctorList.length === 0) {
          toast.error('No doctors found in the system. Please contact admin to add doctors.');
          return;
        }

        setDoctors(doctorList);
        setShowDoctorModal(true);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Error accessing doctor database. Please try again.');
        return;
      } finally {
        setLoadingDoctors(false);
      }
    } else {
      // For non-doctor roles, switch immediately
      dispatch(
        login({
          role: roleConfig.role as Role,
          name: roleConfig.name,
          id: generateId(),
          avatar: "https://i.pravatar.cc/150",
        })
      );
      const routeMap: Record<Role, string> = {
        doctor: "/doctor",
        admin: "/admin",
        nurse: "/nurse",
        receptionist: "/receptionist",
      };
      navigate(routeMap[roleConfig.role as Role]);
    }
  };




  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check size={14} className="text-green-500" />;
      case 'warning': return <AlertCircle size={14} className="text-orange-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 shadow-sm print:hidden">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4 relative">

        {/* Theme Toggle */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center"
          onClick={() => dispatch(toggleTheme())}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        {/* Notification */}
        <div ref={notifDropdownRef} className="relative">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b dark:border-gray-800 last:border-b-0 transition-colors ${
                        !notif.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium truncate ${!notif.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notif.title}
                            </p>
                            {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                            <Clock size={12} />
                            {notif.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t px-4 py-2">
                <button
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors"
                  onClick={() => setNotifOpen(false)}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold shadow-md text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Guest'}</p>
            </div>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">User Menu</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role || 'Guest'}</span>
              </div>

              <div className="max-h-80 overflow-y-auto py-1">
                {/* Role Switcher */}
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Switch Role</p>
                  <div className="space-y-1">
                    {roles.filter(r => r.role !== user?.role).map((role) => {
                      const IconComponent = role.icon;
                      return (
                        <button
                          key={role.id}
                          onClick={() => handleSwitchRole(role)}
                          className="flex cursor-pointer items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-colors group"
                        >
                          <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-gray-700 ${role.color}`}>
                            <IconComponent size={14} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{role.roleTitle}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mx-4 my-2 h-px bg-gray-200 dark:bg-gray-800" />

                {/* Logout */}
                <div className="px-4 py-1">
                  <button
                    className="flex cursor-pointer items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm transition-colors group"
                    onClick={() => dispatch(logout())}
                  >
                    <div className="p-1.5 rounded-lg bg-red-100 group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                      <LogOut size={14} />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DoctorSelectionDialog
        isOpen={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        onSelectDoctor={handleDoctorSelect}
        doctors={doctors}
        loadingDoctors={loadingDoctors}
      />
    </header>
  );
};

export default Header;