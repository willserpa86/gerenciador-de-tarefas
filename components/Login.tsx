
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getUsers = () => {
    const users = localStorage.getItem('tblusuario');
    // Admin padrão para testes: teste@teste.com (Nivel 1, Acesso True)
    return users ? JSON.parse(users) : [{ 
      email: 'teste@teste.com', 
      password: 'teste', 
      codNivel: 1, 
      acesso: true 
    }];
  };

  const saveUser = (newUser: any) => {
    const users = getUsers();
    users.push(newUser);
    localStorage.setItem('tblusuario', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isResetting) {
      const users = getUsers();
      const userExists = users.find((u: any) => u.email === email);
      if (userExists) {
        setSuccessMessage('INSTRUÇÕES DE RECUPERAÇÃO ENVIADAS PARA O SEU EMAIL.');
      } else {
        setError('E-MAIL NÃO ENCONTRADO NO SISTEMA.');
      }
      return;
    }

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('SENHA INVÁLIDA!');
        setPassword('');
        setConfirmPassword('');
        document.getElementById('password-input')?.focus();
        return;
      }

      const users = getUsers();
      if (users.find((u: any) => u.email === email)) {
        setError('E-MAIL JÁ CADASTRADO!');
        return;
      }

      saveUser({ 
        email, 
        password, 
        codNivel: 2, 
        acesso: false,
        dataSolicitacao: Date.now()
      });
      
      setIsRegistering(false);
      setSuccessMessage('SOLICITAÇÃO ENVIADA AOS ADMINISTRADORES! AGUARDE APROVAÇÃO.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } else {
      const users = getUsers();
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (user) {
        if (!user.acesso) {
          setError('SEU ACESSO AINDA NÃO FOI LIBERADO PELO ADMINISTRADOR.');
          return;
        }
        onLogin(email);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setIsResetting(false);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const toggleResetMode = () => {
    setIsResetting(!isResetting);
    setIsRegistering(false);
    setError('');
    setSuccessMessage('');
    setEmail('');
  };

  const getTitle = () => {
    if (isResetting) return 'INSIRA O SEU EMAIL';
    if (isRegistering) return 'CRIAR CONTA';
    return 'FAÇA SEU LOGIN';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a1a] p-4">
      <div className="w-full max-w-xl bg-[#1a1614] rounded-2xl shadow-2xl p-8 md:p-16 flex flex-col items-center">
        <div className="w-full">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-10 tracking-tight uppercase text-center leading-tight">
            {getTitle()}<span className="text-indigo-500">.</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-black uppercase tracking-widest block">Email</label>
              <input
                type="email"
                placeholder="email@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#120f0e] border-2 border-blue-900/50 rounded-lg py-3 px-4 text-white font-black placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {!isResetting && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-slate-300 text-sm font-black uppercase tracking-widest block">Senha</label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#120f0e] border-2 border-blue-900/50 rounded-lg py-3 pl-4 pr-12 text-white font-black placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      required={!isResetting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {isRegistering && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-slate-300 text-sm font-black uppercase tracking-widest block">Confirmar Senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#120f0e] border-2 border-blue-900/50 rounded-lg py-3 pl-4 pr-12 text-white font-black placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required={isRegistering}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs font-black animate-pulse uppercase text-center py-3 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center justify-center gap-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-emerald-400 text-xs font-black uppercase text-center py-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                {successMessage}
              </div>
            )}

            {!isRegistering && !isResetting && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={toggleResetMode}
                  className="text-orange-400 text-xs font-black hover:text-orange-300 transition-colors uppercase tracking-widest"
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-blue-900/20 hover:from-blue-400 hover:to-indigo-500 transition-all transform active:scale-[0.98] uppercase tracking-widest"
            >
              {isResetting ? 'CONFIRMAR' : (isRegistering ? 'SOLICITAR ACESSO' : 'ENTRAR')}
            </button>

            <div className="text-center pt-4">
              <button 
                type="button" 
                onClick={isResetting ? toggleResetMode : toggleMode}
                className="text-blue-500 text-sm font-black hover:underline uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
              >
                {isResetting ? (
                  <>
                    <ChevronLeft size={16} />
                    RETORNAR A TELA DE LOGIN
                  </>
                ) : (
                  isRegistering ? 'VOLTAR PARA LOGIN' : 'CRIAR CONTA'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
