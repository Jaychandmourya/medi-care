import { NavLink } from "react-router-dom";
import { ROLE_CONFIG } from "../../constants/roleMenuConfig";
import { useAppSelector } from "@/app/hooks";

const Sidebar = ({ isOpen, setIsOpen }: any) => {
  const role = useAppSelector((state) => state.auth.user?.role) || "admin";
  const config = ROLE_CONFIG[role];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-transform duration-300 print:hidden
        `}
      >
        {/* Logo */}
        <div
          className={`h-16 flex items-center px-6 border-b text-xl font-bold text-${config?.color}-600`}
        >
          {role.toUpperCase()}
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2">
          {config.menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={() => {
                const currentPath = window.location.pathname;
                let shouldActive = false;

                if (currentPath === item.path) shouldActive = true;

                else if (item.path === `/${role}` || item.path === `/${role}/`) {
                  shouldActive = currentPath === item.path || currentPath === `${item.path}/`;
                }

                else {
                  shouldActive = currentPath.startsWith(item.path + "/") && item.path !== `/${role}`;
                }

                return `flex items-center gap-3 p-3 rounded-lg transition
                ${
                  shouldActive
                    ? `bg-${config?.color}-100 text-${config?.color}-600`
                    : "text-gray-600 hover:bg-gray-200"
                }`;
              }}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;