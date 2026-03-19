import { Menu, Bell, User, Settings, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch } from "@/app/hooks"
import { logout } from "@/features/auth/authSlice"

const Header = ({ setIsOpen }: any) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: any) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">

      {/* Left */}
      <div className="flex items-center gap-4">
        <button className="md:hidden" onClick={() => setIsOpen(true)}>
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-700">
          Dashboard
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6 relative">

        {/* Notification */}
        <button className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </button>

        {/* Avatar */}
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
              A
            </div>
            <span className="hidden sm:block text-sm font-medium">
              Admin
            </span>
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">

              <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-sm">
                <User size={16} /> Profile
              </button>

              <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-sm">
                <Settings size={16} /> Settings
              </button>

              <hr className="my-2" />

              <button
                className="flex items-center gap-2 px-4 py-2 w-full hover:bg-red-50 text-red-600 text-sm cursor-pointer"
                onClick={() => dispatch(logout())}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;