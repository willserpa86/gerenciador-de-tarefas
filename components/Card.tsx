
import React, { useState, useRef } from 'react';
import { Mail, Clock, Trash2, Calendar, MessageSquare, Send, Paperclip, X, PlayCircle } from 'lucide-react';
import { TaskCard } from '../types';

interface CardProps {
  card: TaskCard;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskCard['status']) => void;
  onAddUpdate: (id: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  currentUserEmail: string;
}

const Card: React.FC<CardProps> = ({ card, onDelete, onUpdateStatus, onAddUpdate, currentUserEmail }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [updateMedia, setUpdateMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isCreator = card.createdBy === currentUserEmail;
  const isAssigned = card.assignedEmails.includes(currentUserEmail);

  const formatDateShort = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setUpdateMedia({ url, type });
    }
  };

  const handleAddUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpdate.trim() || updateMedia) {
      onAddUpdate(card.id, newUpdate, updateMedia?.url, updateMedia?.type);
      setNewUpdate('');
      setUpdateMedia(null);
    }
  };

  const statusColors = {
    todo: 'text-indigo-500',
    doing: 'text-orange-500',
    done: 'text-emerald-500'
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {card.title}
          </h3>
          {isCreator && (
            <button 
              onClick={() => onDelete(card.id)}
              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-black mb-4">
          <div className="flex items-center gap-1.5 text-slate-500 uppercase tracking-wider">
            <Clock size={14} />
            <span>Criado em {formatDateShort(card.createdAt)}.</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="relative">
            <select 
              value={card.status}
              disabled={!isAssigned && !isCreator}
              onChange={(e) => onUpdateStatus(card.id, e.target.value as TaskCard['status'])}
              className={`appearance-none bg-transparent font-black uppercase tracking-widest outline-none cursor-pointer disabled:cursor-default ${statusColors[card.status]}`}
            >
              <option value="todo">A FAZER</option>
              <option value="doing">EM DESENVOLVIMENTO</option>
              <option value="done">FINALIZADO</option>
            </select>
          </div>
        </div>

        {(card.startDate || card.endDate) && (
          <div className="flex flex-wrap gap-4 mb-4 text-[11px] font-black text-slate-500">
             {card.startDate && (
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <Calendar size={12} className="text-indigo-500 font-black" />
                INÍCIO: {new Date(card.startDate + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            )}
             {card.endDate && (
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <Calendar size={12} className="text-red-500 font-black" />
                FIM: {new Date(card.endDate + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        )}

        <p className="text-slate-900 text-base leading-relaxed mb-6 font-bold whitespace-pre-wrap">
          {card.description}
        </p>

        {card.mediaUrl && (
          <div className="mb-8 rounded-xl overflow-hidden shadow-inner bg-slate-100 border border-slate-50">
            {card.mediaType === 'image' ? (
              <img 
                src={card.mediaUrl} 
                alt={card.title}
                className="w-full h-auto object-cover max-h-[600px]"
              />
            ) : (
              <video 
                src={card.mediaUrl} 
                controls 
                className="w-full max-h-[600px] bg-black"
              />
            )}
          </div>
        )}

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
            <MessageSquare size={14} />
            Atualizações da Tarefa
          </h4>
          
          <div className="space-y-3">
            {card.updates.map((update, idx) => (
              <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">
                    {update.author.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold lowercase">{formatDateShort(update.timestamp)}</span>
                </div>
                
                {update.text && <p className="text-slate-800 text-sm font-bold leading-snug mb-2">{update.text}</p>}

                {update.mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-white max-w-[200px]">
                    {update.mediaType === 'image' ? (
                      <img src={update.mediaUrl} className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(update.mediaUrl)} />
                    ) : (
                      <div className="relative group">
                        <video src={update.mediaUrl} className="w-full h-auto" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                           <PlayCircle size={32} className="text-white drop-shadow-md" onClick={() => {
                              const v = document.createElement('video');
                              v.src = update.mediaUrl!;
                              v.controls = true;
                              v.className = "fixed inset-0 m-auto z-[9999] max-w-4xl max-h-[90vh] shadow-2xl bg-black";
                              document.body.appendChild(v);
                              const backdrop = document.createElement('div');
                              backdrop.className = "fixed inset-0 bg-black/80 z-[9998]";
                              backdrop.onclick = () => { document.body.removeChild(v); document.body.removeChild(backdrop); };
                              document.body.appendChild(backdrop);
                           }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {card.updates.length === 0 && (
              <p className="text-[11px] text-slate-400 font-bold italic pl-1">Nenhuma informação adicional acrescentada ainda.</p>
            )}
          </div>

          {(isAssigned || isCreator) && (
            <div className="mt-4 space-y-2">
              {updateMedia && (
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-indigo-200 shadow-sm bg-slate-50">
                    {updateMedia.type === 'image' ? (
                      <img src={updateMedia.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <PlayCircle size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setUpdateMedia(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              <form onSubmit={handleAddUpdateSubmit} className="relative">
                <input 
                  type="text"
                  placeholder="acrescentar informação..."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  className="w-full bg-white border border-indigo-100 focus:border-indigo-300 rounded-xl py-4 pl-5 pr-24 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-bold shadow-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button 
                    type="submit"
                    disabled={!newUpdate.trim() && !updateMedia}
                    className="p-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-20 transition-all shadow-md active:scale-90"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleMediaSelect} 
                />
              </form>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {card.assignedEmails.slice(0, 3).map((email, i) => (
                <div 
                  key={email}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm ${
                    ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500'][i % 3]
                  }`}
                >
                  {email[0].toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-black">
              Criado por: <span className="text-slate-700 lowercase">{card.createdBy.split('@')[0]}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            <Mail size={12} className="opacity-60" />
            <span>{card.assignedEmails.length} ATRIBUÍDO(S)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
