import { Component, input } from '@angular/core';
@Component({
  selector: 'app-stat-card',
  template: `
    <article class="panel flex h-full items-end justify-between gap-4 p-6">
      <div>
        <p class="font-mono text-xs uppercase tracking-wider text-muted">{{ label() }}</p>
        <strong class="mt-3 block text-4xl leading-none font-bold tracking-tight">{{
          value()
        }}</strong>
        <p class="mt-3 text-xs text-muted">{{ detail() }}</p>
      </div>
      <span class="pb-1 font-mono text-xl text-cyan" aria-hidden="true">↗</span>
    </article>
  `,
})
export class StatCard {
  label = input.required<string>();
  value = input.required<string>();
  detail = input('');
}
