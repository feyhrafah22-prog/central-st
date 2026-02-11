
export enum UserRole {
  COLABORADOR = 'Colaborador',
  FINANCEIRO = 'Financeiro',
  GESTAO = 'Gestão',
  COMERCIAL = 'Comercial'
}

export type PermissionKey = 'overtime' | 'equipment' | 'ranking' | 'pauta' | 'dashboard' | 'users';

export interface User {
  id: string;
  nome: string;
  email: string;
  password?: string;
  tipo_usuario: UserRole;
  setor: string;
  ativo: boolean;
  avatar_url?: string;
  data_contratacao?: string;
  permissoes: PermissionKey[];
}

export interface Overtime {
  id: string;
  user_id: string;
  user_nome?: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tempo_descanso_min: number;
  observacao: string;
  total_min_calculado: number;
}

export interface Equipment {
  id: string;
  categoria: string;
  nome: string;
  descricao: string;
  onde_fica: string;
  observacoes: string;
  foto_url: string;
  video_url?: string;
  manual_content?: string;
}

export interface RankingEntry {
  posicao: number;
  user_id: string;
  user_nome: string;
  user_avatar?: string;
  tarefas: number;
  entregas: number;
  progresso: number;
  realocs: number;
  pontos: number;
}

export interface DayTask {
  day: number;
  content: string;
}

export interface ColaboradorPauta {
  user_id: string;
  user_nome: string;
  user_avatar?: string;
  tasks: DayTask[];
}

export interface Announcement {
  id: string;
  data: string;
  titulo: string;
  conteudo: string;
  prioridade: 'normal' | 'alta';
}

export interface Faturamento {
  mes_referencia: string;
  valor: number;
}

export type ViewState = 'login' | 'signup' | 'home' | PermissionKey;
