# Apresentação do INTERLINK — 5 minutos

Este é um guia para ensaiar. Use suas palavras e só apresente uma explicação que você compreende. Deixe os PDFs abertos, o site rodando e o arquivo de código separado antes de começar.

## 0:00–0:40 — Capa e conceito

Mostre a capa no moodboard ou na página oficial da Warner. Ela não aparece no site.

“Escolhi Blade Runner 2049, dirigido por Denis Villeneuve. Minha palavra é IDENTIDADE. O contraste entre luz e sombra e a mistura de humano e tecnologia me levaram à ideia de descobrir quem está por trás de um registro. Por isso o INTERLINK funciona como uma central de investigação.”

## 0:40–1:20 — Moodboard

Abra a página 2, que reúne as 16 referências. Comente dois ou três achados:

- A impressão digital representa identidade: cada registro precisa ser reconhecível e ter seu próprio dossiê.
- O contraste de laranja e ciano ajuda a separar a ação principal dos caminhos de consulta.
- As referências de Maltego e OpenCTI mostram como relações e perfis podem ser organizados para uma investigação.

Se perguntarem pelas imagens, mostre os créditos do grupo ou `fontes-moodboard.md`. Os estudos vetoriais produzidos com apoio de IA estão identificados.

## 1:20–2:00 — Identidade visual

Mostre a primeira página da identidade. Explique os papéis, sem ler todos os códigos:

“O fundo é quase preto para deixar os dados em primeiro plano. Laranja destaca o botão principal; ciano identifica links e conexões. O verde indica sucesso e o rosa indica erro, sempre acompanhados de texto. Os títulos usam Space Grotesk e os códigos usam DM Mono. Os painéis têm bordas finas e pouco arredondamento.”

Leia a frase de direção: **Informação em primeiro plano; a luz revela as conexões.** Mostre as duas telas desenhadas.

## 2:00–3:40 — Aplicação

1. Na Central, mostre os casos e o mapa.
2. Abra Suspeitos, pesquise um nome, limpe a busca e use um filtro de risco.
3. Clique em “Acompanhar” e depois no filtro “Acompanhados”. Explique que a ação muda o estado do site.
4. Abra um dossiê com vínculos, por exemplo `/suspeitos/3`. Entre em um registro relacionado: o caso em comum explica a ligação.
5. Em Novo caso, mostre o botão inicialmente desabilitado. Preencha “Operação Horizonte”, “Setor Sul” e “Investigar a conexão entre os registros selecionados.” Selecione dois suspeitos e envie.
6. Volte à Central e mostre o caso novo. Arquive-o e observe a contagem mudar.

Se o tempo apertar, deixe o cadastro para uma pergunta do professor e priorize o caminho busca → dossiê → relação. Avise que os dados são fictícios, a API fornece os perfis e os casos ficam no navegador.

## 3:40–5:00 — Um trecho de código

Abra `src/app/pages/suspects.ts` e explique `filtered`, `count` e `high`.

“A busca e o risco são signals porque representam escolhas que o usuário muda. `filtered` é computed porque depende dessas escolhas e da lista de pessoas. Ele combina os filtros. A quantidade de resultados também é computed: se a lista muda, a contagem muda junto. Assim eu não preciso atualizar dois lugares manualmente.”

Depois mostre `watchToggled = output<number>()` em `suspect-card.ts` e o tratamento do evento em `suspects.html`. O card informa o identificador; o pai pede ao serviço que altere os acompanhados. É um evento entre componentes com resultado visível.

## Perguntas para praticar

| Pergunta | Ideia que você precisa conseguir explicar |
| --- | --- |
| Por que essa capa virou esse site? | Identidade é investigada juntando informações e relações; isso aparece na navegação entre dossiês. |
| Por que `computed` em vez de `signal` para contar? | A contagem depende de outros dados. Guardar outra cópia exigiria manter as duas sincronizadas. |
| Por que não usar `push()`? | O projeto cria uma nova lista com spread, `map` ou `filter` dentro de `update`, permitindo que o signal notifique a mudança. |
| O que o `track person.id` faz? | Dá ao Angular uma identidade estável para associar cada item da lista ao elemento da tela. |
| De onde vem uma conexão? | Duas pessoas pertencem ao mesmo caso. O serviço gera os pares e evita desenhar o mesmo par repetidamente. |
| A classificação veio da API? | Não. São riscos fictícios de demonstração definidos no mapeamento; os perfis vêm do JSONPlaceholder. |
| Por que converter eventos do formulário em signal? | O formulário reativo tem seus próprios eventos. `toSignal` permite que os `computed` usados na tela acompanhem mudanças de valor e validade. |
| O que acontece quando a internet falha? | A tela mostra erro e oferece nova tentativa. O formulário ainda permite cadastrar um caso sem suspeitos. |
| O que acontece ao recarregar? | Casos e acompanhamentos são lidos do armazenamento local. Os filtros da pesquisa voltam ao estado inicial. |
| Qual foi o papel da IA? | Pesquisa, documentos, propostas visuais, implementação e testes tiveram apoio. As escolhas fornecidas pelo aluno estão separadas em `CONCEITO.md`. |

Ensaie com cronômetro. Se uma linha do código ainda parecer confusa, estude esse trecho antes da apresentação: o enunciado pede que você consiga defendê-lo.
