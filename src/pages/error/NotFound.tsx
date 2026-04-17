import { useNavigate } from "react-router-dom"
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react"
import { useAppSelector } from "@/app/hooks"

const NotFound = () => {
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

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="p-6 md:p-8">
            {/* Error Code with Animation */}
            <div className="text-center mb-5">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 shadow-inner">
                  <FileQuestion className="h-12 w-12 md:h-14 md:w-14 text-gray-400" strokeWidth={1.5} />
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 mt-4 tracking-tighter">
                404
              </h1>

              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">
                Page Not Found
              </h2>

              <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm md:text-base">
                The page you are looking for might have been removed or is temporarily unavailable.
              </p>
            </div>

            {/* Search Suggestion */}
            <div className="bg-gray-50/80 rounded-xl p-4 mb-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2 shrink-0">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Looking for something?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Check the URL or navigate back to continue.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="group cursor-pointer flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </button>

              <button
                onClick={() => navigate(getDashboardRoute())}
                className="group cursor-pointer flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 text-sm"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {user ? "Back to Dashboard" : "Go to Login"}
              </button>
            </div>

            {/* Quick Links */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                MediCare Hospital Management System
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl hidden lg:block" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl hidden lg:block" />
      </div>
    </div>
  )
}

export default NotFound
