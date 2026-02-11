
import React, { useState } from 'react';
import { User, UserRole, Overtime } from '../types';

interface OvertimeProps {
  user: User;
  data: Overtime[];
  onAdd: (entry: Omit<Overtime, 'id'>) => void;
  onUpdate: (entry: Overtime) => void;
}

const OvertimeView: React.FC<OvertimeProps> = ({ user, data, onAdd, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA'); 

  const [currentDateFilter, setCurrentDateFilter] = useState(new Date());
  const [filterUser, setFilterUser] = useState('');
  
  const [formData, setFormData] = useState({
    data: todayStr,
    hora_inicio: '',
    hora_fim: '',
    tempo_descanso_min: '' as string | number,
    observacao: ''
  });

  // Fix: Property 'OPERACIONAL' does not exist on type 'typeof UserRole'. Using COLABORADOR instead.
  const isOperacional = user.tipo_usuario === UserRole.COLABORADOR;
  const isFinanceOrGestao = [UserRole.GESTAO, UserRole.FINANCEIRO].includes(user.tipo_usuario);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDateFilter.getFullYear(), currentDateFilter.getMonth() + offset, 1);
    setCurrentDateFilter(newDate);
  };

  const filterMonthStr = currentDateFilter.toISOString().substring(0, 7); 
  const monthName = currentDateFilter.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const formatDateSafe = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const openForm = (existing?: Overtime) => {
    if (existing) {
      setEditingId(existing.id);
      setFormData({
        data: existing.data,
        hora_inicio: existing.hora_inicio,
        hora_fim: existing.hora_fim,
        tempo_descanso_min: existing.tempo_descanso_min,
        observacao: existing.observacao
      });
    } else {
      setEditingId(null);
      setFormData({
        data: todayStr,
        hora_inicio: '',
        hora_fim: '',
        tempo_descanso_min: '',
        observacao: ''
      });
    }
    setShowForm(true);
  };

  const filteredData = data.filter(item => {
    const isUserMatch = isOperacional ? item.user_id === user.id : (filterUser ? item.user_nome?.toLowerCase().includes(filterUser.toLowerCase()) : true);
    const isMonthMatch = item.data.startsWith(filterMonthStr);
    return isUserMatch && isMonthMatch;
  });

  const totalMinutes = filteredData.reduce((acc, curr) => acc + curr.total_min_calculado, 0);
  const formatMinutes = (total: number) => {
    const hours = Math.floor(total / 60);
    const minutes = Math.round(total % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`1970-01-01T${formData.hora_inicio}`);
    const end = new Date(`1970-01-01T${formData.hora_fim}`);
    let diffMin = (end.getTime() - start.getTime()) / 60000;
    if (diffMin < 0) diffMin += 1440; 
    
    const descanso = parseInt(formData.tempo_descanso_min.toString()) || 0;
    diffMin = Math.max(0, diffMin - descanso);

    if (editingId) {
      onUpdate({
        id: editingId,
        user_id: user.id,
        user_nome: user.nome,
        data: formData.data,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        tempo_descanso_min: descanso,
        observacao: formData.observacao,
        total_min_calculado: Math.round(diffMin)
      });
    } else {
      onAdd({
        user_id: user.id,
        user_nome: user.nome,
        data: formData.data,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        tempo_descanso_min: descanso,
        observacao: formData.observacao,
        total_min_calculado: Math.round(diffMin)
      });
    }
    setShowForm(false);
  };

  const exportCSV = () => {
    const headers = ['Data', 'Colaborador', 'Início', 'Fim', 'Pausa_Min', 'Total_Min'];
    const rows = filteredData.map(d => [
      d.data, d.user_nome, d.hora_inicio, d.hora_fim, d.tempo_descanso_min, d.total_min_calculado
    ]);
    const csvContent = "\uFEFF" + headers.join(',') + '\n' + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `horas_extras_${filterMonthStr}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">
            {isOperacional ? 'Meus Lançamentos de Horas' : 'Gestão Global de Horas Extras'}
          </h1>
          <p className="text-sm text-gray-500">
            {isOperacional ? 'Acompanhe seu banco de horas mensal.' : 'Controle total dos registros de horas extras da equipe.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => changeMonth(-1)}
              className="px-4 py-3 hover:bg-gray-50 text-gray-400 hover:text-[#715C4A] transition-colors border-r border-gray-50"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <div className="px-6 py-2 min-w-[160px] text-center">
              <span className="text-xs font-bold text-[#1B1B1B] uppercase tracking-widest block leading-none mb-1">Período</span>
              <span className="text-sm font-medium text-[#715C4A] capitalize">{monthName}</span>
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="px-4 py-3 hover:bg-gray-50 text-gray-400 hover:text-[#715C4A] transition-colors border-l border-gray-50"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          {!isOperacional && (
            <input 
              type="text" 
              placeholder="Buscar colaborador..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl px-5 py-3 text-sm focus:border-[#715C4A] focus:outline-none w-48 shadow-sm"
            />
          )}

          <div className="flex gap-2">
            {isFinanceOrGestao && (
              <button onClick={exportCSV} className="bg-white border border-[#715C4A]/20 text-[#715C4A] px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#715C4A] hover:text-white transition-all shadow-sm">
                CSV
              </button>
            )}
            <button onClick={() => openForm()} className="bg-[#715C4A] text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#5a493b] transition-all">
              CADASTRAR HORAS
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tempo Total (HH:mm)</p>
           <h3 className="text-3xl font-bold text-[#715C4A]">{formatMinutes(totalMinutes)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registros no Período</p>
           <h3 className="text-3xl font-bold text-[#1B1B1B]">{filteredData.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F7F5] border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                {!isOperacional && <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colaborador</th>}
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Período</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Observação</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.map((item) => {
                const isEditable = item.data === todayStr && item.user_id === user.id;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-sm font-medium text-[#1B1B1B]">{formatDateSafe(item.data)}</td>
                    {!isOperacional && <td className="px-8 py-4 text-sm text-gray-600 font-bold">{item.user_nome}</td>}
                    <td className="px-8 py-4 text-xs text-gray-400 whitespace-nowrap">{item.hora_inicio} - {item.hora_fim} ({item.tempo_descanso_min}m pausa)</td>
                    <td className="px-8 py-4 text-sm text-gray-600 italic">"{item.observacao}"</td>
                    <td className="px-8 py-4 text-sm font-bold text-[#715C4A]">{formatMinutes(item.total_min_calculado)}</td>
                    <td className="px-8 py-4 text-right">
                        {isEditable && (
                          <button 
                            onClick={() => openForm(item)}
                            className="w-9 h-9 inline-flex items-center justify-center bg-white text-[#715C4A] border border-[#715C4A]/20 hover:bg-[#715C4A] hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                        )}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={isOperacional ? 5 : 6} className="px-8 py-20 text-center text-gray-400 text-sm">
                    Nenhum registro encontrado para este mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-scaleUp">
            <h2 className="text-2xl font-bold mb-8 text-[#1B1B1B]">{editingId ? 'Editar Lançamento' : 'Lançar Horas Extras'}</h2>
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Data</label>
                  <input type="date" required value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:border-[#715C4A] focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Início</label>
                  <input type="time" required value={formData.hora_inicio} onChange={e => setFormData({...formData, hora_inicio: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:border-[#715C4A] focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Fim</label>
                  <input type="time" required value={formData.hora_fim} onChange={e => setFormData({...formData, hora_fim: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:border-[#715C4A] focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Descanso (Min)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={formData.tempo_descanso_min} 
                    onChange={e => setFormData({...formData, tempo_descanso_min: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:border-[#715C4A] focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Observação</label>
                  <textarea required rows={3} value={formData.observacao} onChange={e => setFormData({...formData, observacao: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 focus:border-[#715C4A] focus:outline-none resize-none" placeholder="Qual projeto ou demanda?" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-grow bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
                <button type="submit" className="flex-grow bg-[#715C4A] text-white font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#5a493b] transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimeView;
