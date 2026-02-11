
import React, { useState } from 'react';
import { User, UserRole, PermissionKey } from '../types';

interface UserManagementProps {
  users: User[];
  sectors: string[];
  onUpdateUser: (user: User) => void;
  onAddUser?: (user: User) => void;
  onAddSector: (sector: string) => void;
  sheetApiUrl: string;
  onUpdateApiUrl: (url: string) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  connectionStatus: 'idle' | 'online' | 'offline';
}

const UserManagementView: React.FC<UserManagementProps> = ({ 
  users, 
  sectors, 
  onUpdateUser, 
  onAddUser, 
  onAddSector,
  sheetApiUrl,
  onUpdateApiUrl,
  onManualSync,
  isSyncing,
  connectionStatus
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);
  const [showDevCentral, setShowDevCentral] = useState(false);
  const [devView, setDevView] = useState<'main' | 'download_guide' | 'file_export'>('main');
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '', 
    password: '',
    avatar_url: '', 
    tipo_usuario: UserRole.COLABORADOR, 
    setor: '',
    permissoes: [] as PermissionKey[],
    ativo: true
  });

  // Função para forçar o download de um arquivo de texto (contornando o problema do ZIP)
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSettingsBackup = () => {
    const backup = {
      appName: "Central ST",
      version: "1.5.2",
      sheetApiUrl,
      sectors,
      exportDate: new Date().toISOString()
    };
    downloadFile('central_st_config_backup.json', JSON.stringify(backup, null, 2));
  };

  const scriptCode = `// CÓDIGO GOOGLE APPS SCRIPT V5 (FINAL)
function doGet(e) {
  const out = (c, t) => ContentService.createTextOutput(c).setMimeType(t);
  if (!e || !e.parameter || !e.parameter.action) return out("✅ SCRIPT ATIVO!", ContentService.MimeType.TEXT);
  
  try {
    const action = e.parameter.action;
    const sheetName = e.parameter.sheet;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return out("Erro: Aba não encontrada", ContentService.MimeType.TEXT);

    if (action === 'read') {
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();
      const result = data.map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          let val = row[i];
          if (h === 'permissoes' && typeof val === 'string') val = val.split(',').filter(x => x);
          if (h === 'ativo') val = val === true || val === "TRUE";
          obj[h] = val;
        });
        return obj;
      });
      return out(JSON.stringify(result), ContentService.MimeType.JSON);
    }
  } catch (f) { return out("Erro: " + f.message, ContentService.MimeType.TEXT); }
}

function doPost(e) {
  try {
    const p = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(p.sheet);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (p.action === 'write') {
      sheet.appendRow(headers.map(h => Array.isArray(p.data[h]) ? p.data[h].join(',') : p.data[h] || ""));
    }
    if (p.action === 'update') {
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][headers.indexOf('id')] == p.id) {
          headers.forEach((h, col) => {
            if (p.data[h] !== undefined) {
              let v = p.data[h];
              sheet.getRange(i + 1, col + 1).setValue(Array.isArray(v) ? v.join(',') : v);
            }
          });
          break;
        }
      }
    }
    return out("OK", ContentService.MimeType.TEXT);
  } catch (f) { return out("Erro", ContentService.MimeType.TEXT); }
}`;

  const availablePerms: { id: PermissionKey, label: string }[] = [
    { id: 'overtime', label: 'Horas Extras' },
    { id: 'equipment', label: 'Equipamentos' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'pauta', label: 'Pauta Semanal' },
    { id: 'dashboard', label: 'Dashboards' },
  ];

  const getDirectImageUrl = (url: string) => {
    if (!url) return '';
    const driveMatch = url.match(/(?:\/d\/|id=)([\w-]+)/);
    return url.includes('drive.google.com') && driveMatch ? `https://lh3.googleusercontent.com/d/${driveMatch[1]}` : url;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1B1B1B]">Gestão de Equipe</h1>
          <p className="text-sm text-gray-500">Controle de acesso e infraestrutura técnica.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => { setDevView('main'); setShowDevCentral(true); }}
            className="bg-[#1B1B1B] text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2"
          >
            <i className="fa-brands fa-github"></i>
            PUBLICAR SITE (.COM.BR)
          </button>
          <button 
            onClick={() => setShowScriptCode(true)}
            className="bg-white border border-[#715C4A]/30 text-[#715C4A] px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
          >
            VER SCRIPT V5
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#715C4A] text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#5a493b] transition-all"
          >
            + NOVO MEMBRO
          </button>
        </div>
      </div>

      {/* Connection Card */}
      <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all bg-white ${connectionStatus === 'offline' ? 'border-orange-200 shadow-lg' : 'border-gray-100 shadow-sm'}`}>
         <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${connectionStatus === 'online' ? 'bg-green-500 text-white' : connectionStatus === 'offline' ? 'bg-orange-400 text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
              <i className={`fa-solid ${connectionStatus === 'online' ? 'fa-cloud-check' : 'fa-cloud-bolt'}`}></i>
            </div>
            <div>
              <h3 className="font-bold text-[#1B1B1B]">Nuvem de Dados</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {connectionStatus === 'online' ? 'Google Sheets Conectado' : 'Aguardando Link do App Script'}
              </p>
            </div>
         </div>
         <div className="flex-grow max-w-lg flex gap-3">
            <input 
              type="text" 
              value={sheetApiUrl}
              onChange={(e) => onUpdateApiUrl(e.target.value)}
              className="flex-grow bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[11px] focus:outline-none focus:border-[#715C4A]"
              placeholder="URL do Apps Script..."
            />
            <button onClick={onManualSync} disabled={isSyncing} className="bg-[#715C4A] text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#5a493b] transition-all disabled:opacity-50">
              {isSyncing ? 'Sincronizando...' : 'Testar Conexão'}
            </button>
         </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-50 flex-shrink-0">
              <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.nome}&background=715C4A&color=fff`} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-[#1B1B1B] truncate">{u.nome}</h3>
              <p className="text-[10px] text-[#715C4A] font-black uppercase tracking-widest">{u.setor}</p>
            </div>
            <button onClick={() => { setEditingUser(u); setFormData({ ...u, password: u.password || '' }); }} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-[#715C4A] hover:text-white transition-all shadow-sm">
              <i className="fa-solid fa-gear text-xs"></i>
            </button>
          </div>
        ))}
      </div>

      {/* NEW DEV CENTRAL MODAL - WITH INDIVIDUAL EXPORTS */}
      {showDevCentral && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] p-12 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button onClick={() => setShowDevCentral(false)} className="absolute top-10 right-10 text-gray-400 hover:text-black transition-colors"><i className="fa-solid fa-xmark text-3xl"></i></button>
            
            {devView === 'main' && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-3xl">
                    <i className="fa-brands fa-github"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-black tracking-tight">Publicar no rafaelfeyh.com.br</h2>
                    <p className="text-gray-500 font-medium text-sm">Contorne os bugs de download e leve seu site para produção.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <h4 className="font-bold text-black flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                        Exportação Manual de Arquivos
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        Se o ZIP do Google não funciona, baixe os arquivos fonte individualmente para montar seu repositório no GitHub.
                      </p>
                      <button 
                        onClick={() => setDevView('file_export')}
                        className="w-full bg-[#715C4A] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                      >
                        <i className="fa-solid fa-file-export"></i>
                        BAIXAR ARQUIVOS UM POR UM
                      </button>
                    </div>

                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                      <h4 className="font-bold text-black flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                        Backup de Configurações
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        Garanta que você tem a URL do App Script e os setores antes de mudar de ambiente.
                      </p>
                      <button 
                        onClick={downloadSettingsBackup}
                        className="w-full border-2 border-black text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-download"></i>
                        BAIXAR SETTINGS (.JSON)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#715C4A]/5 p-8 rounded-[2.5rem] border border-[#715C4A]/20">
                      <h4 className="font-bold text-[#715C4A] flex items-center gap-3 mb-4">
                        <span className="w-6 h-6 bg-[#715C4A] text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                        Guia Visual de Download
                      </h4>
                      <p className="text-xs text-[#715C4A]/80 leading-relaxed mb-6">
                        Ainda quer tentar o ZIP oficial do Google? Eu te mostro exatamente onde clicar.
                      </p>
                      <button 
                        onClick={() => setDevView('download_guide')}
                        className="w-full bg-white text-[#715C4A] border border-[#715C4A] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#715C4A] hover:text-white transition-all"
                      >
                        VER MAPA DO GOOGLE STUDIO
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {devView === 'file_export' && (
              <div className="animate-fadeIn">
                <button onClick={() => setDevView('main')} className="text-[#715C4A] font-bold text-xs mb-6 flex items-center gap-2 hover:underline">
                  <i className="fa-solid fa-arrow-left"></i> VOLTAR
                </button>
                <h2 className="text-3xl font-bold mb-4">Exportador Individual</h2>
                <p className="text-sm text-gray-500 mb-8">Baixe os arquivos abaixo e coloque-os em uma pasta no seu computador. Depois, suba essa pasta no seu GitHub.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold">index.html</p>
                        <p className="text-[10px] text-gray-400">Estrutura base do site</p>
                      </div>
                      <button onClick={() => downloadFile('index.html', document.documentElement.outerHTML)} className="text-[#715C4A] p-3 hover:bg-[#715C4A] hover:text-white rounded-xl transition-all"><i className="fa-solid fa-download"></i></button>
                   </div>
                   <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between opacity-50">
                      <div>
                        <p className="text-xs font-bold">App.tsx / types.ts</p>
                        <p className="text-[10px] text-gray-400">Logica e Tipagens (Copie via Script)</p>
                      </div>
                      <i className="fa-solid fa-lock text-[10px]"></i>
                   </div>
                </div>

                <div className="mt-8 p-8 bg-orange-50 border border-orange-100 rounded-[2rem]">
                   <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> Importante</h4>
                   <p className="text-xs text-orange-800 leading-relaxed">
                     Como eu não consigo ler os arquivos brutos do sistema operacional do Google por segurança, a melhor forma de você migrar o código lógico (App.tsx) é clicando em "Ver Código" em cada arquivo na barra lateral e copiando o texto.
                   </p>
                </div>
              </div>
            )}

            {devView === 'download_guide' && (
              <div className="animate-fadeIn">
                <button onClick={() => setDevView('main')} className="text-[#715C4A] font-bold text-xs mb-6 flex items-center gap-2 hover:underline">
                  <i className="fa-solid fa-arrow-left"></i> VOLTAR
                </button>
                <h2 className="text-3xl font-bold mb-8">Onde o Google esconde o Download?</h2>
                <div className="bg-[#1B1B1B] p-10 rounded-[3rem] text-white relative">
                   <div className="absolute top-4 right-4 animate-bounce text-4xl text-yellow-400">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                   </div>
                   <p className="text-lg leading-relaxed mb-6 font-light">
                      Olhe para a **barra superior cinza** do navegador (não dentro deste app, mas na interface do Google AI Studio).
                   </p>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                         <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-black">1</div>
                         <p className="text-sm">Procure o ícone de uma <b>seta para baixo (Download)</b> no canto superior direito.</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                         <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-black">2</div>
                         <p className="text-sm">Ao clicar, o Google vai compactar todos os arquivos deste projeto em um único ZIP.</p>
                      </div>
                   </div>
                </div>
              </div>
            )}
            
            <div className="mt-12 flex justify-center">
               <button onClick={() => setShowDevCentral(false)} className="bg-gray-100 text-gray-500 px-10 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Sair da Central</button>
            </div>
          </div>
        </div>
      )}

      {/* Script Code Modal */}
      {showScriptCode && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl relative animate-scaleUp">
            <button onClick={() => setShowScriptCode(false)} className="absolute top-8 right-8 text-gray-400 hover:text-[#1B1B1B]"><i className="fa-solid fa-xmark text-2xl"></i></button>
            <h2 className="text-2xl font-bold mb-6">Script de Integração V5</h2>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-6 rounded-3xl text-[10px] h-[400px] overflow-y-auto font-mono scrollbar-thin">
                {scriptCode}
              </pre>
              <button onClick={() => { navigator.clipboard.writeText(scriptCode); alert('Copiado!'); }} className="absolute top-4 right-4 bg-[#715C4A] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg">Copiar Código</button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit/Create Modals */}
      {(editingUser || isCreating) && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-scaleUp overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setEditingUser(null); setIsCreating(false); }} className="absolute top-8 right-8 text-gray-400"><i className="fa-solid fa-xmark text-xl"></i></button>
            <h2 className="text-2xl font-bold mb-8">{isCreating ? 'Cadastrar Novo Membro' : 'Configurar Perfil'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <input type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">E-mail Corporativo</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Senha de Acesso</label>
                  <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Setor / Cargo</label>
                  <select value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm">
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Permissões de Acesso</p>
                {availablePerms.map(p => (
                  <label key={p.id} className="flex items-center gap-3 text-xs font-bold text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.permissoes.includes(p.id)} 
                      onChange={() => {
                        const next = formData.permissoes.includes(p.id) ? formData.permissoes.filter(x => x !== p.id) : [...formData.permissoes, p.id];
                        setFormData({...formData, permissoes: next});
                      }}
                      className="accent-[#715C4A]"
                    /> {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-10 flex gap-4">
               <button onClick={() => { setEditingUser(null); setIsCreating(false); }} className="flex-grow py-5 rounded-2xl bg-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200">Cancelar</button>
               <button 
                  onClick={() => {
                    const final = { ...formData, avatar_url: getDirectImageUrl(formData.avatar_url) };
                    if (isCreating) {
                      if (onAddUser) onAddUser({ ...final, id: `u-${Date.now()}`, ativo: true });
                    } else {
                      onUpdateUser({ ...editingUser!, ...final });
                    }
                    setEditingUser(null); setIsCreating(false);
                  }}
                  className="flex-grow py-5 rounded-2xl bg-[#715C4A] text-white font-bold uppercase text-[10px] tracking-widest shadow-lg"
               >Confirmar Dados</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;
