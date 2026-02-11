
import React, { useState, useEffect } from 'react';
import { User, ViewState, UserRole, PermissionKey } from '../types';
import { LOGO_BLACK_URL } from '../constants';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  activeView: ViewState;
  children: React.ReactNode;
  onUpdateUser: (user: User) => void;
  connectionStatus?: 'idle' | 'online' | 'offline';
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, onNavigate, activeView, children, onUpdateUser, connectionStatus }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isTasksModalOpen, setTasksModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [myTasks, setMyTasks] = useState(() => {
    return localStorage.getItem(`tasks_${user.id}`) || '';
  });
  
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.avatar_url || '');

  useEffect(() => {
    localStorage.setItem(`tasks_${user.id}`, myTasks);
  }, [myTasks, user.id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Erro ao entrar em tela cheia: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    if (url.includes('drive.google.com') && driveMatch) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  const handleUpdateProfile = () => {
    const finalUrl = getDirectImageUrl(newAvatarUrl);
    onUpdateUser({ ...user, avatar_url: finalUrl });
    setProfileModalOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Início', icon: 'fa-solid fa-house', perm: null },
    { id: 'overtime', label: 'Horas Extras', icon: 'fa-solid fa-clock', perm: 'overtime' },
    { id: 'equipment', label: 'Equipamentos', icon: 'fa-solid fa-camera', perm: 'equipment' },
    { id: 'ranking', label: 'Ranking', icon: 'fa-solid fa-trophy', perm: 'ranking' },
    { id: 'pauta', label: 'Pauta Semanal', icon: 'fa-solid fa-calendar-days', perm: 'pauta' },
    { id: 'dashboard', label: 'Dashboards', icon: 'fa-solid fa-chart-line', perm: 'dashboard' },
    { id: 'users', label: 'Gestão de Equipe', icon: 'fa-solid fa-users-gear', perm: 'users' },
  ].filter(item => !item.perm || user.permissoes.includes(item.perm as PermissionKey));

  const NavItem: React.FC<{ item: typeof menuItems[0] }> = ({ item }) => (
    <button 
      onClick={() => {
        onNavigate(item.id as ViewState);
        setSidebarOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium w-full text-left ${
        activeView === item.id 
          ? 'bg-[#715C4A] text-white shadow-md' 
          : 'text-[#1B1B1B] hover:bg-[#B2AC9E]/20'
      }`}
    >
      <i className={`${item.icon} w-5`}></i>
      <span>{item.label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#DCD8D1] flex flex-col md:flex-row">
      {/* Mobile Top Header - Mais compacto */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-[#B2AC9E]/30 sticky top-0 z-[100] shadow-sm">
         <img src={LOGO_BLACK_URL} alt="Central ST" className="h-6 w-auto" />
         <div className="flex items-center gap-4">
           <button 
             onClick={toggleFullscreen} 
             className="w-10 h-10 bg-[#F8F7F5] border border-[#715C4A]/10 text-[#715C4A] rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
             title="Tela Cheia"
           >
             <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-maximize'} text-sm`}></i>
           </button>
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)} 
             className="w-10 h-10 bg-[#1B1B1B] text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg"
           >
             <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-sm`}></i>
           </button>
         </div>
      </div>

      {/* Sidebar Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 fixed md:sticky top-0 left-0 z-[120] flex flex-col w-64 bg-white border-r border-[#B2AC9E]/30 h-screen shadow-2xl md:shadow-sm overflow-y-auto`}>
        <div className="p-8 border-b border-gray-50 flex justify-center flex-shrink-0">
          <img src={LOGO_BLACK_URL} alt="Central ST" className="h-10 w-auto object-contain" />
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        <div className="mt-auto p-4 space-y-3">
          <button 
            onClick={toggleFullscreen}
            className="flex items-center justify-center gap-2 w-full bg-[#715C4A]/5 border border-[#715C4A]/10 text-[#715C4A] py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-[#715C4A]/10 transition-all shadow-sm"
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-maximize'}`}></i>
            {isFullscreen ? 'Sair de Tela Cheia' : 'Ativar Modo Focar'}
          </button>

          <button 
            onClick={() => {
              setTasksModalOpen(true);
              setSidebarOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full bg-[#F8F7F5] border border-[#715C4A]/10 text-[#715C4A] py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-[#715C4A] hover:text-white transition-all shadow-sm group"
          >
            <i className="fa-solid fa-list-check group-hover:scale-110 transition-transform"></i>
            Anotar Tarefas
          </button>
          
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
             <button 
               onClick={() => {
                 setNewAvatarUrl(user.avatar_url || '');
                 setProfileModalOpen(true);
               }}
               className="w-10 h-10 rounded-full bg-[#715C4A] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 overflow-hidden relative group"
             >
               {user.avatar_url ? (
                 <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.nome} />
               ) : user.nome[0]}
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fa-solid fa-camera text-[10px]"></i>
               </div>
             </button>
             <div className="flex-grow overflow-hidden">
               <p className="text-[11px] font-bold text-[#1B1B1B] truncate">{user.nome}</p>
               <p className="text-[8px] text-[#715C4A] uppercase tracking-wider font-black leading-tight opacity-70">{user.setor}</p>
             </div>
             <button onClick={onLogout} title="Sair" className="text-gray-400 hover:text-red-500 transition-colors p-2">
               <i className="fa-solid fa-power-off text-sm"></i>
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow p-5 md:p-8 max-w-7xl mx-auto w-full flex flex-col overflow-x-hidden">
        <div className="flex-grow">
          {children}
        </div>
        
        <footer className="mt-12 pt-8 border-t border-[#B2AC9E]/40 flex flex-col md:flex-row justify-between items-center text-[9px] text-gray-500 font-bold gap-4 pb-8">
          <div className="flex items-center gap-4">
            <img src={LOGO_BLACK_URL} alt="Central ST" className="h-4 w-auto opacity-30 grayscale" />
            <span>© 2026 Steffen Studio – Plataforma de Gestão</span>
          </div>
          <div className="tracking-widest uppercase opacity-40">STEFFEN OS v1.4.7</div>
        </footer>
      </main>

      {/* Profile & Tasks Modals (Mantidos como antes) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-scaleUp">
            <button onClick={() => setProfileModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><i className="fa-solid fa-xmark text-xl"></i></button>
            <h2 className="text-2xl font-bold mb-6">Minha Foto</h2>
            <div className="flex flex-col items-center mb-8">
               <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-[#715C4A]/10 shadow-inner mb-4">
                 <img src={getDirectImageUrl(newAvatarUrl) || `https://ui-avatars.com/api/?name=${user.nome}&background=715C4A&color=fff`} className="w-full h-full object-cover" />
               </div>
            </div>
            <div className="space-y-4">
              <input 
                type="text" 
                value={newAvatarUrl} 
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="URL da imagem (Google Drive)"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-[#715C4A]"
              />
              <button onClick={handleUpdateProfile} className="w-full bg-[#715C4A] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg">Salvar Perfil</button>
            </div>
          </div>
        </div>
      )}

      {isTasksModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-scaleUp">
            <button onClick={() => setTasksModalOpen(false)} className="absolute top-8 right-8 text-gray-400"><i className="fa-solid fa-xmark text-2xl"></i></button>
            <h2 className="text-2xl font-bold text-[#1B1B1B] mb-6">Minhas Tarefas</h2>
            <textarea 
                value={myTasks}
                onChange={(e) => setMyTasks(e.target.value)}
                className="w-full min-h-[300px] bg-gray-50 border border-gray-100 rounded-2xl p-6 text-base text-gray-700 focus:outline-none shadow-inner resize-none font-medium"
                placeholder="Liste suas pendências do dia..."
              />
            <div className="mt-6 flex justify-end">
                <button onClick={() => setTasksModalOpen(false)} className="px-10 py-4 bg-[#1B1B1B] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Salvar e Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
