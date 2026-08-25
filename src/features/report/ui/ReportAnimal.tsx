import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import { Camera, MapPin, AlertTriangle, ArrowRight, CheckCircle2, Upload, Crosshair } from 'lucide-react';

export const ReportAnimal = () => {
  const [searchParams] = useSearchParams();
  const isEmergencyParam = searchParams.get('emergency') === 'true';
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isEmergency, setIsEmergency] = useState(isEmergencyParam);
  const [formData, setFormData] = useState({
    animal_type: '',
    condition: isEmergencyParam ? 'Immediate danger / severe injury' : '',
    description: '',
    latitude: 30.7333, // Default Chandigarh
    longitude: 76.7794,
    address: '',
    image_url: '' 
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Automatically try to get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
        (err) => console.log("Geolocation error", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        alert("Precise location acquired!");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const enableOneTapEmergency = () => {
    setIsEmergency(true);
    setFormData({
      ...formData,
      animal_type: 'Other',
      condition: 'Emergency - Require Immediate Help',
      description: 'Triggered via One-Tap Emergency'
    });
    setStep(2); // Jump straight to photo
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/reports/', formData);
      setResult(response.data);
      setStep(4); // Success step
    } catch (error) {
      alert("Error submitting report. Please check if you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner / Emergency Toggle */}
      {!isEmergency && step === 1 && (
        <button 
          onClick={enableOneTapEmergency}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl mb-8 flex items-center justify-center gap-3 shadow-lg shadow-red-200 transition-transform active:scale-95"
        >
          <AlertTriangle size={24} />
          ONE-TAP EMERGENCY REPORT
        </button>
      )}

      {isEmergency && step < 4 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <div className="flex items-center justify-between">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <h3 className="text-red-800 font-bold">Emergency Mode Active</h3>
                <p className="text-red-700 text-sm mt-1">Fields have been skipped to save time.</p>
              </div>
            </div>
            <button onClick={() => { setIsEmergency(false); setStep(1); }} className="text-red-600 text-sm font-medium hover:underline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {step < 4 && !isEmergency && (
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
            <span className={step >= 1 ? 'text-brand-600' : ''}>1. Details</span>
            <span className={step >= 2 ? 'text-brand-600' : ''}>2. Photo</span>
            <span className={step >= 3 ? 'text-brand-600' : ''}>3. Location</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-brand-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-6 sm:p-10">
        
        {/* Step 1: Details */}
        {step === 1 && !isEmergency && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Animal Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">What kind of animal is it?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Dog', 'Cat', 'Cow', 'Bird', 'Horse', 'Other'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, animal_type: type })}
                    className={`p-3 text-sm font-medium rounded-xl border transition-colors ${formData.animal_type === type ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-inner' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-brand-500 focus:border-brand-500 bg-white">
                <option value="">Select condition...</option>
                <option value="Injured">Injured</option>
                <option value="Road accident">Road accident</option>
                <option value="Sick">Sick</option>
                <option value="Trapped">Trapped / Entangled</option>
                <option value="Abandoned">Abandoned / Newborn Litter</option>
                <option value="Aggressive">Aggressive / Distressed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Additional Description</label>
              <textarea name="description" rows={3} value={formData.description} onChange={handleChange} placeholder="Any other details that might help rescuers..." className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-brand-500 focus:border-brand-500"></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={handleNext} disabled={!formData.animal_type || !formData.condition} className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Photo */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Upload Photo</h2>
            <p className="text-slate-500">A clear photo helps our AI assess the urgency, detect injuries, and helps rescuers locate the animal.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover" />
                <button 
                  onClick={() => { setPreviewUrl(null); setFormData({...formData, image_url: ''}); }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-600 px-3 py-1 rounded-lg text-sm font-bold shadow"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-300 bg-brand-50 rounded-2xl p-12 text-center hover:bg-brand-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
              >
                <Camera className="h-12 w-12 text-brand-500 mb-4" />
                <p className="text-brand-900 font-medium text-lg">Tap to Take Photo or Upload</p>
                <p className="text-brand-600/70 text-sm mt-2">Required for AI Analysis</p>
              </div>
            )}

            <div className="pt-4 flex justify-between">
              {!isEmergency && <button onClick={handlePrev} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Back</button>}
              <button onClick={handleNext} disabled={!previewUrl} className={`px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 flex items-center gap-2 ${isEmergency ? 'ml-auto' : ''} disabled:opacity-50`}>
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Location</h2>
            <p className="text-slate-500">Where is the animal located right now?</p>

            <button onClick={handleLocationSelect} className="w-full py-4 bg-brand-50 border border-brand-200 text-brand-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors">
              <Crosshair size={20} />
              Refresh Precise Location
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or add landmark</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Approximate Address or Landmark</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. Near City Mall, Sector 17..." className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-brand-500 focus:border-brand-500" />
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={handlePrev} className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl">Back</button>
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 flex items-center gap-2">
                {loading ? 'Analyzing with AI...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success & AI Result */}
        {step === 4 && result && (
          <div className="space-y-8 py-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Rescue Triggered</h2>
              <p className="text-slate-600 mt-2">Case ID: <span className="font-mono font-bold text-slate-900">{result.case_id}</span></p>
            </div>

            {/* AI Assessment Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg tracking-wider">
                AI ANALYSIS COMPLETE
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 mb-6">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Species</div>
                  <div className="font-medium text-slate-900">{result.species || 'Unknown'}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Severity Score</div>
                  <div className={`font-black text-xl ${result.priority === 'CRITICAL' ? 'text-red-600' : 'text-brand-600'}`}>
                    {result.urgency_score}/100
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" /> Detected Injuries
                  </h4>
                  <p className="text-sm text-slate-700 mt-1 pl-6">{result.injuries || 'No visible injuries'}</p>
                </div>
                
                {result.is_litter && (
                  <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-sm font-medium border border-orange-100">
                    🐾 Vulnerable litter/young detected. Priority elevated.
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">First Aid Guidance</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">{result.first_aid_guidance || 'Wait for rescuers.'}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-600 mb-6 font-medium">We are matching this case with nearby rescuers...</p>
              <button onClick={() => navigate('/my-reports')} className="w-full sm:w-auto px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-md">
                Track Rescue Status
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
