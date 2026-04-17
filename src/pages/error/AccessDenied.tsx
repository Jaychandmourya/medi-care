import { useNavigate } from "react-router-dom"
import { ShieldAlert, Home, Lock, AlertTriangle, UserX } from "lucide-react"
import { useAppSelector } from "@/app/hooks"

const AccessDenied = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)

  const getDashboardRoute = () => {
    if (!user) return "/login"
    const routeMap: Record<string, string> = {
      doctor: "/doctor",
      admin: "/admin",
      nurse: "/nurse",
      receptionist: "/receptionist"
    }
    return routeMap[user.role] || "/login"
  }

  const getUserRoleDisplay = () => {
    if (!user) return "Guest"
    return user.role.charAt(0).toUpperCase() + user.role.slice(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
          {/* Top Warning Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

          <div className="p-8 md:p-12">
            {/* Icon Section */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center">
                {/* Pulsing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-2xl animate-pulse" />

                {/* Main Icon Container */}
                <div className="relative bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-6 shadow-inner border border-red-200">
                  <ShieldAlert className="h-16 w-16 md:h-20 md:w-20 text-red-600" strokeWidth={1.5} />
                </div>

                {/* Lock overlay badge */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
                  <Lock className="h-6 w-6 text-red-500" />
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-red-600 mt-6 tracking-tight">
                403
              </h1>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-4">
                Access Denied
              </h2>

              <p className="text-gray-500 mt-3 max-w-md mx-auto text-base md:text-lg">
                You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
              </p>
            </div>

            {/* User Info Card */}
            {user && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 mb-8 border border-orange-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <UserX className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      Signed in as: <span className="text-orange-700">{user.name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Role: <span className="font-medium text-orange-600">{getUserRoleDisplay()}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-red-50/80 rounded-2xl p-5 mb-8 border border-red-100">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 rounded-xl p-3 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Security Notice</h3>
                  <p className="text-sm text-red-600/80 mt-1">
                    Unauthorized access attempts are logged and monitored. This incident has been recorded for security purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user && (
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="group cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                >
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Back to Dashboard
                </button>
              )}

              <button
                onClick={() => navigate("/login")}
                className="group cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200"
              >
                <ShieldAlert className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {user ? "Switch Account" : "Go to Login"}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-center text-sm text-gray-400">
                MediCare Hospital Management System • Secure Access Control
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-24 h-24 bg-red-500/10 rounded-full blur-3xl hidden lg:block" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl hidden lg:block" />
      </div>
    </div>
  )
}

export default AccessDenied
