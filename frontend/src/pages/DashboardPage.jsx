import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 mt-4 md:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;