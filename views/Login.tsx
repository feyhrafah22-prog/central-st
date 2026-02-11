
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LOGIN_BG_URL, LOGO_WHITE_URL } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
  isSignup: boolean;
  users: User[];
  onRegisterUser?: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup, isSignup, users, onRegisterUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
      if (!email || !password || !nome) {
        setError('Preencha todos os campos.');
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        nome,
        email,
        tipo_usuario: UserRole.COLABORADOR,
        setor: 'Novo Membro',
        ativo: true,
        avatar_url: '',
        permissoes: ['overtime', 'ranking', 'pauta']
      };
      if (onRegisterUser) onRegisterUser(newUser);
      onLogin(newUser);
    } else {
      // Busca o usuário estritamente pelo e-mail fornecido
      const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
      
      const isGestaoAuth = email.toLowerCase().trim() === 'gestao@centralst.com' && password === 'st@gestor@47';
      const isFinanceiroAuth = email.toLowerCase().trim() === 'financeiro@centralst.com' && password === 'fin@central747';

      if ((isGestaoAuth || isFinanceiroAuth) && user) {
        onLogin(user);
      } else if (user && (user.password === password || (email.toLowerCase().trim() === 'gestao@centralst.com' && password === 'st@gestor@47'))) { 
        if (!user.ativo) {
          setError('Sua conta está inativa. Contate a gestão.');
          return;
        }
        onLogin(user);
      } else {
        setError('Credenciais inválidas.');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url(${LOGIN_BG_URL})` }}
      />
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-md p-8 sm:p-12 animate-fadeIn">
        <div className="flex flex-col items-center mb-10 text-center">
          <img src={LOGO_WHITE_URL} alt="Central ST" className="h-20 w-auto mb-6 object-contain" />
          <h1 className="text-white text-2xl font-light tracking-[0.3em] uppercase">Central ST</h1>
          <p className="text-gray-300 text-xs font-medium mt-3 tracking-widest uppercase opacity-80">{isSignup ? 'Crie sua conta interna' : 'Acesse o sistema do estúdio'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-xs font-bold text-center tracking-wide">
              {error}
            </div>
          )}

          {isSignup && (
            <div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome Completo"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#715C4A] focus:bg-white/20 transition-all placeholder:text-gray-400 text-sm"
                required
              />
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#715C4A] focus:bg-white/20 transition-all placeholder:text-gray-400 text-sm"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-[#715C4A] focus:bg-white/20 transition-all placeholder:text-gray-400 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#715C4A] hover:bg-[#5a493b] text-white font-bold py-4 rounded-xl transition-all tracking-widest uppercase text-xs shadow-xl hover:scale-[1.01]"
          >
            {isSignup ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={onNavigateToSignup}
            className="text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            {isSignup ? 'Já tem uma conta? Entre aqui' : 'Ainda não tem acesso? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
