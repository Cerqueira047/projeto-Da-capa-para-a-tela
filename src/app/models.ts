export type Risk = 'BAIXO' | 'MÉDIO' | 'ALTO';
export type Priority = 'Baixa' | 'Média' | 'Alta';

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: { city: string };
  company: { name: string };
}

export interface Suspect {
  id: number;
  name: string;
  username: string;
  email: string;
  city: string;
  company: string;
  risk: Risk;
}

export interface InvestigationCase {
  id: string;
  title: string;
  location: string;
  description: string;
  priority: Priority;
  status: 'ATIVO' | 'ARQUIVADO';
  evidence: number;
  suspectIds: number[];
}

export interface Connection {
  from: number;
  to: number;
  cases: string[];
}
