
import React, { useState, useEffect } from 'react';
import { SiteLink, User, AdminConfig, Category, Ad, CreditPlan, SubscriptionTier } from '../types';
import { useStore } from '../store';

interface AdminPanelProps {
  sites: SiteLink[];
  ads: Ad[];
  users: User[];
  config: AdminConfig;
  currentUser: User | null;
  onUpdateConfig: (conf: Partial<AdminConfig>) => void;
  onAddSite: (site: any) => void;
  onDeleteSite: (id: string) => void;
  onUpdateSite: (site: SiteLink) => void;
  onAddAd: (ad: any) => void;
  onUpdateAd: (ad: Ad) => void;
  onDeleteAd: (id: string) => void;
  onBlockUser: (id: string) => void;
  onAddUser: (user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  sites, ads, users, config, currentUser, onUpdateConfig, onAddSite, onDeleteSite, onUpdateSite, onAddAd, onUpdateAd, onDeleteAd, onBlockUser, onAddUser, onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'sites' | 'users' | 'ads' | 'plans' | 'logs'>('stats');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    subscriptionTier: SubscriptionTier.FREE
  });
  const { logs } = useStore();

  const handlePriceUpdate = (planId: string, newPrice: number) => {
    const updatedPlans = config.plans.map(p => p.id === planId ? { ...p, price: newPrice } : p);
    onUpdateConfig({ plans: updatedPlans });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.username || !newUserForm.email) return;
    onAddUser(newUserForm);
    setNewUserForm({ username: '', email: '', role: 'user', subscriptionTier: SubscriptionTier.FREE });
    setIsAddUserOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-72 space-y-2">
          <div className="p-6 bg-slate-900 text-white rounded-2xl mb-6 shadow-xl">
            <h1 className="text-xl font-black">Control Center</h1>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('stats')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'stats' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>Stats</button>
            <button onClick={() => setActiveTab('sites')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'sites' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>Sites</button>
            <button onClick={() => setActiveTab('plans')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'plans' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>Pricing Plans</button>
            <button onClick={() => setActiveTab('users')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>Users</button>
            <button onClick={() => setActiveTab('logs')} className={`w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'theme-bg text-white shadow-lg' : 'hover:bg-white text-slate-600'}`}>Activity Logs</button>
          </nav>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm min-h-[600px]">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Dashboard</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase">Users</p>
                  <p className="text-2xl font-black text-slate-900">{users.length}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase">Sites</p>
                  <p className="text-2xl font-black text-slate-900">{sites.length}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase">Revenue</p>
                  <p className="text-2xl font-black text-green-600">${(ads.reduce((a,b)=>a+(b.clicks*b.cpc),0)).toFixed(0)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Manage Pricing</h2>
              <div className="space-y-4">
                {config.plans.map(plan => (
                  <div key={plan.id} className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900">{plan.name}</h3>
                      <p className="text-xs text-slate-500">{plan.credits} Points | {plan.maxSites} Sites</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-400">$</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={plan.price} 
                        onChange={(e) => handlePriceUpdate(plan.id, parseFloat(e.target.value))}
                        className="w-24 px-3 py-2 border rounded-lg text-sm font-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Activity Logs</h2>
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                {logs.map(log => {
                  const user = users.find(u => u.id === log.userId);
                  return (
                    <div key={log.id} className="text-[11px] p-3 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-100">
                      <div>
                        <span className="font-black text-slate-900">{user?.username || 'System'}:</span>
                        <span className="ml-2 text-slate-600 font-medium">{log.action}</span>
                      </div>
                      <span className="text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900">Users</h2>
                <button 
                  onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                  className="px-4 py-2 theme-bg text-white rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all"
                >
                  <i className={`fa-solid ${isAddUserOpen ? 'fa-minus' : 'fa-plus'} mr-2`}></i>
                  {isAddUserOpen ? 'Cancel' : 'Add New User'}
                </button>
              </div>

              {isAddUserOpen && (
                <form onSubmit={handleCreateUser} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      placeholder="Username" 
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                      value={newUserForm.username}
                      onChange={e => setNewUserForm({...newUserForm, username: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Email Address" 
                      type="email"
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                      value={newUserForm.email}
                      onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                      required
                    />
                    <select 
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                      value={newUserForm.role}
                      onChange={e => setNewUserForm({...newUserForm, role: e.target.value as any})}
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <select 
                      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
                      value={newUserForm.subscriptionTier}
                      onChange={e => setNewUserForm({...newUserForm, subscriptionTier: e.target.value as SubscriptionTier})}
                    >
                      {Object.values(SubscriptionTier).map(tier => <option key={tier} value={tier}>{tier} Tier</option>)}
                    </select>
                  </div>
                  <button type="submit" className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-black hover:bg-slate-800 transition-colors">
                    Create User Account
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-slate-300 transition-colors bg-white">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black ${u.role === 'admin' ? 'bg-slate-900' : 'theme-bg'}`}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-sm">
                          {u.username} 
                          <span className="text-[9px] theme-bg-soft theme-text px-2 py-0.5 rounded ml-2 font-black uppercase tracking-tighter">{u.subscriptionTier}</span>
                          {u.role === 'admin' && <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded ml-2 font-black uppercase">ADMIN</span>}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {u.role !== 'admin' && (
                        <>
                          <button 
                            onClick={() => onBlockUser(u.id)} 
                            className={`px-4 py-1.5 rounded-lg font-black text-[10px] border ${u.isBlocked ? 'bg-green-600 text-white border-green-600' : 'bg-white text-orange-500 border-orange-100 hover:bg-orange-50'}`}
                          >
                            {u.isBlocked ? 'Unlock' : 'Block'}
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Permanently delete user "${u.username}" and all their data?`)) {
                                onDeleteUser(u.id);
                              }
                            }} 
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            title="Delete User"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </>
                      )}
                      {u.id === currentUser?.id && (
                         <span className="text-[10px] text-slate-300 font-bold uppercase italic mr-2">You</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sites' && (
             <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900">Sites Database</h2>
                <div className="bg-white border rounded-3xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left border-b">
                        <th className="p-4">Name</th>
                        <th className="p-4">Tier</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sites.slice(0, 50).map(s => (
                        <tr key={s.id}>
                          <td className="p-4 font-black">{s.name}</td>
                          <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] ${s.isPaid ? 'bg-yellow-100 text-yellow-700 font-bold' : 'bg-slate-100 text-slate-400'}`}>{s.isPaid ? 'PAID' : 'FREE'}</span></td>
                          <td className="p-4"><button onClick={() => onDeleteSite(s.id)} className="text-red-500 hover:text-red-700"><i className="fa-solid fa-trash"></i></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
