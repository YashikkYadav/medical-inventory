import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './pages/InventoryPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'
import Billing from './pages/Billing';
import BillView from './components/BillView';
import ServicesPage from './pages/ServicesPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bill/:billId" element={<BillView />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }>
            <Route index element={<InventoryPage />} />
            <Route path="dashboard" element={<InventoryPage />} />
            <Route path="dashboard/inventory" element={<InventoryPage />} />
            <Route path="dashboard/billing" element={<Billing/>} />
            <Route path="dashboard/services" element={<ServicesPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App