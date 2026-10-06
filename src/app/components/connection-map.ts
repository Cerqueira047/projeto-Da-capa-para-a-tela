import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Connection, Suspect } from '../models';

@Component({
  selector: 'app-connection-map',
  imports: [RouterLink],
  template: `
    <div class="network-surface overflow-hidden rounded-md border border-line">
      <div
        class="flex justify-between border-b border-line px-5 py-4 font-mono text-[10px] text-muted"
      >
        <span>MAPA DE VÍNCULOS</span
        ><span class="text-cyan">{{ visibleLinks().length }} LIGAÇÕES</span>
      </div>
      <svg
        viewBox="0 0 480 300"
        class="block w-full"
        role="img"
        aria-label="Mapa de conexões entre registros. Os mesmos dossiês estão disponíveis nos links abaixo."
      >
        <defs>
          <radialGradient id="map-glow">
            <stop offset="0" stop-color="#42D9FF" stop-opacity=".08" />
            <stop offset="1" stop-color="#42D9FF" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="240" cy="150" r="145" fill="url(#map-glow)" />
        <circle cx="240" cy="150" r="106" fill="none" stroke="#273140" stroke-dasharray="3 7" />
        @for (link of visibleLinks(); track link.key) {
          <line
            [attr.x1]="link.x1"
            [attr.y1]="link.y1"
            [attr.x2]="link.x2"
            [attr.y2]="link.y2"
            stroke="#42D9FF"
            stroke-opacity=".4"
          />
        }
        @for (node of nodes(); track node.id) {
          <circle
            [attr.cx]="node.x"
            [attr.cy]="node.y"
            r="19"
            fill="#0E131C"
            [attr.stroke]="node.id === highlighted() ? '#F26A3D' : '#42D9FF'"
          />
          <text
            [attr.x]="node.x"
            [attr.y]="node.y + 4"
            text-anchor="middle"
            fill="#EDF2F7"
            font-size="11"
            font-family="DM Mono, monospace"
          >
            {{ node.id.toString().padStart(2, '0') }}
          </text>
        }
      </svg>
      <div class="flex flex-wrap gap-x-3 gap-y-1 border-t border-line px-5 py-3">
        @for (node of nodes(); track node.id) {
          <a
            [routerLink]="['/suspeitos', node.id]"
            class="inline-flex min-h-11 items-center font-mono text-xs text-cyan hover:underline"
            [attr.aria-label]="'Abrir dossiê de ' + node.name"
            >#{{ node.id.toString().padStart(3, '0') }}</a
          >
        } @empty {
          <p class="py-3 text-xs text-muted">Nenhum registro para visualizar.</p>
        }
      </div>
    </div>
  `,
})
export class ConnectionMap {
  people = input.required<Suspect[]>();
  links = input.required<Connection[]>();
  highlighted = input<number | null>(null);
  nodes = computed(() =>
    this.people().map((person, index, people) => {
      const angle = (index / people.length) * Math.PI * 2 - Math.PI / 2;
      return { ...person, x: 240 + Math.cos(angle) * 155, y: 150 + Math.sin(angle) * 103 };
    }),
  );
  visibleLinks = computed(() =>
    this.links().flatMap((link) => {
      const a = this.nodes().find((node) => node.id === link.from);
      const b = this.nodes().find((node) => node.id === link.to);
      return a && b ? [{ key: `${a.id}-${b.id}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y }] : [];
    }),
  );
}
