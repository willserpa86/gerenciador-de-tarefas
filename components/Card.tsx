
import React, { useState, useRef } from 'react';
import { Mail, Clock, Calendar, MessageSquare, Send, Paperclip, X, PlayCircle, Layers } from 'lucide-react';
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
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
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
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{card.title}</h3>
          {/* Ícone de exclusão removido conforme solicitação visual */}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-black mb-4">
          <div className="flex items-center gap-1.5 text-slate-500 uppercase tracking-wider"><Clock size={14} /><span>{formatDateShort(card.createdAt)}</span></div>
          <span className="text-slate-300">•</span>
          <select value={card.status} disabled={!isAssigned && !isCreator} onChange={(e) => onUpdateStatus(card.id, e.target.value as TaskCard['status'])} className={`appearance-none bg-transparent font-black uppercase tracking-widest outline-none cursor-pointer ${statusColors[card.status]}`}>
            <option value="todo">A FAZER</option>
            <option value="doing">EM DESENVOLVIMENTO</option>
            <option value="done">FINALIZADO</option>
          </select>
        </div>

        {(card.startDate || card.endDate) && (
          <div className="flex flex-wrap gap-4 mb-4 text-[11px] font-black text-slate-500">
             {card.startDate && <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Calendar size={12} className="text-indigo-500" />INÍCIO: {new Date(card.startDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
             {card.endDate && <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Calendar size={12} className="text-red-500" />FIM: {new Date(card.endDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
          </div>
        )}

        <p className="text-slate-900 text-base leading-relaxed mb-6 font-bold whitespace-pre-wrap">{card.description}</p>

        {card.mediaFiles && card.mediaFiles.length > 0 && (
          <div className="mb-8 space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Layers size={14} /> Arquivos de Referência ({card.mediaFiles.length})</h4>
            <div className="grid grid-cols-2 gap-2">
              {card.mediaFiles.map((file, idx) => (
                <div key={idx} className={`rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 ${card.mediaFiles.length === 1 ? 'col-span-2' : ''}`}>
                  {file.type === 'image' ? (
                    <img src={file.url} className="w-full h-32 md:h-48 object-cover cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(file.url)} />
                  ) : (
                    <div className="relative group aspect-video bg-black flex items-center justify-center">
                      <video src={file.url} className="w-full h-full" />
                      <PlayCircle size={40} className="absolute text-white/80 cursor-pointer hover:text-white transition-all" onClick={() => {
                        const v = document.createElement('video'); v.src = file.url; v.controls = true;
                        v.className = "fixed inset-0 m-auto z-[9999] max-w-4xl max-h-[90vh] bg-black";
                        const b = document.createElement('div'); b.className = "fixed inset-0 bg-black/80 z-[9998]";
                        b.onclick = () => { document.body.removeChild(v); document.body.removeChild(b); };
                        document.body.append(b, v);
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><MessageSquare size={14} /> Histórico</h4>
          <div className="space-y-3">
            {card.updates.map((update, idx) => (
              <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-indigo-700 uppercase">{update.author.split('@')[0]}</span>
                  <span className="text-[10px] text-slate-400">{formatDateShort(update.timestamp)}</span>
                </div>
                {update.text && <p className="text-slate-800 text-sm font-black leading-snug">{update.text}</p>}
                {update.mediaUrl && (
                   <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 max-w-[150px]">
                      {update.mediaType === 'image' ? <img src={update.mediaUrl} className="w-full h-auto" /> : <div className="bg-slate-900 p-2 flex justify-center"><PlayCircle size={20} className="text-white" /></div>}
                   </div>
                )}
              </div>
            ))}
          </div>

          {(isAssigned || isCreator) && (
            <form onSubmit={handleAddUpdateSubmit} className="relative mt-4">
              <input 
                type="text" 
                placeholder="Adicionar nota..." 
                value={newUpdate} 
                onChange={e => setNewUpdate(e.target.value)} 
                className="w-full bg-white border border-indigo-100 rounded-xl py-3 pl-4 pr-20 text-sm font-black text-slate-900 shadow-sm outline-none focus:border-indigo-300 placeholder:font-bold" 
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"><Paperclip size={16} /></button>
                <button type="submit" disabled={!newUpdate.trim() && !updateMedia} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"><Send size={16} /></button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaSelect} />
            </form>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex -space-x-3">
            {card.assignedEmails.slice(0, 3).map((email, i) => (
              <div key={email} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm ${['bg-indigo-500', 'bg-purple-500', 'bg-blue-500'][i % 3]}`}>
                {email[0].toUpperCase()}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1.5"><Mail size={12} /><span>{card.assignedEmails.length} ATRIBUÍDO(S)</span></div>
        </div>
      </div>
    </div>
  );
};

export default Card;
