
import React, { useState, useMemo } from 'react';
import { User, ViewState, UserRole, Announcement } from '../types';
import { MOCK_ANNOUNCEMENTS } from '../services/mockData';

interface HomeProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  reportUrl: string;
}

const Home: React.FC<HomeProps> = ({ user, onNavigate, reportUrl }) => {
  const [announcements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  
  const isGestao = user.tipo_usuario === UserRole.GESTAO;
  const isFinanceiro = user.tipo_usuario === UserRole.FINANCEIRO;

  // Cálculo de Tempo de Casa
  const tenure = useMemo(() => {
    if (!user.data_contratacao) return null;
    const start = new Date(user.data_contratacao);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  }, [user.data_contratacao]);

  // Cálculo do 5º Dia Útil (Simplificado)
  const fifthBusinessDay = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    let businessDaysCount = 0;
    let currentDay = 1;
    
    while (businessDaysCount < 5) {
      const date = new Date(year, month, currentDay);
      const dayOfWeek = date.getDay();
      
      // Considera Segunda a Sexta como dia útil (0=Dom, 6=Sab)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysCount++;
      }
      
      if (businessDaysCount < 5) currentDay++;
    }
    
    return new Date(year, month, currentDay).toLocaleDateString('pt-BR');
  }, []);

  // Feriados MOCK para Fev/Março 2026
  const holidays = [
    { date: '17/02', name: 'Carnaval (Terça)' },
    { date: '03/04', name: 'Sexta-feira Santa' },
    { date: '21/04', name: 'Tiradentes' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-light text-[#1B1B1B]">Olá, <span className="font-bold">{user.nome.split(' ')[0]}</span></h1>
          <p className="text-xs text-[#715C4A] font-bold uppercase tracking-widest mt-1">{user.setor} • CENTRAL ST</p>
        </div>
        {!isFinanceiro && (
          <a 
            href={reportUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#715C4A] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-all uppercase tracking-widest text-xs"
          >
            <i className="fa-solid fa-file-pen"></i>
            Enviar Report Diário
          </a>
        )}
      </div>

      {/* Info Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tempo de Casa */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#DCD8D1] flex items-center justify-center text-[#715C4A] text-2xl mb-4">
            <i className="fa-solid fa-heart"></i>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Seu Tempo no Estúdio</h3>
          {tenure ? (
            <div className="space-y-1">
              <p className="text-3xl font-black text-[#1B1B1B]">
                {tenure.years} {tenure.years === 1 ? 'ano' : 'anos'}
              </p>
              <p className="text-sm text-[#715C4A] font-bold uppercase tracking-widest">
                e {tenure.days} {tenure.days === 1 ? 'dia' : 'dias'} de história
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Data não cadastrada.</p>
          )}
        </div>

        {/* Pagamento */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#DCD8D1] flex items-center justify-center text-[#715C4A] text-2xl mb-4">
            <i className="fa-solid fa-money-bill-trend-up"></i>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Previsão de Pagamento</h3>
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#1B1B1B]">{fifthBusinessDay}</p>
            <p className="text-sm text-[#715C4A] font-bold uppercase tracking-widest">
              5º dia útil do mês
            </p>
          </div>
        </div>

        {/* Feriados */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#DCD8D1] flex items-center justify-center text-[#715C4A] text-2xl mb-4">
            <i className="fa-solid fa-calendar-star"></i>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Próximos Feriados</h3>
          <div className="w-full space-y-3">
            {holidays.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl">
                <span className="text-xs font-black text-[#1B1B1B]">{h.date}</span>
                <span className="text-[10px] text-[#715C4A] font-bold uppercase truncate ml-2">{h.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#F8F7F5]">
           <h2 className="text-xl font-bold text-[#1B1B1B] flex items-center gap-3">
             <i className="fa-solid fa-bullhorn text-[#715C4A]"></i>
             Comunicados Internos
           </h2>
           {isGestao && (
             <button className="text-xs font-bold text-[#715C4A] border border-[#715C4A] px-4 py-2 rounded-full hover:bg-[#715C4A] hover:text-white transition-all">
               NOVO COMUNICADO
             </button>
           )}
        </div>
        <div className="p-8 space-y-6">
          {announcements.map((ann) => (
            <div key={ann.id} className={`p-6 rounded-2xl border-l-4 ${ann.prioridade === 'alta' ? 'border-red-400 bg-red-50/30' : 'border-[#715C4A] bg-[#DCD8D1]/10'} group transition-all relative`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(ann.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <h4 className="text-lg font-bold text-[#1B1B1B] mb-2">{ann.titulo}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{ann.conteudo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
