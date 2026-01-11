import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBoxes,
  FaReceipt,
  FaConciergeBell,
  FaServicestack,
  FaTools,
  FaCapsules,
  FaUser,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard />,
    },
    {
      name: "Inventory",
      path: "/dashboard/inventory",
      icon: <FaBoxes />,
    },
    {
      name: "Services",
      path: "/dashboard/services",
      icon: <FaTools />,
    },
    {
      name: "Billing",
      path: "/dashboard/billing",
      icon: <FaReceipt />,
    },
    {
      name:"Patient",
      path:"/dashboard/patient",
      icon:<FaUser/>
    }
  ];

  return (
    <div className="bg-gray-800 text-white fixed bottom-0 left-0 right-0 md:static md:h-full md:min-h-screen w-full md:w-36 transition-all duration-300 z-[100] border-t border-gray-700 md:border-t-0">
      <nav className="md:mt-5 h-16 md:h-auto">
        <ul className="flex md:flex-col justify-around md:justify-start h-full items-center">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1 md:flex-none w-full">
              <Link
                to={item.path}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors duration-200 group relative h-full ${
                  location.pathname === item.path
                    ? "bg-gray-900 text-white border-t-2 border-blue-500 md:border-t-0 md:border-l-4"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span className="text-xl md:text-lg mb-1 md:mb-0">{item.icon}</span>
                <span className="md:ml-3 text-[10px] md:text-sm">{item.name}</span>
                
                {/* Tooltip for desktop only */}
                <span className="hidden md:group-hover:inline absolute left-36 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50 ml-2">
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
