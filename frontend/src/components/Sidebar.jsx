import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBoxes, FaReceipt, FaConciergeBell, FaServicestack, FaTools } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
   
{
  name: 'Dashboard',
  path: '/dashboard',
  icon: <MdDashboard />
},
    {
      name: 'Inventory',
      path: '/dashboard/inventory',
      icon: <FaBoxes />
    },
    {
      name: 'Services',
      path: '/dashboard/services',
      icon: <FaTools />
    },
    {
      name: 'Billing',
      path: '/dashboard/billing',
      icon: <FaReceipt />
    }
  ];

  return (
    <div className="bg-gray-800 text-white h-full min-h-screen w-16 md:w-64 transition-all duration-300">
     
      <nav className="mt-5">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 group relative ${
                  location.pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="ml-3 hidden md:inline">{item.name}</span>
                {/* Tooltip for mobile/small screens */}
                <span className="md:hidden absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
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