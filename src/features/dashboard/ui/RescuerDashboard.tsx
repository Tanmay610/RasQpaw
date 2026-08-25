import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { MapPin, Clock, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Navigation, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { PriorityBadge } from '../../../components/PriorityBadge';

export const RescuerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveAlert, setLiveAlert] = useState<any>(null);
  const [nearbyData, setNearbyData] = useState<any>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/');
      const activeCases = response.data.filter((r: any) => 
        r.status === 'Reported' || r.status === 'Rescuer Assigned' || r.status === 'On The Way'
      ).sort((a: any, b: any) => b.urgency_score - a.urgency_score);
      
      setReports(activeCases);
    } catch (error) {
      console.error("Error fetching cases", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:8000/api/v1/ws/live?role=rescuer');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_EMERGENCY') {
        setLiveAlert(data);
        fetchReports(); // Refresh list automatically
      }
    };
    
    return () => {
      ws.current?.close();
    };
  }, [user]);

  const fetchNearby = async (caseId: string) => {
    try {
      setSelectedCaseId(caseId);
      const res = await api.get(`/reports/${caseId}/nearby`);
      setNearbyData(res.data);
    } catch (error) {
      console.error("Error fetching nearby data", error);
    }
  };

  const updateStatus = async (caseId: string, newStatus: string) => {
    try {
      await api.patch(`/reports/${caseId}/status`, { status: newStatus });
      fetchReports();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-white',
      LOW: 'bg-green-500 text-white',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${colors[priority] || colors.LOW}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="bg-slate-100 min-h-screen pb-12 relative">
      
      {/* Live Alert Modal overlay */}
      {liveAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-red-500 animate-in zoom-in-95">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full animate-pulse">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-slate-900 mb-2">NEW EMERGENCY ALERT!</h2>
            <p className="text-center text-slate-600 mb-6 font-medium">A new {liveAlert.priority} case has just been reported near you.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
              <div className="font-bold text-lg mb-1">{liveAlert.species || 'Unknown Animal'}</div>
              <div className="text-sm text-slate-500 mb-3">{liveAlert.case_id}</div>
              <div className="flex items-start gap-2 text-sm font-medium text-slate-700">
                <MapPin size={16} className="text-brand-500 mt-0.5 shrink-0" />
                <span>{liveAlert.address || 'GPS Coordinates provided'}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setLiveAlert(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                Dismiss
              </button>
              <button onClick={() => { updateStatus(liveAlert.case_id, 'Rescuer Assigned'); setLiveAlert(null); }} className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 flex justify-center items-center gap-2">
                <ShieldCheck size={18} /> Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-brand-900 text-white pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Rescuer Dashboard</h1>
              <p className="text-brand-200 mt-1 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                You are online and listening for emergencies.
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-4 min-w-[100px]">
                <div className="text-3xl font-bold text-red-400">{reports.filter(r => r.priority === 'CRITICAL').length}</div>
                <div className="text-xs text-brand-200 uppercase tracking-wider mt-1">Critical</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 min-w-[100px]">
                <div className="text-3xl font-bold text-white">{reports.length}</div>
                <div className="text-xs text-brand-200 uppercase tracking-wider mt-1">Active Cases</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Nearby Active Cases</h2>
            <button onClick={fetchReports} className="text-sm font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1">
              <Activity size={16} /> Refresh Map
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Scanning sector...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No active cases nearby.</div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden shrink-0 relative bg-slate-200">
                     {report.image_url && <img src={report.image_url} alt="Animal" className="w-full h-full object-cover" />}
                     <div className="absolute top-2 left-2">
                       <PriorityBadge priority={report.priority} />
                     </div>
                  </div>
                  
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-slate-900 capitalize">{report.species || report.animal_type} • {report.condition}</h3>
                      <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{report.case_id}</span>
                    </div>
                    <p className="text-slate-600 mb-4 line-clamp-2">{report.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5"><MapPin size={16} /> {report.address || 'Location provided'}</div>
                      <div className="flex items-center gap-1.5"><Clock size={16} /> Reported {format(new Date(report.created_at), 'h:mm a')}</div>
                      {report.status === 'Reported' && <div className="flex items-center gap-1.5 text-orange-600 font-medium"><AlertTriangle size={16} /> Needs Rescuer</div>}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {report.status === 'Reported' ? (
                        <>
                          <button onClick={() => updateStatus(report.case_id, 'Rescuer Assigned')} className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2">
                            <ShieldCheck size={18} /> Accept Rescue
                          </button>
                          <button onClick={() => fetchNearby(report.case_id)} className="px-4 py-2 bg-slate-100 text-brand-700 rounded-lg font-medium hover:bg-brand-50 transition-colors border border-brand-200 flex items-center gap-2">
                            <Navigation size={18} /> Smart Match Info
                          </button>
                        </>
                      ) : report.status === 'Rescuer Assigned' ? (
                        <button onClick={() => updateStatus(report.case_id, 'On The Way')} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                          Mark "On The Way" <ChevronRight size={18} />
                        </button>
                      ) : report.status === 'On The Way' ? (
                        <button onClick={() => updateStatus(report.case_id, 'Animal Reached')} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                          <CheckCircle2 size={18} /> Animal Reached
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium">{report.status}</span>
                      )}
                    </div>
                    
                    {/* Smart Match Info Panel */}
                    {selectedCaseId === report.case_id && nearbyData && (
                      <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-100 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-brand-900">Logistics & Routing Estimation</h4>
                          <button onClick={() => setSelectedCaseId(null)} className="text-sm text-brand-600 font-medium">Close</button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm">
                            <div className="text-xs text-brand-500 uppercase font-bold mb-1">Your Estimated Arrival</div>
                            <div className="text-lg font-black text-brand-700">~{nearbyData.rescuers[0]?.eta_minutes || 10} mins</div>
                            <div className="text-sm text-slate-500">{nearbyData.rescuers[0]?.distance_km || 2.5} km away</div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-brand-100 shadow-sm">
                            <div className="text-xs text-brand-500 uppercase font-bold mb-1">Nearest Vet Clinic</div>
                            <div className="text-lg font-black text-slate-700">{nearbyData.clinics[0]?.name || 'Unknown'}</div>
                            <div className="text-sm text-slate-500">{nearbyData.clinics[0]?.distance_km || 1.2} km from emergency site</div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
