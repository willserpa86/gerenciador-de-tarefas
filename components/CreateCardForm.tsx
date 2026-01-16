
import React, { useState, useRef } from 'react';
import { Image, Video, X, UserPlus, Send, Sparkles, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FilePlus } from 'lucide-react';
import { TaskCard, MediaFile } from '../types';

interface CustomCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date());
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  return (
    <div className="absolute z-50 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-50 w-72 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} type="button" className="p-1 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-black text-slate-900 text-lg">{months[currentMonth]} <span className="text-slate-500 font-bold">{currentYear}</span></h3>
        <button onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} type="button" className="p-1 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => <div key={day} className="text-[10px] font-black text-slate-500 text-center py-1">{day}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="h-8" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const y = currentYear;
          const m = String(currentMonth + 1).padStart(2, '0');
          const d = String(day).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          const isSelected = selectedDate === dateStr;
          return (
            <button key={day} type="button" onClick={() => { onSelect(dateStr); onClose(); }} className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-800 hover:bg-indigo-50'}`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CreateCardFormProps {
  onSubmit: (card: TaskCard) => void;
  onCancel: () => void;
  userEmail: string;
}

const CreateCardForm: React.FC<CreateCardFormProps> = ({ onSubmit, onCancel, userEmail }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedEmails, setAssignedEmails] = useState<string>(userEmail);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList) => {
    const newMedia: MediaFile[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        newMedia.push({ url, type, name: file.name });
      }
    });
    setMediaFiles(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const emails = assignedEmails.split(',').map(e => e.trim()).filter(e => e.includes('@'));
    onSubmit({
      id: crypto.randomUUID(),
      title,
      description,
      mediaFiles,
      assignedEmails: emails.length > 0 ? emails : [userEmail],
      startDate,
      endDate,
      createdBy: userEmail,
      updates: [],
      createdAt: Date.now(),
      status: 'todo',
    });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase">Novo Card</h2>
            <p className="text-slate-500 text-sm font-bold italic">Defina os detalhes e mídias da tarefa</p>
          </div>
          <button onClick={onCancel} type="button" className="p-2 text-slate-300 hover:text-slate-600 rounded-full transition-all"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">TÍTULO</label>
            <input required type="text" placeholder="TÍTULO DA TAREFA" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl py-4 px-6 text-slate-900 font-black outline-none transition-all uppercase text-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">DATA DE INÍCIO</label>
              <div onClick={() => setShowStartCalendar(!showStartCalendar)} className="flex items-center gap-4 bg-slate-50 border-2 border-transparent hover:border-indigo-200 rounded-2xl py-4 px-6 cursor-pointer">
                <CalendarIcon size={18} className="text-indigo-600" />
                <span className={`text-sm font-black transition-colors ${startDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {startDate ? new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecionar data'}
                </span>
              </div>
              {showStartCalendar && <CustomCalendar selectedDate={startDate} onSelect={setStartDate} onClose={() => setShowStartCalendar(false)} />}
            </div>
            <div className="space-y-2 relative">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">DATA DE ENTREGA</label>
              <div onClick={() => setShowEndCalendar(!showEndCalendar)} className="flex items-center gap-4 bg-slate-50 border-2 border-transparent hover:border-indigo-200 rounded-2xl py-4 px-6 cursor-pointer">
                <CalendarIcon size={18} className="text-indigo-600" />
                <span className={`text-sm font-black transition-colors ${endDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {endDate ? new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecionar data'}
                </span>
              </div>
              {showEndCalendar && <CustomCalendar selectedDate={endDate} onSelect={setEndDate} onClose={() => setShowEndCalendar(false)} />}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">DESCRIÇÃO</label>
            </div>
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-2xl py-4 px-6 font-black text-slate-900 outline-none resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">COLABORADORES</label>
            <div className="relative">
              <UserPlus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black" size={20} />
              <input 
                type="text"
                placeholder="Ex: teste@teste.com"
                value={assignedEmails}
                onChange={e => setAssignedEmails(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-black outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">MÍDIAS DE REFERÊNCIA ({mediaFiles.length})</label>
            <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-indigo-50/50'}`}>
              <FilePlus size={32} className="text-slate-400 mb-2" />
              <p className="text-xs font-black text-slate-500 uppercase">Arraste múltiplos arquivos ou clique</p>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={e => { if (e.target.files) processFiles(e.target.files); }} />
            
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {mediaFiles.map((file, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100 shadow-sm">
                    {file.type === 'image' ? <img src={file.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-900"><Video size={20} className="text-white" /></div>}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeMedia(idx); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 py-4 text-sm font-black text-slate-500 uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest">
              <Send size={20} /> Criar Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardForm;
