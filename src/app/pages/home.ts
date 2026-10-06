import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCard } from '../components/stat-card';
import { ConnectionMap } from '../components/connection-map';
import { CaseStore } from '../services/case-store';
import { DirectoryService } from '../services/directory.service';
@Component({
  selector: 'app-home',
  imports: [RouterLink, StatCard, ConnectionMap],
  templateUrl: './home.html',
})
export class Home {
  readonly store = inject(CaseStore);
  readonly directory = inject(DirectoryService);
  readonly status = computed(() =>
    this.store.active() > 0 ? 'INVESTIGAÇÕES EM ANDAMENTO' : 'ARQUIVO EM DIA',
  );
  readonly records = computed(() =>
    this.directory.state() === 'ready'
      ? this.directory.people().length.toString().padStart(2, '0')
      : '—',
  );
}
