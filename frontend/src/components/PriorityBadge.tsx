import React from 'react';
import { Activity } from 'lucide-react';
export const PriorityBadge = ({ priority, score }: any) => { return <span className='px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-2 shadow-sm bg-blue-500'><Activity size={14} />{priority} ({score}/100)</span> };
