import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('medicines');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <div className="md:hidden w-16"></div> 
          Medicare Hospital
        </div>
        <div className="flex items-center">
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;