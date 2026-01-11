import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardPage = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Desktop: Left, Mobile: Bottom */}
      <div className="order-2 md:order-1">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden order-1 md:order-2">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;