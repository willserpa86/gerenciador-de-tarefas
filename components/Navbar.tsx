
import React from 'react';
import { Search, Bell, User, Plus } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userEmail: string;
  onAddClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery, userEmail, onAddClick }) => {
  return (
    <nav className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Buscar tarefas, descrições..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button 
          onClick={onAddClick}
          className="md:hidden p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
        </button>
        
        <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
              {userEmail.split('@')[0]}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Espaço de Trabalho</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {userEmail[0].toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
