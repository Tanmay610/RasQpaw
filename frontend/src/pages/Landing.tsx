import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, MapPin, Clock, ArrowRight, HeartPulse, AlertTriangle } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="bg-brand-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6">
                <HeartPulse size={16} />
                <span>One report can save a life</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                See an animal in need? <br/><span className="text-brand-600">Start the rescue.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed">
                Report injured, abandoned, trapped, or vulnerable street animals and connect with nearby rescuers instantly using our AI-assisted triage platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/report" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:shadow-xl transition-all">
                  Report an Animal
                  <ArrowRight size={20} />
                </Link>
                <Link to="/rescue-map" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all">
                  <MapPin size={20} />
                  Find Nearby Rescuers
                </Link>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Rescuer" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500"><span className="font-bold text-slate-800">500+</span> active rescuers waiting to help.</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:ml-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-brand-50 rounded-[2rem] transform rotate-3 scale-105 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1548681528-6a5c45b66b42?q=80&w=1000&auto=format&fit=crop" 
                alt="Rescue Dog" 
                className="rounded-[2rem] shadow-2xl object-cover h-[500px] w-full"
              />
              
              {/* Floating Card */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Rescue Completed</p>
                  <p className="text-xs text-slate-500">2 minutes ago nearby</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Emergency Strip */}
      <section className="bg-priority-critical text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="animate-pulse" />
            <span className="font-medium text-lg">Found an animal in immediate danger?</span>
          </div>
          <Link to="/report?emergency=true" className="px-6 py-2 bg-white text-priority-critical font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap">
            Report Emergency
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-16">How ResQPaw Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Spot an animal', desc: 'Find a stray animal that needs medical attention or rescue.', icon: <HeartPulse className="w-8 h-8 text-brand-600" /> },
              { step: 2, title: 'Submit a report', desc: 'Upload a photo and details using our simple form.', icon: <MapPin className="w-8 h-8 text-brand-600" /> },
              { step: 3, title: 'AI Assesses Urgency', desc: 'Our AI instantly analyzes the situation and assigns a priority level.', icon: <Shield className="w-8 h-8 text-brand-600" /> },
              { step: 4, title: 'Rescue Coordinated', desc: 'Nearby verified rescuers are notified and dispatched to help.', icon: <Clock className="w-8 h-8 text-brand-600" /> },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-sm text-left border border-slate-100 relative"
              >
                <div className="absolute -top-5 -right-5 text-8xl font-black text-slate-50 opacity-50 z-0">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 relative z-10">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
