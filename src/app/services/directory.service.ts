import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { Suspect } from '../models';

@Injectable({ providedIn: 'root' })
export class DirectoryService {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly people = signal<Suspect[]>([]);
  readonly state = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly loading = computed(() => this.state() === 'loading');

  load(): void {
    if (this.loading()) return;
    this.state.set('loading');
    this.api
      .getSuspects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (people) => {
          this.people.set(people);
          this.state.set('ready');
        },
        error: () => this.state.set('error'),
      });
  }
}
