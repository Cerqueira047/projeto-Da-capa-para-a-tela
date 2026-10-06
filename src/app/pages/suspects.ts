import { Component, computed, inject, signal } from '@angular/core';
import { SuspectCard } from '../components/suspect-card';
import { CaseStore } from '../services/case-store';
import { DirectoryService } from '../services/directory.service';
import { Risk } from '../models';
@Component({ selector: 'app-suspects', imports: [SuspectCard], templateUrl: './suspects.html' })
export class Suspects {
  readonly directory = inject(DirectoryService);
  readonly store = inject(CaseStore);
  readonly search = signal('');
  readonly risk = signal<Risk | ''>('');
  readonly onlyWatched = signal(false);
  readonly filtered = computed(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const query = normalize(this.search().trim());
    return this.directory
      .people()
      .filter(
        (person) =>
          normalize(`${person.name} ${person.username} ${person.company} ${person.city}`).includes(
            query,
          ) &&
          (!this.risk() || person.risk === this.risk()) &&
          (!this.onlyWatched() || this.store.watchedIds().includes(person.id)),
      );
  });
  readonly high = computed(() => this.filtered().filter((person) => person.risk === 'ALTO').length);
  readonly count = computed(() => this.filtered().length);

  setRisk(value: string): void {
    this.risk.set(value === 'BAIXO' || value === 'MÉDIO' || value === 'ALTO' ? value : '');
  }
  clearFilters(): void {
    this.search.set('');
    this.risk.set('');
    this.onlyWatched.set(false);
  }
}
