import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, AlertCircle, Clock, CheckCircle, Navigation } from 'lucide-react';
import api from '../../services/api';

// Fix for default leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on priority
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const icons = {
  CRITICAL: createIcon('#ef4444'),
  HIGH: createIcon('#f97316'),
  MEDIUM: createIcon('#eab308'),
  LOW: createIcon('#22c55e'),
};

export const RescueMap = () => {
  const [reports, setReports] = useState<any[]>([]);
  const ws = React.useRef<WebSocket | null>(null);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/');
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports for map", error);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Connect to WebSocket to receive live updates
    ws.current = new WebSocket('ws://localhost:8000/api/v1/ws/live?role=rescuer');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_EMERGENCY') {
        fetchReports(); // Refresh map data
      }
    };
    
    return () => {
      ws.current?.close();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      <div className="absolute top-4 left-4 z-[400] bg-white p-4 rounded-xl shadow-lg w-64">
        <h3 className="font-bold text-slate-900 mb-2">Live Rescue Map</h3>
        <p className="text-sm text-slate-600 mb-4">Showing all active cases in the region.</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Critical</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> High</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Medium</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Low</div>
        </div>
      </div>
      
      <MapContainer center={[30.7333, 76.7794]} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]} 
            icon={icons[report.priority as keyof typeof icons] || icons.LOW}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold uppercase tracking-wider text-xs mb-1">{report.case_id}</div>
                <div className="font-medium text-slate-900 capitalize mb-1">{report.animal_type} - {report.condition}</div>
                <div className="text-slate-600 mb-2">{report.status}</div>
                {report.image_url && <img src={report.image_url} alt="Animal" className="w-full h-24 object-cover rounded mb-2" />}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
