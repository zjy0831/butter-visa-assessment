import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar.tsx';
import { Header } from './components/Layout/Header.tsx';
import { RequestsList } from './pages/client/RequestsList.tsx';
import { SubmitWizard } from './pages/client/SubmitWizard/index.tsx';
import { ReviewDashboard } from './pages/sd/ReviewDashboard.tsx';
import { AssessmentRequest, Status } from './types.ts';
import { INITIAL_REQUESTS } from './constants.ts';

export default function App() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AssessmentRequest[]>(INITIAL_REQUESTS);

  const handleCreateRequest = (newReq: AssessmentRequest) => {
    setRequests([newReq, ...requests]);
    navigate('/requests');
  };

  const handleUpdateStatus = (id: string, newStatus: Status, additional?: Partial<AssessmentRequest>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, ...additional } : r));
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 ml-60 flex flex-col">
        <Header />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/requests" replace />} />
            
            {/* Client Routes */}
            <Route path="/requests" element={<RequestsList requests={requests} />} />
            <Route path="/requests/submit" element={<SubmitWizard onSubmit={handleCreateRequest} />} />
            
            {/* SD Routes */}
            <Route path="/sd/review" element={<ReviewDashboard requests={requests} onUpdate={handleUpdateStatus} />} />
            
            {/* Fallback */}
            <Route path="*" element={<div className="p-8 text-slate-500 font-bold">Page under construction...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
