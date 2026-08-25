import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Clock, MapPin, AlertCircle, RefreshCw, Activity, HeartPulse } from 'lucide-react';
import { format } from 'date-fns';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/');
      // Filter for demo
      setReports(response.data.filter((r: any) => r.reporter_id === user?.id));
    } catch (error) {
      console.error("Error fetching reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const PriorityBadge = ({ priority, score }: { priority: string, score: number }) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-green-500',
    };
    return (
      <div className={`px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-sm ${colors[priority] || colors.LOW}`}>
        <Activity size={14} />
        {priority} ({score}/100)
      </div>
    );
  };

  const StatusTimeline = ({ status }: { status: string }) => {
    const stages = ['Reported', 'Rescuer Assigned', 'On The Way', 'Animal Reached', 'Resolved'];
    const currentIndex = stages.indexOf(status);

    return (
      <div className="mt-6 mb-2">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-brand-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, (currentIndex / (stages.length - 1)) * 100)}%` }}
          ></div>
          
          {stages.map((stage, idx) => (
            <div key={stage} className="flex flex-col items-center gap-2 group relative">
              <div className={`w-4 h-4 rounded-full border-2 transition-colors ${idx <= currentIndex ? 'bg-brand-600 border-brand-600 shadow-[0_0_10px_rgba(48,63,159,0.4)]' : 'bg-white border-slate-300'}`}></div>
              {/* Tooltip for stages */}
              <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                {stage}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-sm font-bold text-brand-700">
          Current Status: {status}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rescue Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Track the live status of your reported emergencies.</p>
        </div>
        <button onClick={fetchReports} className="p-3 text-slate-400 hover:text-brand-600 bg-white border border-slate-200 hover:border-brand-200 hover:bg-brand-50 rounded-xl transition-all shadow-sm">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="animate-spin h-10 w-10 text-brand-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <HeartPulse className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No active reports</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">When you report an animal in need using the emergency button, it will appear here for live tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
              <div className="md:w-72 h-48 md:h-auto bg-slate-100 relative shrink-0">
                {report.image_url ? (
                  <img src={report.image_url} alt={report.animal_type} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <HeartPulse size={32} className="mb-2 opacity-50" />
                    <span>No Image Provided</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <PriorityBadge priority={report.priority} score={report.urgency_score} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur text-white text-xs px-3 py-2 rounded-lg truncate">
                  <MapPin size={12} className="inline mr-1" />
                  {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-extrabold text-2xl text-slate-900 capitalize">
                        {report.species || report.animal_type}
                        {report.is_litter && <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded align-middle">Litter</span>}
                      </h3>
                      <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-sm">
                        <Clock size={14} />
                        Reported {format(new Date(report.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <span className="font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200">
                      {report.case_id}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-red-800 uppercase mb-1">Detected Injuries</h4>
                      <p className="text-sm text-red-900">{report.injuries || report.condition}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">AI First-Aid Guidance</h4>
                      <p className="text-sm text-blue-900">{report.first_aid_guidance || 'Wait for rescuers to arrive.'}</p>
                    </div>
                  </div>
                </div>

                <StatusTimeline status={report.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
