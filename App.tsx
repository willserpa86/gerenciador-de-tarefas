
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  LogOut, 
  LayoutGrid,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { TaskCard, ViewType, CardUpdate } from './types';
import Board from './components/Board';
import CreateCardForm from './components/CreateCardForm';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('videografismo_auth') === 'true';
  });

  const [cards, setCards] = useState<TaskCard[]>(() => {
    const saved = localStorage.getItem('videografismo_cards');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('videografismo_user') || '';
  });

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('videografismo_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    // Verificar se o usuário atual é admin (Nivel 1) para carregar solicitações
    const users = JSON.parse(localStorage.getItem('tblusuario') || '[]');
    const currentUser = users.find((u: any) => u.email === currentUserEmail);
    if (currentUser?.codNivel === 1) {
      const pending = users.filter((u: any) => !u.acesso);
      setPendingUsers(pending);
    }
  }, [currentUserEmail, isAuthenticated]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    localStorage.setItem('videografismo_auth', 'true');
    localStorage.setItem('videografismo_user', email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('videografismo_auth');
    localStorage.removeItem('videografismo_user');
  };

  const approveUser = (email: string) => {
    const users = JSON.parse(localStorage.getItem('tblusuario') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === email ? { ...u, acesso: true } : u
    );
    localStorage.setItem('tblusuario', JSON.stringify(updatedUsers));
    setPendingUsers(prev => prev.filter(u => u.email !== email));
    alert(`Acesso liberado para ${email}`);
  };

  const rejectUser = (email: string) => {
    const users = JSON.parse(localStorage.getItem('tblusuario') || '[]');
    const updatedUsers = users.filter((u: any) => u.email !== email);
    localStorage.setItem('tblusuario', JSON.stringify(updatedUsers));
    setPendingUsers(prev => prev.filter(u => u.email !== email));
  };

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = 
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isAssignedToMe = card.assignedEmails.includes(currentUserEmail);
      const iCreatedIt = card.createdBy === currentUserEmail;
      
      return matchesSearch && (isAssignedToMe || iCreatedIt);
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [cards, searchQuery, currentUserEmail]);

  const handleAddCard = (newCard: TaskCard) => {
    setCards(prev => [newCard, ...prev]);
    setCurrentView('board');
  };

  const handleDeleteCard = (id: string) => {
    const card = cards.find(c => c.id === id);
    if (card && card.createdBy === currentUserEmail) {
      if(confirm("Deseja realmente excluir este card?")) {
        setCards(prev => prev.filter(c => c.id !== id));
      }
    } else {
      alert("Apenas quem criou o card pode excluí-lo.");
    }
  };

  const handleUpdateStatus = (id: string, newStatus: TaskCard['status']) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, status: newStatus } : card
    ));
  };

  const handleAddUpdate = (id: string, updateText: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const newUpdate: CardUpdate = {
      text: updateText,
      timestamp: Date.now(),
      author: currentUserEmail,
      mediaUrl,
      mediaType
    };
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, updates: [...card.updates, newUpdate] } : card
    ));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          userEmail={currentUserEmail}
          onAddClick={() => setCurrentView('create')}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-[1400px] mx-auto w-full">
            {pendingUsers.length > 0 && currentView === 'board' && (
              <div className="mb-12 bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500 rounded-lg text-white">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Solicitações de Acesso ({pendingUsers.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingUsers.map(user => (
                    <div key={user.email} className="bg-white p-5 rounded-2xl border border-orange-100 flex items-center justify-between shadow-sm">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate text-sm">{user.email}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Aguardando Aprovação</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveUser(user.email)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Aprovar">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={() => rejectUser(user.email)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Rejeitar">
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'board' ? (
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Painel Pessoal</h1>
                    <p className="text-slate-600 text-sm mt-1 font-bold italic">Tarefas vinculadas a {currentUserEmail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl transition-all font-black text-sm shadow-sm uppercase tracking-widest"
                    >
                      <LogOut size={16} />
                      <span>Sair</span>
                    </button>
                    <button 
                      onClick={() => setCurrentView('create')}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-black text-sm shadow-lg shadow-indigo-100 uppercase tracking-widest"
                    >
                      <Plus size={20} />
                      <span>Nova Tarefa</span>
                    </button>
                  </div>
                </div>

                {filteredCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center animate-in fade-in duration-700">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 mb-6">
                      <LayoutGrid className="text-indigo-200" size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase">Nenhum card encontrado</h3>
                    <p className="text-slate-600 mt-2 max-w-xs font-bold">Tente mudar sua busca ou crie um novo card para começar sua jornada.</p>
                    <button 
                      onClick={() => setCurrentView('create')}
                      className="mt-8 text-indigo-600 font-black hover:text-indigo-700 transition-colors border-b-4 border-indigo-600/20 pb-0.5 uppercase tracking-widest"
                    >
                      Crie seu primeiro card
                    </button>
                  </div>
                ) : (
                  <Board 
                    cards={filteredCards} 
                    onDelete={handleDeleteCard}
                    onUpdateStatus={handleUpdateStatus}
                    onAddUpdate={handleAddUpdate}
                    currentUserEmail={currentUserEmail}
                  />
                )}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-8">
                <CreateCardForm 
                  onSubmit={handleAddCard} 
                  onCancel={() => setCurrentView('board')}
                  userEmail={currentUserEmail}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
