import { useAppDispatch } from "@/app/hooks"
import { login } from "@/features/auth/authSlice"
import { useNavigate } from "react-router-dom"
import type{ Role } from "@/types/auth/auth"
import { UserCog, Stethoscope, Users, Activity } from "lucide-react"
import { doctorDBOperations } from "@/services/doctorServices"
import type { LocalDoctor } from "@/types/doctors/doctorType"
import toast from "react-hot-toast"
import { useState, useEffect } from "react"
import { DoctorSelection } from "@/components/auth/login/DoctorSelection"

interface RoleConfig {
  id: string;
  role: Role;
  roleTitle: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  gradient: string;
}

const roles: RoleConfig[] = [
  {
    id: "admin1",
    role: "admin",
    roleTitle: "Admin",
    name: "John Administrator",
    desc: "Full system control & analytics",
    icon: <UserCog size={28} />,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "doctor2",
    role: "doctor",
    roleTitle: "Doctor",
    name: "Dr. Sarah Johnson",
    desc: "Manage patients & prescriptions",
    icon: <Stethoscope size={28} />,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "receptionist3",
    role: "receptionist",
    roleTitle: "Receptionist",
    name: "Emily Davis",
    desc: "Handle OPD & appointments",
    icon: <Users size={28} />,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "nurse4",
    role: "nurse",
    roleTitle: "Nurse",
    name: "Michael Wilson",
    desc: "Manage beds & vitals",
    icon: <Activity size={28} />,
    gradient: "from-orange-500 to-red-500",
  },
];

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Doctor selection modal state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctors, setDoctors] = useState<LocalDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Fetch doctors when modal opens
  useEffect(() => {
    if (showDoctorModal) {
      fetchDoctors();
    }
  }, [showDoctorModal]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const doctorList = await doctorDBOperations.getAll();
      setDoctors(doctorList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };


  const handleDoctorSelect = (doctor: LocalDoctor) => {
    dispatch(
      login({
        role: 'doctor' as Role,
        name: doctor.firstName && doctor.lastName
          ? `${doctor.firstName} ${doctor.lastName}`
          : `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor',
        id: Date.now(),
        avatar: "https://i.pravatar.cc/150",
        doctorId: doctor.id,
      })
    );
    setShowDoctorModal(false);
    navigate('/doctor');
  };

  const handleSelectRole = async (selectedRole: typeof roles[0]) => {
    // If role is doctor, show doctor selection modal
    if (selectedRole.role === 'doctor') {
      try {
        const doctorList = await doctorDBOperations.getAll()

        if (doctorList.length === 0) {
          toast.error('No doctors found in the system. Please contact admin to add doctors.')
          return
        }

        // Show doctor selection modal
        setShowDoctorModal(true);
      } catch (error) {
        console.error('Error fetching doctors:', error)
        toast.error('Error accessing doctor database. Please try again.')
        return
      }
    } else {
      // For non-doctor roles, use the existing logic
      dispatch(
        login({
          role: selectedRole.role as Role,
          name: selectedRole.name,
          id: Date.now(),
          avatar: "https://i.pravatar.cc/150",
        })
      )

      const routeMap: Record<Role, string> = {
        doctor: "/doctor",
        admin: "/admin",
        nurse: "/nurse",
        receptionist: "/receptionist",
      }

      navigate(routeMap[selectedRole.role as Role])
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 px-4">

      <div className="w-full max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative">
              {/* Logo Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
              {/* Logo Container */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              {/* Decorative pulse dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            MediCare HMS
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 mt-3 text-base sm:text-lg font-medium">
            Hospital Management System
          </p>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Select your role to continue
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-md
              hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Top Bar */}
              <div
                className={`h-2 w-full rounded-t-2xl bg-gradient-to-r ${role.gradient}`}
              />

              {/* Content */}
              <div className="p-6">
                {/* Icon */}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl text-white bg-gradient-to-r ${role.gradient} mb-4 shadow-md`}
                >
                  {role.icon}
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-gray-800">
                  {role.roleTitle}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 mt-2">
                  {role.desc}
                </p>

                {/* Button */}
                <button
                  className={`mt-6 w-full py-2 rounded-lg text-white font-medium cursor-pointer bg-gradient-to-r ${role.gradient}
                  group-hover:opacity-90 transition`}
                  onClick={() => handleSelectRole(role)}
                >
                  Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DoctorSelection
        isOpen={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        onSelectDoctor={handleDoctorSelect}
        doctors={doctors}
        loadingDoctors={loadingDoctors}
      />
    </div>
  );
};

export default Login;
