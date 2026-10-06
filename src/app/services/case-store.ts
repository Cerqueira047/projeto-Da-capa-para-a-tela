import { Injectable, computed, effect, signal } from '@angular/core';
import { Connection, InvestigationCase } from '../models';

const INITIAL_CASES: InvestigationCase[] = [
  {
    id: 'IL-001',
    title: 'Operação Eclipse',
    location: 'Setor Norte',
    description:
      'Verificar os registros de acesso e os vínculos encontrados no arquivo do Setor Norte.',
    priority: 'Alta',
    status: 'ATIVO',
    evidence: 14,
    suspectIds: [1, 3, 6],
  },
  {
    id: 'IL-002',
    title: 'Linha Fantasma',
    location: 'Distrito Central',
    description: 'Comparar as informações de três registros ligados à mesma ocorrência.',
    priority: 'Média',
    status: 'ATIVO',
    evidence: 9,
    suspectIds: [2, 3, 8],
  },
  {
    id: 'IL-003',
    title: 'Arquivo Zero',
    location: 'Setor Leste',
    description: 'Dossiê encerrado, mantido no arquivo para consulta dos vínculos anteriores.',
    priority: 'Baixa',
    status: 'ARQUIVADO',
    evidence: 24,
    suspectIds: [4, 5],
  },
];

function isCase(value: unknown): value is InvestigationCase {
  if (!value || typeof value !== 'object') return false;
  const c = value as InvestigationCase;
  return (
    typeof c.id === 'string' &&
    typeof c.title === 'string' &&
    typeof c.description === 'string' &&
    typeof c.location === 'string' &&
    ['Alta', 'Média', 'Baixa'].includes(c.priority) &&
    ['ATIVO', 'ARQUIVADO'].includes(c.status) &&
    Number.isInteger(c.evidence) &&
    c.evidence >= 0 &&
    Array.isArray(c.suspectIds) &&
    c.suspectIds.every((id) => Number.isInteger(id) && id > 0)
  );
}

function readStorage<T>(key: string, fallback: T, valid: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const value: unknown = JSON.parse(raw);
      if (valid(value)) return value;
    }
  } catch {
    /* Dados indisponíveis ou corrompidos: usar o estado inicial. */
  }
  return fallback;
}

@Injectable({ providedIn: 'root' })
export class CaseStore {
  readonly cases = signal(
    readStorage(
      'interlink.cases.v1',
      INITIAL_CASES,
      (v): v is InvestigationCase[] =>
        Array.isArray(v) && v.every(isCase) && new Set(v.map((c) => c.id)).size === v.length,
    ),
  );
  readonly watchedIds = signal(
    readStorage<number[]>(
      'interlink.watch.v1',
      [],
      (v): v is number[] => Array.isArray(v) && v.every((id) => Number.isInteger(id) && id > 0),
    ),
  );
  readonly storageUnavailable = signal(false);
  readonly active = computed(() => this.cases().filter((c) => c.status === 'ATIVO').length);
  readonly evidence = computed(() => this.cases().reduce((total, c) => total + c.evidence, 0));

  // Arestas ligam pessoas de um mesmo caso. Um par aparece só uma vez na rede.
  readonly links = computed<Connection[]>(() => {
    const pairs = new Map<string, Connection>();
    for (const item of this.cases()) {
      const ids = [...new Set(item.suspectIds)].sort((a, b) => a - b);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = `${ids[i]}-${ids[j]}`;
          const previous = pairs.get(key);
          pairs.set(key, {
            from: ids[i],
            to: ids[j],
            cases: [...(previous?.cases ?? []), item.title],
          });
        }
      }
    }
    return [...pairs.values()];
  });

  constructor() {
    effect(() => {
      const cases = this.cases();
      const watched = this.watchedIds();
      try {
        localStorage.setItem('interlink.cases.v1', JSON.stringify(cases));
        localStorage.setItem('interlink.watch.v1', JSON.stringify(watched));
        this.storageUnavailable.set(false);
      } catch {
        this.storageUnavailable.set(true);
      }
    });
  }

  connectionsFor(id: number): Connection[] {
    return this.links().filter((link) => link.from === id || link.to === id);
  }

  toggleWatch(id: number): void {
    this.watchedIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  toggleStatus(id: string): void {
    this.cases.update((cases) =>
      cases.map((c) =>
        c.id === id ? { ...c, status: c.status === 'ATIVO' ? 'ARQUIVADO' : 'ATIVO' } : c,
      ),
    );
  }

  addCase(data: Omit<InvestigationCase, 'id' | 'status' | 'evidence'>): InvestigationCase {
    const item: InvestigationCase = {
      ...data,
      id: `IL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: 'ATIVO',
      evidence: 0,
    };
    this.cases.update((cases) => [item, ...cases]);
    return item;
  }
}
