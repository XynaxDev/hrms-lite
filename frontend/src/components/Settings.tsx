
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-slate-400 font-normal">Configure global preferences and system-wide management tools.</p>
      </div>

      <div className="grid gap-10">
        <section>
          <div className="mb-5 px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">General Preferences</h2>
          </div>
          <div className="glass-panel overflow-hidden rounded-2xl shadow-glass">
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between p-6 transition-colors hover:bg-white/40">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Company Branding</h3>
                  <p className="text-xs text-slate-500 font-light">Customize the logo and theme colors for your organization.</p>
                </div>
                <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">Edit Brand</button>
              </div>
              <div className="flex items-center justify-between p-6 transition-colors hover:bg-white/40">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Working Hours</h3>
                  <p className="text-xs text-slate-500 font-light">Set default organization-wide check-in and check-out windows.</p>
                </div>
                <span className="text-xs font-mono text-slate-400">09:00 — 18:00</span>
              </div>
              <div className="flex items-center justify-between p-6 transition-colors hover:bg-white/40">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">Auto-Approval for Leave</h3>
                  <p className="text-xs text-slate-500 font-light">Automatically approve leave requests shorter than 2 days.</p>
                </div>
                 <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200 cursor-pointer">
                    <div className="h-4 w-4 transform rounded-full bg-white transition-transform translate-x-4"></div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department Management</h2>
            <button className="text-xs font-medium text-slate-900 hover:underline">Add New</button>
          </div>
          <div className="glass-panel overflow-hidden rounded-2xl shadow-glass">
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Engineering', count: 42, icon: 'code' },
                { name: 'Design', count: 12, icon: 'palette' },
                { name: 'Marketing', count: 18, icon: 'campaign' }
              ].map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                      <span className="material-symbols-outlined text-xl">{dept.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">{dept.name}</h3>
                      <p className="text-xs text-slate-500 font-light">{dept.count} Members</p>
                    </div>
                  </div>
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
