
import React from 'react';
import { RankingEntry } from '../types';

interface RankingProps {
  data: RankingEntry[];
}

const RankingView: React.FC<RankingProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.posicao - b.posicao);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header Branding */}
      <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100">
        <div className="flex items-center gap-8">
           <h1 className="text-7xl font-black text-[#1B1B1B] tracking-tighter">ON TRACK</h1>
           <div className="text-5xl text-yellow-500">
             <i className="fa-solid fa-medal"></i>
           </div>
        </div>
        <div className="flex flex-col items-center md:items-end">
           <p className="text-4xl font-bold text-[#1B1B1B]">Ciclo 2 - Fev</p>
           <div className="flex gap-4 text-xs font-bold text-gray-400 mt-2 tracking-widest uppercase">
             <span>29/01/2026</span>
             <span>28/02/2026</span>
           </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="bg-white rounded-[2.5rem] shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#715C4A] text-white text-[10px] font-bold uppercase tracking-widest text-center">
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20">Ranking</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20 text-left">Colaborador</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20">Tarefas</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20">Entregas</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20 w-64">Progresso</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20">%</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20 bg-[#FBBF24]">Realocs</th>
                <th className="py-4 px-6 border-r border-[#DCD8D1]/20 bg-[#EF4444]">Pontos</th>
                <th className="py-4 px-6">Flags</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((entry, idx) => (
                <tr key={entry.user_id} className={`text-center font-bold text-xl border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F5]'}`}>
                  <td className="py-5 px-6 text-3xl font-black">{entry.posicao}</td>
                  <td className="py-5 px-6 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#715C4A]/20 shadow-sm">
                        <img src={entry.user_avatar || `https://ui-avatars.com/api/?name=${entry.user_nome}&background=715C4A&color=fff`} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-2xl">{entry.user_nome}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-3xl">{entry.tarefas}</td>
                  <td className="py-5 px-6 text-3xl">{entry.entregas}</td>
                  <td className="py-5 px-6">
                    <div className="w-full bg-[#DCD8D1]/40 h-10 rounded-sm overflow-hidden flex justify-start">
                       <div className="bg-[#B2AC9E] h-full" style={{ width: `${entry.progresso}%` }}></div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-2xl">{entry.progresso.toFixed(1).replace('.', ',')}%</td>
                  <td className="py-5 px-6 text-3xl">{entry.realocs}</td>
                  <td className="py-5 px-6 text-3xl">{entry.pontos.toFixed(2).replace('.', ',')}</td>
                  <td className="py-5 px-6"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingView;
