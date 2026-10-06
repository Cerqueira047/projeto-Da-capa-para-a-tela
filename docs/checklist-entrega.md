# Conferência da entrega — INTERLINK

Conferência baseada no enunciado **Da capa para a tela**, em 6 de outubro de 2026. Os itens abaixo indicam onde cada exigência pode ser encontrada. A avaliação e a defesa oral continuam sendo responsabilidade do aluno.

## Pesquisa e criação

| Exigência | Evidência |
| --- | --- |
| Capa, diretor e link da imagem | [CONCEITO.md](../CONCEITO.md), seção 1 |
| Palavra-conceito e origem | IDENTIDADE, explicada na seção 2 |
| Ligação entre conceito e função | Investigação por registros e casos compartilhados, seção 3 |
| O que foi pedido à IA e decidido pelo aluno | Registro transparente na seção 5 |
| Confirmação na lista da turma | Confirmada pelo aluno na conversa |
| Moodboard com 12 a 20 referências | 16 referências; painel completo na página 2 do [PDF](moodboard-interlink-blade-runner-2049.pdf) |
| Quatro grupos e justificativas | Conceito, Cor e luz, Textura e forma, Interface; 4 referências por grupo |
| Referências reais de interface | Capturas de eDEX-UI, Maltego, Grafana e OpenCTI, com fontes |
| Identificar referências geradas | Estudos vetoriais 05, 10 e 12 identificados; créditos em [fontes](fontes-moodboard.md) |
| Nome, paleta, fontes, formas e frase | Página 1 da [identidade visual](identidade-visual-interlink.pdf) |
| Duas telas desenhadas | Central e Dossiê na página 1, ampliadas na página 2 |
| Identidade aplicada no app | Cores e fontes locais em `src/styles.css`, componentes e telas responsivos |

## Aplicação

| Exigência | Onde conferir e como demonstrar |
| --- | --- |
| 3 rotas e menu ativo | `app.routes.ts` e `app.html`: Central, Suspeitos e Novo caso |
| Rota com parâmetro | `/suspeitos/:id`; abrir um dossiê e depois um registro relacionado |
| Página `**` | Digitar uma rota inexistente: página “Link perdido.” |
| 2 componentes com `input()` | `StatCard`, `SuspectCard` e `ConnectionMap` |
| `output()` com efeito visível | `SuspectCard.watchToggled`: acompanhar e filtrar acompanhados |
| `@if`, `@for` com `track`, `@empty` | Busca, casos, dossiês e seletores no formulário |
| Estado reativo em signals | Busca, risco, acompanhamento, casos, dados da API e estados das telas |
| Pelo menos 3 `computed` úteis | `filtered`, `count`, `high`, `active`, `evidence`, `links`, entre outros |
| Sem cópia manual de derivados | Contagens, seleção e relações são calculadas; listas mudam por `update`, `map`, `filter` e spread |
| Serviço com `inject()` e API pública | `ApiService`, `DirectoryService` e JSONPlaceholder `/users` |
| Carregamento e erro | Mensagens de consulta, falha e botão “Tentar novamente” |
| Formulário válido antes de enviar | Título, localização e descrição validados; botão desabilitado enquanto inválido |
| Tailwind como base | Utilitários nos templates, tokens em `@theme`, componentes com `@apply` |
| Celular sem quebrar | Grade vira pilha; teste em 375 px e capturas em `docs/telas` |
| Sem capa dentro da aplicação | Imagens da pesquisa somente em `docs`, fora de `src` e `public` |
| Sem `*ngIf` ou `*ngFor` | Templates usam o fluxo de controle atual do Angular |

## Arquivos e entrega

- Repositório indicado: [Cerqueira047/projeto-Da-capa-para-a-tela](https://github.com/Cerqueira047/projeto-Da-capa-para-a-tela).
- [README](../README.md) com instalação, execução, dados, testes e links dos documentos.
- PDFs e seus scripts em `docs`, com referências locais para geração novamente.
- Aplicação pode ser iniciada com `npm ci` e `npm start`.
- [Roteiro de 5 minutos](roteiro-apresentacao.md) com uma sequência prática e perguntas para ensaiar.
- [Apresentação em PDF](apresentacao-interlink.pdf) e [PowerPoint](apresentacao-interlink.pptx) com seis telas e notas de fala.
- [Guia do código](guia-codigo-interlink.md) com exemplos de signals, computed, input/output, formulário e armazenamento, além de exercícios com gabarito.

## Limites da demonstração

Validação realizada em 6 de outubro de 2026: versão de produção gerada com sucesso; 18 testes passaram no Chrome, divididos entre computador (1440 px) e celular (375 px). A API real foi consultada e as capturas das telas foram inspecionadas. Os dois PDFs foram abertos e suas páginas renderizadas para conferir a organização visual.

Os registros e classificações são fictícios. Os casos ficam no navegador, sem servidor de gravação; as evidências iniciais são números de exemplo e não têm cadastro próprio. A API exige internet. Essas escolhas mantêm o escopo de uma SPA acadêmica e são informadas no projeto.

Antes de entregar, o aluno deve revisar o registro de uso de IA e praticar a explicação do código. Esse preparo oral não é substituído pelos testes automáticos.
