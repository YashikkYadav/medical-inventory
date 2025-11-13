import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './pages/InventoryPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'
import Billing from './pages/Billing';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }>
            <Route index element={<InventoryPage />} />
            <Route path="dashboard" element={<InventoryPage />} />
            <Route path="dashboard/inventory" element={<InventoryPage />} />
            <Route path="dashboard/billing" element={<Billing/>} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App