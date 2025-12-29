import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Compass, User, PlusSquare, BookOpen, Settings } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { name: "Home", icon: Home, path: "/feed" },
    { name: "Explore", icon: Compass, path: "/library" },
    { name: "Create", icon: PlusSquare, path: "/create" }, // Optional
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F0F2F5] font-['Nunito'] text-gray-900">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 h-full fixed left-0 top-0 z-40">
        
        {/* Logo */}
        <div className="p-8 pb-10">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-lg">⚡</div>
            LearningScroll
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-gray-100 text-black font-extrabold shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-black font-bold"}
                `}
              >
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 3 : 2.5}
                  className={isActive ? "text-black" : "text-gray-400 group-hover:text-black transition-colors"} 
                />
                <span className="text-lg tracking-wide">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / More */}
        <div className="p-6 border-t border-gray-100">
            <button className="flex items-center gap-3 text-gray-400 hover:text-black font-bold transition w-full px-4 py-2 hover:bg-gray-50 rounded-xl">
                <Settings size={20} /> Settings
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full w-full md:ml-64 relative overflow-hidden">
        <Outlet />
      </main>

      {/* --- MOBILE BOTTOM BAR (Visible only on Mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200
                ${isActive ? "text-black" : "text-gray-400"}
              `}
            >
              <item.icon 
                size={isActive ? 26 : 24} 
                strokeWidth={isActive ? 3 : 2}
                fill={isActive ? "currentColor" : "none"} // Optional: Fill active icons
                className={isActive ? "transform -translate-y-1 transition" : ""}
              />
              {/* Optional: Hide label on very small screens if needed */}
              <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0"}`}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}