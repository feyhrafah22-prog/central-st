
import React from 'react';
import { ColaboradorPauta } from '../types';

interface PautaProps {
  data: ColaboradorPauta[];
}

const PautaView: React.FC<PautaProps> = ({ data }) => {
  const days = Array.from({ length: 14 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">Pauta Semanal</h1>
          <p className="text-sm text-gray-500">Visualização de cronograma por colaborador.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2">
            Fevereiro 2026 <i className="fa-solid fa-chevron-down text-[10px]"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#715C4A] text-white">
                <th className="py-4 px-8 text-2xl font-bold border-r border-white/20 text-center w-64 uppercase tracking-tighter">Colaboradores</th>
                {days.map(day => (
                  <th key={day} className="py-4 px-2 text-3xl font-black border-r border-white/20 text-center min-w-[120px]">
                    {day.toString().padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((colab, idx) => (
                <tr key={colab.user_id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F5]'}`}>
                  <td className="py-4 px-6 border-r border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                         <img src={colab.user_avatar || `https://ui-avatars.com/api/?name=${colab.user_nome}&background=715C4A&color=fff`} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-[#1B1B1B] text-lg">{colab.user_nome}</span>
                    </div>
                  </td>
                  {days.map(day => {
                    const task = colab.tasks.find(t => t.day === day);
                    return (
                      <td key={day} className="py-4 px-3 border-r border-gray-100 min-h-[80px] align-top">
                        {task && (
                          <div className="text-[10px] font-bold text-[#1B1B1B] leading-tight break-words">
                            {task.content}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-[#715C4A]/5 p-6 rounded-2xl border border-[#715C4A]/10">
         <p className="text-xs font-bold text-[#715C4A] uppercase tracking-widest">Visualização da Quinzena Ativa</p>
         <div className="flex gap-4">
            <button className="bg-white w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 shadow-sm"><i className="fa-solid fa-chevron-left"></i></button>
            <button className="bg-white w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 shadow-sm"><i className="fa-solid fa-chevron-right"></i></button>
         </div>
      </div>
    </div>
  );
};

export default PautaView;
