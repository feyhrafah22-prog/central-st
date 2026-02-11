
import React, { useState, useMemo } from 'react';
import { User, UserRole, Faturamento, Overtime } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ResponsiveContainer as RC } from 'recharts';
import { MOCK_USERS } from '../services/mockData';

interface DashboardProps {
  user: User;
  faturamento: Faturamento[];
  overtime: Overtime[];
}

const DashboardView: React.FC<DashboardProps> = ({ user, faturamento, overtime }) => {
  const isFinanceOrGestao = [UserRole.GESTAO, UserRole.FINANCEIRO].includes(user.tipo_usuario);
  
  // Estado para filtro de colaborador (Privilegiados podem mudar, Operacional é fixo)
  const [selectedColabId, setSelectedColabId] = useState<string>(user.id);

  // Lista de colaboradores operacionais para o filtro
  const colaboradores = useMemo(() => {
    // Fix: Property 'OPERACIONAL' does not exist on type 'typeof UserRole'. Using COLABORADOR instead.
    return MOCK_USERS.filter(u => u.tipo_usuario === UserRole.COLABORADOR);
  }, []);

  // Datas de referência
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // "YYYY-MM"
  
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = lastMonth.toISOString().substring(0, 7);

  // Processamento de dados para the colaborador selecionado
  const colabStats = useMemo(() => {
    const colabOvertime = overtime.filter(ot => ot.user_id === selectedColabId);
    
    // Total Mês Atual
    const currentMonthTotal = colabOvertime
      .filter(ot => ot.data.startsWith(currentMonthStr))
      .reduce((acc, curr) => acc + curr.total_min_calculado, 0) / 60;

    // Total Mês Passado
    const lastMonthTotal = colabOvertime
      .filter(ot => ot.data.startsWith(lastMonthStr))
      .reduce((acc, curr) => acc + curr.total_min_calculado, 0) / 60;

    // Distribuição Semanal Mês Atual
    const weeklyData = [
      { name: 'Sem 1', hours: 0 }, // dias 1-7
      { name: 'Sem 2', hours: 0 }, // dias 8-14
      { name: 'Sem 3', hours: 0 }, // dias 15-21
      { name: 'Sem 4+', hours: 0 }, // dia 22+
    ];

    colabOvertime.filter(ot => ot.data.startsWith(currentMonthStr)).forEach(ot => {
      const day = parseInt(ot.data.split('-')[2]);
      const hours = ot.total_min_calculado / 60;
      if (day <= 7) weeklyData[0].hours += hours;
      else if (day <= 14) weeklyData[1].hours += hours;
      else if (day <= 21) weeklyData[2].hours += hours;
      else weeklyData[3].hours += hours;
    });

    return {
      currentMonthTotal: parseFloat(currentMonthTotal.toFixed(1)),
      lastMonthTotal: parseFloat(lastMonthTotal.toFixed(1)),
      weeklyData: weeklyData.map(d => ({ ...d, hours: parseFloat(d.hours.toFixed(1)) })),
      colabName: colaboradores.find(c => c.id === selectedColabId)?.nome || user.nome
    };
  }, [selectedColabId, overtime, currentMonthStr, lastMonthStr, colaboradores, user.nome]);

  // Dados macro (Geral do estúdio)
  const totalFaturado = faturamento.reduce((acc, curr) => acc + curr.valor, 0);
  const avgFaturamento = (totalFaturado / faturamento.length).toFixed(0);
  const lastMonthValue = faturamento[faturamento.length - 1]?.valor || 0;

  // Overtime por colaborador (Ranking de horas - para Gestão)
  const barDataGlobal = useMemo(() => {
    const map: Record<string, number> = {};
    overtime.filter(ot => ot.data.startsWith(currentMonthStr)).forEach(ot => {
      const name = ot.user_nome || 'Desconhecido';
      map[name] = (map[name] || 0) + (ot.total_min_calculado / 60);
    });
    return Object.entries(map).map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(1)) }));
  }, [overtime, currentMonthStr]);

  const COLORS_LIST = ['#715C4A', '#B2AC9E', '#1B1B1B', '#DCD8D1'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">Dashboards de Indicadores</h1>
          <p className="text-sm text-gray-500">Acompanhamento de metas e produtividade.</p>
        </div>
        
        {isFinanceOrGestao && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Analisar:</span>
            <select 
              value={selectedColabId}
              onChange={(e) => setSelectedColabId(e.target.value)}
              className="bg-gray-50 text-sm font-bold text-[#715C4A] border-none focus:ring-0 rounded-xl px-4 py-2 cursor-pointer"
            >
              <option value={user.id}>Meu Desempenho</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cards de Destaque do Colaborador Selecionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#715C4A] p-8 rounded-[2.5rem] shadow-lg text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-clock text-6xl"></i>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-1">Horas Mês Atual</p>
           <h3 className="text-4xl font-black">{colabStats.currentMonthTotal}h</h3>
           <p className="text-xs mt-4 font-medium opacity-80 italic">Referente a {colabStats.colabName}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Mês Anterior</p>
           <h3 className="text-3xl font-bold text-[#1B1B1B]">{colabStats.lastMonthTotal}h</h3>
           <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colabStats.currentMonthTotal >= colabStats.lastMonthTotal ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {colabStats.currentMonthTotal >= colabStats.lastMonthTotal ? 'Aumento' : 'Redução'}
              </span>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Status de Faturamento</p>
           <h3 className="text-3xl font-bold text-[#1B1B1B]">R$ {lastMonthValue.toLocaleString('pt-BR')}</h3>
           <p className="text-[10px] text-[#715C4A] font-bold mt-2 uppercase tracking-widest">Global Steffen Studio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Semanal do Colaborador */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#1B1B1B]">Distribuição Semanal (Horas)</h3>
            <span className="text-[10px] font-bold text-[#715C4A] bg-[#715C4A]/5 px-3 py-1 rounded-full uppercase">Mês Vigente</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colabStats.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B2AC9E', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B2AC9E'}} />
                <Tooltip 
                  cursor={{fill: '#F8F7F5'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value) => [`${value} horas`, 'Tempo']}
                />
                <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={40}>
                  {colabStats.weeklyData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#715C4A' : '#B2AC9E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Faturamento Global */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-8 text-[#1B1B1B]">Evolução Financeira Global</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={faturamento}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#715C4A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#715C4A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="mes_referencia" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B2AC9E'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B2AC9E'}} hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Faturamento']}
                />
                <Area type="monotone" dataKey="valor" stroke="#715C4A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking de Horas (Visível para Gestão/Financeiro) */}
        {isFinanceOrGestao && (
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-8 text-[#1B1B1B]">Visão Geral: Horas Extras da Equipe (Mês Atual)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barDataGlobal} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#B2AC9E'}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{fontSize: 10, fill: '#1B1B1B', fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f8f8f8'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="hours" radius={[0, 8, 8, 0]} barSize={20}>
                    {barDataGlobal.map((_, index) => (
                      <Cell key={`cell-global-${index}`} fill={COLORS_LIST[index % COLORS_LIST.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
