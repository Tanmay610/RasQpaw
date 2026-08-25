import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/landing/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ReportAnimal } from './pages/report/ReportAnimal';
import { RescueMap } from './pages/map/RescueMap';
import { CitizenDashboard } from './pages/dashboard/CitizenDashboard';
import { RescuerDashboard } from './pages/dashboard/RescuerDashboard';
import { Diagnosis } from './pages/diagnosis/Diagnosis';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/report" element={<ReportAnimal />} />
              <Route path="/rescue-map" element={<RescueMap />} />
              <Route path="/diagnosis" element={<Diagnosis />} />
              <Route path="/my-reports" element={<CitizenDashboard />} />
              <Route path="/rescuer/dashboard" element={<RescuerDashboard />} />
              <Route path="*" element={<Landing />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
