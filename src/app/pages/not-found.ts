import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `<div class="page">
    <section class="panel network-surface mx-auto my-8 max-w-3xl px-6 py-16 text-center">
      <p class="font-mono text-6xl text-amber">404</p>
      <p class="eyebrow mt-8">FIM DESTA PISTA</p>
      <h1 class="page-title">Link perdido.</h1>
      <p class="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
        Esta página não está no arquivo. Volte à central para seguir por outro caminho.
      </p>
      <a class="btn btn-primary mt-8" routerLink="/">Voltar à central ↗</a>
    </section>
  </div>`,
})
export class NotFound {}
