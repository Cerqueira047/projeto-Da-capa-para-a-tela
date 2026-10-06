import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CaseStore } from '../services/case-store';
import { DirectoryService } from '../services/directory.service';
import { ConnectionMap } from '../components/connection-map';
@Component({
  selector: 'app-detail',
  imports: [RouterLink, ConnectionMap],
  templateUrl: './detail.html',
})
export class Detail {
  readonly directory = inject(DirectoryService);
  readonly store = inject(CaseStore);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  readonly id = computed(() => Number(this.params().get('id')));
  readonly person = computed(
    () => this.directory.people().find((person) => person.id === this.id()) ?? null,
  );
  readonly linkedCases = computed(() =>
    this.store.cases().filter((item) => item.suspectIds.includes(this.id())),
  );
  readonly related = computed(() =>
    this.store.connectionsFor(this.id()).flatMap((link) => {
      const id = link.from === this.id() ? link.to : link.from;
      const person = this.directory.people().find((person) => person.id === id);
      return person ? [{ person, cases: link.cases }] : [];
    }),
  );
  readonly graphPeople = computed(() => {
    const person = this.person();
    return person ? [person, ...this.related().map((item) => item.person)] : [];
  });
  readonly riskLabel = computed(() =>
    this.person()?.risk === 'ALTO' ? 'Monitoramento prioritário' : 'Monitoramento padrão',
  );
  readonly watched = computed(() => this.store.watchedIds().includes(this.id()));
}
