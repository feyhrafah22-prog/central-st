
import { UserRole, User, Overtime, Equipment, RankingEntry, ColaboradorPauta, Announcement, Faturamento, PermissionKey } from '../types';

const ALL_PERMS: PermissionKey[] = ['overtime', 'equipment', 'ranking', 'pauta', 'dashboard'];

export const MOCK_USERS: User[] = [
  { id: 'u11', nome: 'Gestor', email: 'gestao@centralst.com', password: 'st@gestor@47', tipo_usuario: UserRole.GESTAO, setor: 'CEO', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1nG4-6yZyKRUUg_GCz4dROgu5NbueYmzt', data_contratacao: '2020-01-01', permissoes: [...ALL_PERMS, 'users'] },
  { id: 'u12', nome: 'Financeiro Central', email: 'financeiro@centralst.com', password: 'fin@central747', tipo_usuario: UserRole.FINANCEIRO, setor: 'Financeiro', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1Cn5Rmm-fGjD1pdvOkKZKIMTIE5MwQf0V', data_contratacao: '2021-06-01', permissoes: ['overtime', 'dashboard'] },
  { id: 'u1', nome: 'Eduarda', email: 'eduarda@centralst.com', password: 'st@eduarda@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Foto', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1DP1g2-f9ktN_J9Tv86_gWAoqTHz4AtNJ', data_contratacao: '2023-05-15', permissoes: ALL_PERMS },
  { id: 'u2', nome: 'Thomas', email: 'thomas@centralst.com', password: 'st@thomas@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Vídeo', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1R0K5kihGQ32w2IoMTLZOUMkRkaefmoDO', data_contratacao: '2024-01-10', permissoes: ALL_PERMS },
  { id: 'u3', nome: 'Marcelo', email: 'marcelo@centralst.com', password: 'st@marcelo@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Foto', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1qwGKleY4U_LG2ecv-OTrwBKm0YTxRh_K', data_contratacao: '2022-11-20', permissoes: ALL_PERMS },
  { id: 'u4', nome: 'Gustavo', email: 'gustavo@centralst.com', password: 'st@gustavo@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Foto', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1uQ2OMH_CWl72Rag664bAEYfvM3TCh-W_', data_contratacao: '2024-02-01', permissoes: ALL_PERMS },
  { id: 'u5', nome: 'Ismael', email: 'ismael@centralst.com', password: 'st@ismael@26', tipo_usuario: UserRole.COLABORADOR, setor: 'CEO', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1cCF-k9kVCfudRhqOvgooplqRleCKS4F4', data_contratacao: '2023-08-10', permissoes: ALL_PERMS },
  { id: 'u6', nome: 'Emerson', email: 'emerson@centralst.com', password: 'st@emerson@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Vídeo', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1IDpsUjXLdo67gsg_Fla9DgnZG-S3FCAK', data_contratacao: '2021-03-22', permissoes: ALL_PERMS },
  { id: 'u7', nome: 'Raissa', email: 'raissa@centralst.com', password: 'st@raissa@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Foto', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1iX6T1uEtR6az2h590K-NJI7Zf5SigVcI', data_contratacao: '2024-01-05', permissoes: ALL_PERMS },
  { id: 'u8', nome: 'Mariana', email: 'mariana@centralst.com', password: 'st@mariana@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Gestão de Projetos', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/19zuAAXQYsCJnmqOlX3VwKTcK2OKMD1nu', data_contratacao: '2023-12-01', permissoes: ALL_PERMS },
  { id: 'u9', nome: 'Rafael', email: 'rafael@centralst.com', password: 'st@rafael@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Comercial', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1gS2elugPLuW2-8ihJ5bk19lmI4uSyjOc', data_contratacao: '2024-02-15', permissoes: ALL_PERMS },
  { id: 'u10', nome: 'Fernanda', email: 'fernanda@centralst.com', password: 'st@fernanda@26', tipo_usuario: UserRole.COLABORADOR, setor: 'Editor de Vídeo', ativo: true, avatar_url: 'https://lh3.googleusercontent.com/d/1xuC9USso1uZfD1pWWIUdL3VBMR1Qf_b_', data_contratacao: '2024-03-01', permissoes: ALL_PERMS },
];

export const MOCK_RANKING: RankingEntry[] = [
  { posicao: 1, user_id: 'u1', user_nome: 'Eduarda', tarefas: 8, entregas: 225, progresso: 33.9, realocs: 0, pontos: 23.70 },
  { posicao: 2, user_id: 'u2', user_nome: 'Thomas', tarefas: 14, entregas: 21, progresso: 28.9, realocs: 0, pontos: 20.20 },
  { posicao: 3, user_id: 'u3', user_nome: 'Marcelo', tarefas: 11, entregas: 107, progresso: 27.4, realocs: 0, pontos: 19.21 },
  { posicao: 4, user_id: 'u4', user_nome: 'Gustavo', tarefas: 15, entregas: 156, progresso: 18.3, realocs: 0, pontos: 12.83 },
  { posicao: 5, user_id: 'u5', user_nome: 'Ismael', tarefas: 6, entregas: 8, progresso: 18.2, realocs: 0, pontos: 12.75 },
  { posicao: 6, user_id: 'u6', user_nome: 'Emerson', tarefas: 4, entregas: 22, progresso: 15.0, realocs: 0, pontos: 10.50 },
  { posicao: 7, user_id: 'u7', user_nome: 'Raissa', tarefas: 8, entregas: 82, progresso: 13.1, realocs: 0, pontos: 9.16 },
  { posicao: 8, user_id: 'u8', user_nome: 'Mariana', tarefas: 4, entregas: 4, progresso: 3.6, realocs: 0, pontos: 2.50 },
  { posicao: 9, user_id: 'u9', user_nome: 'Rafael', tarefas: 8, entregas: 27, progresso: 2.5, realocs: 0, pontos: 1.75 },
  { posicao: 10, user_id: 'u10', user_nome: 'Fernanda', tarefas: 0, entregas: 0, progresso: 0.0, realocs: 0, pontos: 0.00 },
];

export const MOCK_PAUTA: ColaboradorPauta[] = [
  { user_id: 'u6', user_nome: 'Emerson', tasks: [{ day: 2, content: 'Captação: Conecta 14h' }, { day: 4, content: 'Produção Satryani' }] },
  { user_id: 'u2', user_nome: 'Thomas', tasks: [{ day: 4, content: 'Produção Satryani' }] },
  { user_id: 'u3', user_nome: 'Marcelo', tasks: [{ day: 3, content: 'Montar luz Courovale' }] },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1',
    categoria: 'CÂMERAS',
    nome: 'Canon EOS R5',
    descricao: 'Mirrorless Full Frame 45MP',
    onde_fica: 'Armário A1',
    observacoes: 'Sempre conferir carga da bateria.',
    foto_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop',
    manual_content: 'A Canon EOS R5 é uma câmera mirrorless de alta performance.'
  },
];

export const MOCK_OVERTIME: Overtime[] = [
  { id: 'ot1', user_id: 'u6', user_nome: 'Emerson', data: '2024-02-10', hora_inicio: '18:00', hora_fim: '20:30', tempo_descanso_min: 15, observacao: 'Produção Satryani.', total_min_calculado: 135 }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', data: '2026-02-01', titulo: 'Ciclo de Fevereiro Iniciado', conteudo: 'O ranking "On Track" foi resetado. Boa sorte a todos!', prioridade: 'alta' }
];

export const MOCK_FATURAMENTO: Faturamento[] = [
  { mes_referencia: 'Out', valor: 45000 },
  { mes_referencia: 'Nov', valor: 52000 },
  { mes_referencia: 'Dez', valor: 68000 },
  { mes_referencia: 'Jan', valor: 58000 },
  { mes_referencia: 'Fev', valor: 65250 },
];
