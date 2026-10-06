# Entendendo o código do INTERLINK

O melhor ponto de partida é uma ação pequena: digitar na busca ou acompanhar uma pessoa. Siga o valor no código e observe o resultado na tela. Os exemplos abaixo usam os arquivos reais do projeto; trechos reduzidos estão identificados.

## 1. Signal guarda um valor que pode mudar

Abra [suspects.ts](../src/app/pages/suspects.ts). Você encontrará:

```ts
readonly search = signal('');
readonly onlyWatched = signal(false);
```

`search` começa com uma string vazia. `onlyWatched` começa falso, então a lista não fica limitada às pessoas acompanhadas.

| Expressão | O que significa neste projeto |
| --- | --- |
| `this.search()` | Ler o texto atual da busca |
| `this.search.set('Clementine')` | Trocar o texto inteiro por “Clementine” |
| `this.onlyWatched.set(true)` | Ativar o filtro de acompanhados |
| `this.watchedIds.update(...)` | Calcular uma nova lista a partir da lista atual |

Os parênteses em `search()` chamam a função de leitura do signal. Essa leitura permite ao Angular acompanhar as dependências. `readonly` aqui impede reatribuir a propriedade `search` a outro objeto; ainda é possível alterar o valor por `search.set(...)`. Base: [documentação de signals](https://angular.dev/guide/signals).

No [template da busca](../src/app/pages/suspects.html), o campo liga a interface ao estado:

```html
[value]="search()"
(input)="search.set($any($event.target).value)"
```

Essas são duas propriedades do mesmo campo, destacadas do restante do HTML. `[value]` mostra o valor do signal. `(input)` escuta a digitação. `$event.target` é o campo que gerou o evento, e `.value` contém o texto. `$any` flexibiliza a checagem de tipo nessa expressão do template.

**Experimente:** digite “Clementine”. O texto passa para `search`; a lista filtrada passa a considerar esse nome.

## 2. Computed calcula um resultado a partir de outros valores

No mesmo arquivo, veja:

```ts
readonly count = computed(() => this.filtered().length);
```

Leia em voz alta: “A quantidade é o comprimento da lista filtrada”. `() => ...` é a função que calcula esse resultado. `this.filtered()` lê a lista; `.length` conta seus elementos.

Você não encontra `count.set(...)` no projeto porque a contagem já tem uma origem: `filtered`. Se a lista contém duas pessoas, a contagem deve ser dois. Manter outra contagem manual abriria espaço para mostrar um número diferente da lista.

O Angular guarda o resultado de um `computed` e invalida esse resultado quando uma dependência relevante muda. O cálculo acontece quando o valor é necessário. Por isso, “recalcula automaticamente” não significa “executa sem parar”. Base: [signals calculados](https://angular.dev/guide/signals#computed-signals).

### Como os filtros se combinam

Leia o `filtered` completo em `suspects.ts`. Ele percorre as pessoas e combina três condições com `&&`:

1. O nome, usuário, empresa ou cidade precisa conter o termo pesquisado.
2. Se um risco foi selecionado, a pessoa precisa ter esse risco.
3. Se “Acompanhados” está ativo, o identificador precisa estar em `watchedIds`.

`&&` exige que as condições sejam verdadeiras. Em `!this.risk() || person.risk === this.risk()`, o `||` permite passar quando não há risco selecionado ou quando o risco corresponde. A função `normalize` do projeto remove marcas de acento e transforma o texto em minúsculas; `trim()` retira os espaços das pontas da busca.

O `high` faz outro trabalho: conta quantas pessoas da seleção têm risco alto. Assim, `filtered`, `count` e `high` cumprem funções diferentes e usam os mesmos dados como base.

## 3. O caminho completo do botão Acompanhar

Comece em [suspect-card.ts](../src/app/components/suspect-card.ts):

```ts
s = input.required<Suspect>();
watched = input(false);
watchToggled = output<number>();
```

O card recebe a pessoa em `s` e o estado de acompanhamento em `watched`. O evento `watchToggled` transporta um número: o identificador da pessoa. Ele é um evento de saída, não um signal que você lê com parênteses.

Ao clicar, o botão executa:

```html
(click)="watchToggled.emit(s().id)"
```

O card avisa “clicaram na pessoa com este id”. No [template pai](../src/app/pages/suspects.html), esse aviso chega aqui:

```html
(watchToggled)="store.toggleWatch($event)"
```

`$event` agora é o número emitido pelo card. O pai chama o serviço compartilhado. Base: [eventos com output](https://angular.dev/guide/components/outputs).

Em [case-store.ts](../src/app/services/case-store.ts), o método é:

```ts
toggleWatch(id: number): void {
  this.watchedIds.update((ids) =>
    ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
  );
}
```

| Parte do trecho | Leitura em português |
| --- | --- |
| `id: number` | O método recebe um número |
| `: void` | Ele não devolve um resultado para quem chamou |
| `update((ids) => ...)` | Receba a lista atual e devolva a próxima lista |
| `ids.includes(id)` | Esse identificador já está na lista? |
| `? ids.filter((x) => x !== id)` | Se sim, crie uma lista sem ele |
| `: [...ids, id]` | Se não, crie uma lista com os anteriores e o novo id |

Exemplo: com `[1, 3]`, clicar na pessoa `3` produz `[1]`. Clicar depois na pessoa `8` produz `[1, 8]`.

O serviço muda o estado; o template volta a ler esse estado para mostrar “Acompanhando”. Se o filtro de acompanhados estiver ativo, a lista e sua contagem também mudam.

### Por que não usar push?

`push()` altera o array existente. No código do INTERLINK, `filter` e spread criam uma nova referência. Isso importa porque a comparação padrão de signals usa `Object.is`. Devolver o mesmo array depois de alterá-lo por dentro pode impedir a notificação esperada. Base: [igualdade de signals](https://angular.dev/guide/signals#signal-equality-functions).

## 4. Effect salva; computed calcula

No construtor de `CaseStore`, o `effect` lê `cases()` e `watchedIds()` e salva seus valores no `localStorage`. É uma comunicação com um recurso do navegador.

As contagens continuam em `computed`, como `active` e `evidence`. O projeto não usa o `effect` para atualizar essas contagens manualmente. Na apresentação, mostre a diferença pelo efeito visível: acompanhar muda a tela agora; recarregar demonstra que o acompanhamento foi salvo neste navegador.

O armazenamento não é um servidor nem uma conta de usuário. Outro navegador pode ter outros dados. Se a gravação falhar, o projeto informa que as alterações permanecem somente na sessão.

## 5. Como duas pessoas ficam conectadas

Em `CaseStore`, `links` é um `computed` que lê os casos. Para um caso com os identificadores `[1, 3, 6]`, os pares são `1–3`, `1–6` e `3–6`.

`Set` remove identificadores repetidos. A ordenação mantém uma ordem estável para os pares. Os dois laços percorrem combinações sem ligar uma pessoa a ela mesma. `Map` reúne pares iguais: se duas pessoas compartilham mais de um caso, a conexão pode guardar os nomes desses casos sem repetir a aresta.

Isso explica por que existe uma ligação no mapa. A relação vem de um caso compartilhado. Casos arquivados continuam fazendo parte desse histórico.

## 6. De onde vêm os perfis

[ApiService](../src/app/services/api.service.ts) usa `inject(HttpClient)` para consultar o JSONPlaceholder. O [DirectoryService](../src/app/services/directory.service.ts) chama essa consulta e guarda os perfis em `people`.

O signal `state` começa em `idle`, passa para `loading` e termina em `ready` ou `error`. `loading` é um `computed` que verifica esse estado. O template usa `@if` para mostrar a mensagem correspondente e o botão de nova tentativa.

Os perfis são fictícios. A classificação de risco é uma regra de demonstração do projeto, calculada no mapeamento dos perfis. A API não faz uma investigação real de pessoas.

## 7. Formulário e toSignal

Em [new-case.ts](../src/app/pages/new-case.ts), os campos pertencem ao formulário reativo. Ele emite eventos quando valores, validade ou estado de interação mudam. `toSignal(this.form.events)` transforma esses eventos em uma dependência que os cálculos da tela conseguem ler. Base: [integração entre RxJS e signals](https://angular.dev/ecosystem/rxjs-interop).

```ts
private readonly formEvents = toSignal(this.form.events);
readonly canSubmit = computed(() => {
  this.formEvents();
  return this.form.valid && !this.savedCase();
});
```

A linha `this.formEvents()` não precisa guardar o valor em uma variável: a leitura registra a dependência. O botão pode enviar quando o formulário está válido e ainda não existe um caso salvo nesta tela. Ler apenas `form.valid` dentro do `computed`, sem essa ponte, não faria a propriedade comum virar um signal.

`minTrimmed(4)` exige pelo menos quatro caracteres úteis no título; espaços nas pontas não contam. A descrição pede pelo menos quinze caracteres. O envio também verifica a validade no método `submit()`.

## 8. Rotas e atualização do dossiê

Em [detail.ts](../src/app/pages/detail.ts), `toSignal(this.route.paramMap)` acompanha o parâmetro da URL. `id` converte esse parâmetro para número e `person` procura a pessoa correspondente.

Ao passar de `/suspeitos/3` para outro dossiê, a leitura dos parâmetros muda e os dados derivados acompanham a navegação. Uma leitura única do parâmetro poderia deixar o perfil anterior na tela se o Angular reutilizasse o componente.

No HTML, `@for (person of filtered(); track person.id)` usa um identificador estável para cada item. `@empty` oferece uma explicação quando não há resultados. Esses estados ajudam a pessoa a entender o que aconteceu com sua pesquisa.

## 9. Ensaio de 15 minutos

| Tempo | Ação |
| --- | --- |
| 0–4 min | Leia as seções 1 e 2. Aponte no código onde a busca muda e onde a contagem é calculada. |
| 4–8 min | Faça o caminho do acompanhamento: botão, evento, pai e serviço. Simule os arrays `[1, 3]` no papel. |
| 8–11 min | Crie um caso com dois suspeitos e explique a conexão. Recarregue e confira o armazenamento. |
| 11–15 min | Feche este guia e responda às perguntas abaixo sem ler. Depois confira o gabarito. |

1. Se a busca mostra duas pessoas, qual trecho determina o número de resultados?
2. O que acontece com `[1, 3]` ao chamar `toggleWatch(3)`?
3. Qual valor o card envia para o componente pai?
4. O `readonly` impede usar `search.set()`?
5. Por que `canSubmit` lê `formEvents()`?
6. Onde os casos ficam salvos?
7. Um mesmo par de pessoas deve aparecer duas vezes no mapa por compartilhar dois casos?

<details>
<summary>Conferir respostas</summary>

1. `count`, que lê `this.filtered().length`.
2. A lista vira `[1]`, porque `filter` remove o identificador 3.
3. O `id` numérico da pessoa, emitido por `watchToggled`.
4. Não. Ele impede reatribuir a propriedade; o valor do signal continua gravável por seus métodos.
5. Para acompanhar os eventos do formulário como dependência reativa.
6. No `localStorage` do navegador, quando disponível.
7. Não. O `Map` reúne o par e preserva os nomes dos casos ligados a ele.

</details>

Uma explicação boa liga o código ao que você acabou de mostrar na tela. Se travar, comece por “quando clico aqui, este valor muda” e siga o caminho com calma.
