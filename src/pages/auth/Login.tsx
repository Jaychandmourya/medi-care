// import { useAppDispatch } from "@/app/hooks";
// import { setRole } from "../authSlice";
// import { useNavigate } from "react-router-dom";
import { UserCog, Stethoscope, Users, Activity } from "lucide-react";

const roles = [
  {
    id: "admin",
    title: "Admin",
    desc: "Full system control & analytics",
    icon: <UserCog size={28} />,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "doctor",
    title: "Doctor",
    desc: "Manage patients & prescriptions",
    icon: <Stethoscope size={28} />,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "receptionist",
    title: "Receptionist",
    desc: "Handle OPD & appointments",
    icon: <Users size={28} />,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "nurse",
    title: "Nurse",
    desc: "Manage beds & vitals",
    icon: <Activity size={28} />,
    gradient: "from-orange-500 to-red-500",
  },
];

const Login = () => {
  // const dispatch = useAppDispatch();
  // const navigate = useNavigate();

  const handleSelectRole = (role: string) => {
    // dispatch(setRole(role as any));
    // navigate("/dashboard");
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
              onClick={() => handleSelectRole(role.id)}
              className="group cursor-pointer rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-md
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
                  {role.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-gray-500 mt-2">
                  {role.desc}
                </p>

                {/* Button */}
                <button
                  className={`mt-6 w-full py-2 rounded-lg text-white font-medium bg-gradient-to-r ${role.gradient}
                  group-hover:opacity-90 transition`}
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
