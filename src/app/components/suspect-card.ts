import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Suspect } from '../models';
@Component({
  selector: 'app-suspect-card',
  imports: [RouterLink],
  template: `
    <article class="panel flex h-full flex-col p-5 transition-colors hover:border-cyan/40">
      <div class="flex items-center justify-between gap-3">
        <span class="font-mono text-xs text-muted"
          >REG. #{{ s().id.toString().padStart(3, '0') }}</span
        ><span class="risk-badge" [attr.data-risk]="s().risk === 'MÉDIO' ? 'MEDIO' : s().risk"
          >RISCO {{ s().risk }}</span
        >
      </div>
      <div class="my-6 flex items-center gap-4">
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-line bg-ink font-mono text-sm text-cyan"
          aria-hidden="true"
          >{{ initials() }}</span
        >
        <div class="min-w-0">
          <h2 class="text-lg leading-snug font-bold">{{ s().name }}</h2>
          <p class="mt-1 break-all text-xs text-muted">&#64;{{ s().username }}</p>
        </div>
      </div>
      <p class="text-sm text-muted">{{ s().company }}</p>
      <p class="mt-1 text-xs text-muted">{{ s().city }}</p>
      <div class="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        <span class="font-mono text-xs text-cyan">{{ connections() }} conexões</span
        ><button
          type="button"
          (click)="watchToggled.emit(s().id)"
          [attr.aria-pressed]="watched()"
          [attr.aria-label]="(watched() ? 'Parar de acompanhar ' : 'Acompanhar ') + s().name"
          class="min-h-11 rounded px-2 text-xs text-muted hover:text-paper"
          [class.text-success]="watched()"
        >
          {{ watched() ? '✓ Acompanhando' : '+ Acompanhar' }}
        </button>
      </div>
      <a
        class="btn btn-secondary mt-3 w-full"
        [routerLink]="['/suspeitos', s().id]"
        [attr.aria-label]="'Abrir dossiê de ' + s().name"
        >Abrir dossiê <span aria-hidden="true">↗</span></a
      >
    </article>
  `,
})
export class SuspectCard {
  s = input.required<Suspect>();
  connections = input(0);
  watched = input(false);
  watchToggled = output<number>();
  initials = computed(() =>
    this.s()
      .name.split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join(''),
  );
}
