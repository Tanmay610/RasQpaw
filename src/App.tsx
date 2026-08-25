import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './features/auth/ui/Login';
import { Register } from './features/auth/ui/Register';
import { CitizenDashboard } from './features/dashboard/ui/CitizenDashboard';
import { RescuerDashboard } from './features/dashboard/ui/RescuerDashboard';
import { CaseDetail } from './features/dashboard/ui/CaseDetail';
import { ReportAnimal } from './features/report/ui/ReportAnimal';
import { RescueMap } from './features/map/ui/RescueMap';
import { Landing } from './features/landing/ui/Landing';
import { Diagnosis } from './features/diagnosis/ui/Diagnosis';

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
