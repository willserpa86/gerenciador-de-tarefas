
import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, X, UserPlus, Send, Sparkles, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskCard } from '../types';
import { GoogleGenAI } from "@google/genai";

interface CustomCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selectedDate, onSelect, onClose }) => {
  const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date());
  
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const daysOfWeek = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajuste para segunda-feira ser o primeiro dia
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

  const handleDateClick = (day: number) => {
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onSelect(`${y}-${m}-${d}`);
    onClose();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split('-').map(Number);
    return y === currentYear && (m - 1) === currentMonth && d === day;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
  };

  return (
    <div className="absolute z-50 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-indigo-50 w-72 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} type="button" className="p-1 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-black text-slate-900 text-lg">
          {months[currentMonth]} <span className="text-slate-500 font-bold">{currentYear}</span>
        </h3>
        <button onClick={nextMonth} type="button" className="p-1 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-[10px] font-black text-slate-500 text-center py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const today = isToday(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                selected 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : today 
                    ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200' 
                    : 'text-slate-800 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
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
  const [mediaFile, setMediaFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setMediaFile({ url, type });
    }
  };

  const enhanceDescription = async () => {
    if (!description || description.length < 5) return;
    
    setIsEnhancing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Revise e reescreva esta descrição de tarefa para ser mais profissional, clara e orientada à ação. Mantenha-a concisa e em Português do Brasil.
        
        Tarefa: ${title}
        Descrição Atual: ${description}`,
      });
      
      if (response.text) {
        setDescription(response.text.trim());
      }
    } catch (err) {
      console.error("Falha ao melhorar descrição", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const emails = assignedEmails
      .split(',')
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    const newCard: TaskCard = {
      id: crypto.randomUUID(),
      title,
      description,
      mediaUrl: mediaFile?.url,
      mediaType: mediaFile?.type,
      assignedEmails: emails.length > 0 ? emails : [userEmail],
      startDate,
      endDate,
      createdBy: userEmail,
      updates: [],
      createdAt: Date.now(),
      status: 'todo',
    };

    onSubmit(newCard);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Novo Card</h2>
            <p className="text-slate-500 text-sm mt-1 font-bold italic">Defina os detalhes e o cronograma da tarefa</p>
          </div>
          <button 
            onClick={onCancel}
            type="button"
            className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">TÍTULO</label>
            <input 
              required
              type="text"
              placeholder="Ex: TÍTULO DA TAREFA"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl py-4 px-6 text-slate-900 font-black outline-none transition-all placeholder-slate-300 uppercase text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">DATA DE INÍCIO</label>
              <div 
                onClick={() => { setShowStartCalendar(!showStartCalendar); setShowEndCalendar(false); }}
                className="flex items-center gap-4 bg-slate-50 border-2 border-transparent hover:border-indigo-200 rounded-2xl py-4 px-6 cursor-pointer transition-colors"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                  <CalendarIcon size={18} className="font-black" />
                </div>
                <span className={`text-sm font-black ${startDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {startDate ? new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecionar data'}
                </span>
              </div>
              {showStartCalendar && (
                <CustomCalendar 
                  selectedDate={startDate} 
                  onSelect={setStartDate} 
                  onClose={() => setShowStartCalendar(false)} 
                />
              )}
            </div>

            <div className="space-y-2 relative">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">DATA DE ENTREGA</label>
              <div 
                onClick={() => { setShowEndCalendar(!showEndCalendar); setShowStartCalendar(false); }}
                className="flex items-center gap-4 bg-slate-50 border-2 border-transparent hover:border-indigo-200 rounded-2xl py-4 px-6 cursor-pointer transition-colors"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                  <CalendarIcon size={18} className="font-black" />
                </div>
                <span className={`text-sm font-black ${endDate ? 'text-slate-900' : 'text-slate-400'}`}>
                  {endDate ? new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Selecionar data'}
                </span>
              </div>
              {showEndCalendar && (
                <CustomCalendar 
                  selectedDate={endDate} 
                  onSelect={setEndDate} 
                  onClose={() => setShowEndCalendar(false)} 
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">DESCRIÇÃO</label>
              <button
                type="button"
                onClick={enhanceDescription}
                disabled={isEnhancing || !description}
                className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-700 disabled:opacity-30 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full transition-all"
              >
                {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                MELHORAR COM IA
              </button>
            </div>
            <textarea 
              rows={5}
              placeholder="Descreva a tarefa detalhadamente..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 rounded-2xl py-4 px-6 text-slate-900 font-bold outline-none transition-all resize-none shadow-sm placeholder-slate-400 leading-relaxed text-base"
            />
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
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-200 focus:bg-white rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">MÍDIA DE REFERÊNCIA</label>
            {!mediaFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/20 transition-all bg-slate-50/50"
              >
                <div className="flex gap-4 mb-4">
                  <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-all text-slate-400 group-hover:text-indigo-600">
                    <Image size={32} />
                  </div>
                </div>
                <p className="text-sm font-black text-slate-500 group-hover:text-indigo-600">Arraste ou clique para upload</p>
              </div>
            ) : (
              <div className="relative group rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl shadow-indigo-100/20">
                {mediaFile.type === 'image' ? (
                  <img src={mediaFile.url} alt="Prévia" className="w-full h-64 object-cover" />
                ) : (
                  <video src={mediaFile.url} className="w-full h-64 object-cover bg-black" />
                )}
                <button 
                  type="button"
                  onClick={() => setMediaFile(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/40 text-white rounded-full hover:bg-slate-900/60 transition-all backdrop-blur-sm"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-center gap-6 pt-6">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
            >
              Cancelar
            </button>
            <div className="flex-[2] relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <button 
                type="submit"
                className="relative w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all transform active:scale-95 uppercase tracking-widest"
              >
                <Send size={20} />
                Criar Card
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardForm;
