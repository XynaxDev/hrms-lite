
import React from 'react';
import { MOCK_CANDIDATES } from '../constants';

const getAvatarSrc = (avatar?: string) => {
  const v = (avatar || '').trim();
  if (v) return v;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#0F172A"/><circle cx="64" cy="52" r="20" fill="#334155"/><path d="M24 118c8-26 28-38 40-38s32 12 40 38" fill="#334155"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const Recruitment: React.FC = () => {
  const stages = ['Applied', 'Screening', 'Interview', 'Hired'];

  const getCandidatesByStage = (stage: string) => {
    return MOCK_CANDIDATES.filter(c => c.stage === stage);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Recruitment</h1>
          <p className="mt-1 text-sm text-slate-400 font-normal">Manage candidates and hiring pipelines.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {stages.map((stage) => (
            <div key={stage} className="w-80 flex flex-col">
              <div className="mb-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <h3 className="font-semibold text-slate-700 text-sm">{stage}</h3>
                   <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{getCandidatesByStage(stage).length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-lg">more_horiz</span>
                </button>
              </div>
              
              <div className="flex-1 bg-slate-100/50 rounded-xl p-3 border border-slate-200/50 shadow-inner flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                {getCandidatesByStage(stage).map((candidate) => (
                  <div key={candidate.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-move group">
                    <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center gap-3">
                          <img src={getAvatarSrc(candidate.avatar)} alt={candidate.name} className="h-9 w-9 rounded-full object-cover" />
                          <div>
                             <h4 className="text-sm font-semibold text-slate-900">{candidate.name}</h4>
                             <p className="text-xs text-slate-500">{candidate.role}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                       <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{candidate.appliedDate}</span>
                       </div>
                       {candidate.score > 0 && (
                          <div className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                             candidate.score >= 90 ? 'bg-emerald-50 text-emerald-600' :
                             candidate.score >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                          }`}>
                             {candidate.score}% Match
                          </div>
                       )}
                    </div>
                  </div>
                ))}
                
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-white/50 transition-all text-xs font-medium">
                   <span className="material-symbols-outlined text-sm">add</span>
                   <span>Add Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
