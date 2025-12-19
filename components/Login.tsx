
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação específica conforme solicitado
    if (email === 'teste@teste.com' && password === 'teste') {
      onLogin(email);
    } else {
      setError('E-mail ou senha incorretos. Use teste@teste.com / teste');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a1a] p-4">
      <div className="w-full max-w-4xl bg-[#1a1614] rounded-2xl shadow-2xl p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tight uppercase">
            FAÇA SEU LOGIN<span className="text-indigo-500">.</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-black uppercase tracking-widest">Email</label>
              <input
                type="email"
                placeholder="email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#120f0e] border-2 border-blue-900/50 rounded-lg py-3 px-4 text-white font-bold placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-black uppercase tracking-widest">Senha</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#120f0e] border-2 border-blue-900/50 rounded-lg py-3 px-4 text-white font-bold placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-xs font-black animate-pulse uppercase">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" className="text-orange-400 text-xs font-black hover:text-orange-300 transition-colors uppercase tracking-widest">
                Esqueci a senha
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 hover:from-blue-400 hover:to-indigo-500 transition-all transform active:scale-[0.98] uppercase tracking-widest"
            >
              Entrar
            </button>

            <div className="text-center pt-4">
              <button type="button" className="text-blue-500 text-sm font-black hover:underline uppercase tracking-widest">
                Criar Conta
              </button>
            </div>
          </form>
        </div>
        
        {/* Espaço decorativo lateral */}
        <div className="hidden md:flex flex-1 items-center justify-center">
           <div className="w-full h-full opacity-10 bg-gradient-to-br from-indigo-500 to-transparent rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
