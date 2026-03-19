import { useAppDispatch } from "@/app/hooks"
import { login } from "@/features/auth/authSlice"
import { useNavigate } from "react-router-dom"
import type{ Role } from "@/types/auth/auth"
import { UserCog, Stethoscope, Users, Activity } from "lucide-react";

const roles = [
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

  const handleSelectRole = (selectedRole: typeof roles[0]) => {
    dispatch(
      login({
        role: selectedRole.role,
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

    navigate(routeMap[selectedRole.role])
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 px-4">

      <div className="w-full max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            MediCare HMS
          </h1>
          <p className="text-gray-500 mt-2">
            Select your role to continue
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-md
              hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              {/* Gradient Top Bar */}
              <div
                className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r ${role.gradient}`}
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
    </div>
  );
};

export default Login;
