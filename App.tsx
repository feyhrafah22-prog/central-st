
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, ViewState, UserRole, Overtime, Equipment, RankingEntry, Faturamento, ColaboradorPauta, PermissionKey } from './types';
import { MOCK_USERS, MOCK_OVERTIME, MOCK_EQUIPMENT, MOCK_RANKING, MOCK_FATURAMENTO, MOCK_PAUTA } from './services/mockData';
import { GoogleSheetsService } from './services/googleSheets';
import Login from './views/Login';
import Home from './views/Home';
import OvertimeView from './views/Overtime';
import EquipmentView from './views/Equipment';
import RankingView from './views/Ranking';
import DashboardView from './views/Dashboards';
import PautaView from './views/Pauta';
import UserManagementView from './views/UserManagement';
import Layout from './components/Layout';

// URL padrão inicial (pode ser alterada pelo gestor na aba de equipe)
const DEFAULT_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwgPeQCZXM_wgJEY9qnm8gqPBWfxbDoeRHX_8MX5kF7-7nUfG5-HNNt_xjKl9MxjMSK/exec';

const INITIAL_SECTORS = [
  'CEO',
  'Editor de Foto', 
  'Editor de Vídeo', 
  'Gestão de Projetos', 
  'Comercial', 
  'Financeiro', 
  'Social Media',
  'Atendimento',
  'Novo Membro'
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'online' | 'offline'>('idle');
  
  const [sheetApiUrl, setSheetApiUrl] = useState<string>(() => {
    return localStorage.getItem('central_st_api_url') || DEFAULT_SHEET_API_URL;
  });

  const sheets = useMemo(() => new GoogleSheetsService(sheetApiUrl), [sheetApiUrl]);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('central_st_users_v3');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [sectors, setSectors] = useState<string[]>(() => {
    const saved = localStorage.getItem('central_st_sectors_v1');
    return saved ? JSON.parse(saved) : INITIAL_SECTORS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('central_st_user_v13');
    if (saved) {
      const parsed = JSON.parse(saved);
      const latest = (JSON.parse(localStorage.getItem('central_st_users_v3') || '[]') as User[]).find(u => u.id === parsed.id);
      return latest || parsed;
    }
    return null;
  });
  
  const [overtimeData, setOvertimeData] = useState<Overtime[]>(() => {
    const saved = localStorage.getItem('central_st_overtime_v1');
    return saved ? JSON.parse(saved) : MOCK_OVERTIME;
  });
  
  const [equipmentData, setEquipmentData] = useState<Equipment[]>(MOCK_EQUIPMENT);

  const syncData = useCallback(async () => {
    if (!sheetApiUrl || !sheetApiUrl.startsWith('http')) {
      setConnectionStatus('idle');
      return;
    }
    
    setIsSyncing(true);
    try {
      const isOnline = await sheets.testConnection();
      setConnectionStatus(isOnline ? 'online' : 'offline');

      if (isOnline) {
        const remoteUsers = await sheets.read('users');
        if (remoteUsers && remoteUsers.length > 0) {
          setUsers(remoteUsers);
          if (currentUser) {
            const updatedMe = remoteUsers.find(u => u.id === currentUser.id);
            if (updatedMe) setCurrentUser(updatedMe);
          }
        }
        
        const remoteOvertime = await sheets.read('horas_extras');
        if (remoteOvertime && remoteOvertime.length > 0) setOvertimeData(remoteOvertime);

        const remoteEquip = await sheets.read('equipamentos');
        if (remoteEquip && remoteEquip.length > 0) setEquipmentData(remoteEquip);
      }
    } catch (error) {
      setConnectionStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  }, [sheetApiUrl, sheets, currentUser]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  useEffect(() => {
    localStorage.setItem('central_st_users_v3', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('central_st_sectors_v1', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('central_st_overtime_v1', JSON.stringify(overtimeData));
  }, [overtimeData]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('central_st_user_v13', JSON.stringify(currentUser));
      if (currentView === 'login') setCurrentView('home');
    }
  }, [currentUser, currentView]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    sessionStorage.removeItem('central_st_user_v13');
  };

  const addOvertime = async (newEntry: Omit<Overtime, 'id'>) => {
    const entry: Overtime = { ...newEntry, id: `ot-${Date.now()}` };
    setOvertimeData(prev => [entry, ...prev]);
    if (connectionStatus === 'online') await sheets.write('horas_extras', entry);
  };

  const updateOvertime = async (updatedEntry: Overtime) => {
    setOvertimeData(prev => prev.map(item => item.id === updatedEntry.id ? updatedEntry : item));
    if (connectionStatus === 'online') await sheets.update('horas_extras', updatedEntry.id, updatedEntry);
  };

  const updateUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    if (connectionStatus === 'online') await sheets.update('users', updatedUser.id, updatedUser);
  };

  const addUser = async (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    if (connectionStatus === 'online') await sheets.write('users', newUser);
  };

  const addSector = (newSector: string) => {
    if (!sectors.includes(newSector)) {
      setSectors(prev => [...prev, newSector]);
    }
  };

  const saveApiUrl = (url: string) => {
    setSheetApiUrl(url);
    localStorage.setItem('central_st_api_url', url);
  };

  const syncedRanking = useMemo(() => {
    return MOCK_RANKING.map(entry => {
      const userMatch = users.find(u => u.id === entry.user_id);
      return userMatch ? { ...entry, user_nome: userMatch.nome, user_avatar: userMatch.avatar_url } : entry;
    });
  }, [users]);

  const syncedPauta = useMemo(() => {
    return users
      .filter(u => u.ativo && u.tipo_usuario !== UserRole.GESTAO && u.tipo_usuario !== UserRole.FINANCEIRO)
      .map(user => {
        const pautaMatch = MOCK_PAUTA.find(p => p.user_id === user.id);
        return {
          user_id: user.id,
          user_nome: user.nome,
          user_avatar: user.avatar_url,
          tasks: pautaMatch ? pautaMatch.tasks : []
        } as ColaboradorPauta;
      });
  }, [users]);

  const renderView = () => {
    if (!currentUser && currentView !== 'signup') {
      return <Login onLogin={handleLogin} onNavigateToSignup={() => setCurrentView('signup')} isSignup={false} users={users} />;
    }
    if (currentView === 'signup') {
      return <Login onLogin={handleLogin} onNavigateToSignup={() => setCurrentView('login')} isSignup={true} users={users} onRegisterUser={addUser} />;
    }

    const reportUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfKgz0HIQURexReZ2X_SE9HD_EybR3H4c-fObSy_z6ZFvwiXg/viewform";

    const views: Record<string, React.ReactNode> = {
      home: <Home user={currentUser!} onNavigate={setCurrentView} reportUrl={reportUrl} />,
      overtime: <OvertimeView user={currentUser!} data={overtimeData} onAdd={addOvertime} onUpdate={updateOvertime} />,
      equipment: <EquipmentView user={currentUser!} data={equipmentData} />,
      ranking: <RankingView data={syncedRanking} />,
      pauta: <PautaView data={syncedPauta} />,
      dashboard: <DashboardView user={currentUser!} faturamento={MOCK_FATURAMENTO} overtime={overtimeData} />,
      users: (
        <UserManagementView 
          users={users} 
          sectors={sectors} 
          onUpdateUser={updateUser} 
          onAddUser={addUser} 
          onAddSector={addSector}
          sheetApiUrl={sheetApiUrl}
          onUpdateApiUrl={saveApiUrl}
          onManualSync={syncData}
          isSyncing={isSyncing}
          connectionStatus={connectionStatus}
        />
      )
    };

    return (
      <Layout 
        user={currentUser!} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
        activeView={currentView} 
        onUpdateUser={updateUser}
        connectionStatus={connectionStatus}
      >
        {isSyncing && (
          <div className="fixed top-4 right-4 bg-white shadow-lg border border-[#715C4A]/20 px-4 py-2 rounded-full z-[300] flex items-center gap-2 animate-bounce">
            <i className="fa-solid fa-arrows-rotate animate-spin text-[#715C4A]"></i>
            <span className="text-[10px] font-bold text-[#715C4A] uppercase tracking-widest">Acessando Nuvem...</span>
          </div>
        )}
        {views[currentView]}
      </Layout>
    );
  };

  return (
    <div className="min-h-screen selection:bg-[#715C4A] selection:text-white">
      {renderView()}
    </div>
  );
};

export default App;
