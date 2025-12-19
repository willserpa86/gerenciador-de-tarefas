
import React from 'react';
import { Layout, PlusCircle, Kanban, ShieldCheck } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'board', label: 'Meu Quadro', icon: Kanban },
    { id: 'create', label: 'Criar Card', icon: PlusCircle },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-white flex-col hidden lg:flex border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Layout className="text-white" size={24} />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase leading-none">Videografismo<br/><span className="text-indigo-500">Flow</span></span>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/60 scale-105' 
                  : 'text-slate-500 hover:text-white hover:bg-slate-900'
              }`}
            >
              <item.icon size={20} className={currentView === item.id ? 'animate-pulse' : ''} />
              <span className="font-black text-sm uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto p-6 space-y-4">
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <ShieldCheck size={12} className="text-indigo-500" />
            Sistema Seguro
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-xs font-bold text-slate-400">Ambiente Pronto</span>
          </div>
        </div>
        
        <p className="text-[9px] text-center font-bold text-slate-800 uppercase tracking-widest opacity-30">
          &copy; 2024 VideografismoFlow
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
