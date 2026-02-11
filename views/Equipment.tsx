
import React, { useState } from 'react';
import { User, UserRole, Equipment } from '../types';

interface EquipmentProps {
  user: User;
  data: Equipment[];
}

const EquipmentView: React.FC<EquipmentProps> = ({ user, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [selectedManual, setSelectedManual] = useState<Equipment | null>(null);
  const [videoToPlay, setVideoToPlay] = useState<string | null>(null);
  
  const isGestao = user.tipo_usuario === UserRole.GESTAO;

  const categories = ['Todas', ...Array.from(new Set(data.map(item => item.categoria)))];

  const filteredData = data.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todas' || item.categoria === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1B1B1B] mb-2">Biblioteca de Equipamentos</h1>
          <div className="bg-white/40 border border-white/60 p-6 rounded-[2rem] max-w-4xl shadow-sm">
             <h2 className="text-[10px] font-bold text-[#715C4A] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
               <i className="fa-solid fa-circle-info"></i> Guia do Patrimônio
             </h2>
             <p className="text-sm text-gray-600 leading-relaxed">
                Este espaço foi criado para garantir que todos no estúdio falem a mesma língua. Aqui, você pode <strong>identificar visualmente</strong> cada item pelo nome, entender sua função através da <strong>descrição técnica</strong> e aprender o manuseio correto via <strong>vídeos e manuais</strong>. Nosso objetivo é a organização total: saber exatamente o que temos, onde fica e como extrair o melhor de cada ferramenta.
             </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="O que você procura?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[#715C4A] w-full md:w-64 shadow-sm"
            />
          </div>
          {isGestao && (
            <button className="bg-[#715C4A] text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-[#5a493b] transition-all">
              NOVO ITEM
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeCategory === cat ? 'bg-[#715C4A] text-white shadow-md' : 'bg-white text-gray-400 hover:text-[#715C4A] border border-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredData.map(item => (
          <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all group flex flex-col p-2">
            <div className="h-56 overflow-hidden relative rounded-[2rem]">
              <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute top-4 left-4 bg-[#715C4A] text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">{item.categoria}</div>
              {isGestao && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-white/90 text-[#715C4A] flex items-center justify-center shadow-lg hover:bg-white"><i className="fa-solid fa-pen text-xs"></i></button>
                </div>
              )}
            </div>
            <div className="px-6 py-6 flex-grow flex flex-col">
              <h3 className="text-2xl font-bold text-[#1B1B1B] mb-1">{item.nome}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-2">{item.descricao}</p>
              
              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100/50">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#715C4A] shadow-sm">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Onde encontrar</p>
                    <p className="text-sm font-bold text-[#1B1B1B]">{item.onde_fica}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {item.video_url && (
                    <button 
                      onClick={() => setVideoToPlay(item.video_url || null)}
                      className="flex-grow bg-[#DCD8D1] text-[#715C4A] text-[9px] font-bold py-3 rounded-xl text-center uppercase tracking-widest hover:bg-[#715C4A] hover:text-white transition-all shadow-sm"
                    >
                      VÍDEO <i className="fa-solid fa-play ml-1"></i>
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedManual(item)}
                    className="flex-grow border border-gray-100 text-[#1B1B1B] text-[9px] font-bold py-3 rounded-xl uppercase tracking-widest hover:border-[#715C4A] hover:bg-gray-50 transition-all"
                  >
                    FICHA TÉCNICA
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <i className="fa-solid fa-box-open text-4xl text-gray-200 mb-4"></i>
            <p className="text-gray-400 text-sm">Nenhum equipamento encontrado com estes termos.</p>
          </div>
        )}
      </div>

      {/* Manual Modal */}
      {selectedManual && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-hidden animate-scaleUp">
            <button onClick={() => setSelectedManual(null)} className="absolute top-8 right-8 text-gray-400 hover:text-[#1B1B1B] transition-colors"><i className="fa-solid fa-xmark text-2xl"></i></button>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-[2rem] overflow-hidden shadow-lg">
                <img src={selectedManual.foto_url} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#715C4A] uppercase tracking-widest">{selectedManual.categoria}</span>
                <h2 className="text-3xl font-bold text-[#1B1B1B]">{selectedManual.nome}</h2>
              </div>
            </div>
            <div className="space-y-6">
               <div>
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Manual Técnico & Uso</h4>
                 <p className="text-gray-600 leading-relaxed text-sm">{selectedManual.manual_content || "Nenhuma informação técnica cadastrada para este item."}</p>
               </div>
               <div className="bg-[#F8F7F5] p-6 rounded-3xl border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-comment-dots text-[#715C4A]"></i> Observações de Gestão
                  </h4>
                  <p className="text-sm italic text-gray-700 leading-relaxed">"{selectedManual.observacoes}"</p>
               </div>
            </div>
            <div className="mt-10 flex justify-end">
               <button onClick={() => setSelectedManual(null)} className="bg-[#715C4A] text-white px-12 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#5a493b] transition-all">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoToPlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-black w-full max-w-4xl aspect-video rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10 animate-scaleUp">
            <button onClick={() => setVideoToPlay(null)} className="absolute top-6 right-6 z-10 text-white/50 hover:text-white transition-colors bg-black/40 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"><i className="fa-solid fa-xmark text-xl"></i></button>
            <iframe 
              src={videoToPlay.includes('youtube') ? videoToPlay.replace('watch?v=', 'embed/') : videoToPlay} 
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentView;
