// Gera a apresentação com objetos de texto editáveis e exporta uma cópia em PDF.
// Uso: node docs/gerar-apresentacao.mjs <runtime-node_modules> <skill-presentations> <python>
// Requer @oai/artifact-tool do runtime de documentos, Poppler e os PDFs do projeto.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const [modules, skill, python] = process.argv.slice(2);
if (!modules || !skill || !python)
  throw new Error('Informe runtime-node_modules, skill-presentations e python.');
process.env.RUNTIME_NODE_MODULES = modules;
const docs = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(docs);
const tmp = path.join(root, 'tmp/apresentacao');
await fs.mkdir(tmp, { recursive: true });
const artifactPath = path.join(modules, '@oai/artifact-tool/dist/artifact_tool.mjs');
const { Presentation, PresentationFile } = await import(pathToFileURL(artifactPath));
const require = createRequire(artifactPath);
const { FontLibrary } = require('skia-canvas');
FontLibrary.use('Space Grotesk', [
  path.join(root, 'public/fonts/space-grotesk-regular.ttf'),
  path.join(root, 'public/fonts/space-grotesk-bold.ttf'),
]);
FontLibrary.use('DM Mono', path.join(root, 'public/fonts/dm-mono-regular.ttf'));

for (const [input, page, output] of [
  ['moodboard-interlink-blade-runner-2049.pdf', '2', 'painel'],
  ['identidade-visual-interlink.pdf', '1', 'identidade'],
]) {
  execFileSync('pdftoppm', [
    '-f',
    page,
    '-singlefile',
    '-scale-to',
    '2200',
    '-png',
    path.join(docs, input),
    path.join(tmp, output),
  ]);
}
const pres = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = {
  bg: '#080B12',
  text: '#EDF2F7',
  secondary: '#8993A5',
  orange: '#F26A3D',
  cyan: '#42D9FF',
  green: '#A7F36B',
};
function text(
  slide,
  value,
  x,
  y,
  width,
  height,
  size = 26,
  color = C.text,
  bold = false,
  mono = false,
) {
  const box = slide.shapes.add({
    geometry: 'textbox',
    position: { left: x, top: y, width, height },
    fill: 'none',
    line: { fill: 'none', width: 0 },
  });
  box.text = value;
  box.text.style = {
    typeface: mono ? 'DM Mono' : 'Space Grotesk',
    fontSize: size,
    color,
    bold,
    insets: 0,
    verticalAlignment: 'top',
    autoFit: 'none',
    wrap: 'square',
  };
  return box;
}
function slide(title, number, notes) {
  const s = pres.slides.add();
  s.background.fill = C.bg;
  if (title) text(s, title, 56, 42, 1168, 74, 46, C.text, true);
  text(
    s,
    `INTERLINK / ${String(number).padStart(2, '0')}`,
    56,
    678,
    500,
    22,
    14,
    C.secondary,
    false,
    true,
  );
  s.speakerNotes.text = notes;
  return s;
}
async function image(s, file, x, y, w, h, alt) {
  const bytes = await fs.readFile(file);
  s.images.add({
    blob: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
    alt,
    fit: 'contain',
    position: { left: x, top: y, width: w, height: h },
  });
}

let s = slide(
  '',
  1,
  `0:00 a 0:35. Escolhi Blade Runner 2049, dirigido por Denis Villeneuve. Minha palavra é identidade. A investigação junta registros e relações para entender uma pessoa. O INTERLINK traduz essa ideia em busca e dossiês conectados. A capa aparece aqui como referência e não entra no site. Fonte do pôster: https://www.warnerbros.it/recap/blade-runner-2049/ e https://warnerbros.cloudstatix.com/wp-content/uploads/2016/12/BR2_onesheet_DIGITAL.jpg. Crédito: material promocional Warner Bros. Italia, © 2017 Alcon Entertainment, LLC.`,
);
text(s, 'INTERLINK', 56, 90, 750, 110, 82, C.text, true);
text(s, 'IDENTIDADE', 60, 240, 730, 72, 48, C.orange, true);
text(
  s,
  'Uma central para investigar pessoas por seus registros e conexões.',
  60,
  345,
  670,
  138,
  34,
);
text(
  s,
  'Referência: Blade Runner 2049\nDireção: Denis Villeneuve',
  60,
  548,
  710,
  74,
  22,
  C.secondary,
);
await image(
  s,
  path.join(docs, 'moodboard-assets/poster-oficial.jpg'),
  850,
  44,
  355,
  604,
  'Pôster oficial de Blade Runner 2049',
);

const sourceDoc = await fs.readFile(path.join(docs, 'fontes-moodboard.md'), 'utf8');
const sources = [...new Set(sourceDoc.match(/https:\/\/\S+/g))].join('\n');
s = slide(
  'Moodboard',
  2,
  `0:35 a 1:10. Mostre o painel com as 16 referências. A impressão digital inspira registros individuais. O contraste quente e frio orienta os destaques. As interfaces de investigação ajudam a organizar perfis e vínculos. A imagem preserva o painel completo; o PDF do moodboard permite ampliar cada grupo. Estudos vetoriais com apoio de IA identificados no painel. Fontes:\n${sources}`,
);
await image(
  s,
  path.join(tmp, 'painel.png'),
  36,
  126,
  826,
  522,
  'Painel completo com 16 referências em quatro grupos',
);
text(s, 'Cada registro tem\numa identidade.', 900, 160, 322, 90, 29, C.orange, true);
text(s, 'A luz orienta\no olhar.', 900, 315, 322, 88, 29, C.cyan, true);
text(s, 'As relações ajudam\na investigação.', 900, 469, 322, 96, 29, C.text, true);

s = slide(
  'Identidade visual',
  3,
  '1:10 a 1:40. O fundo quase preto mantém os dados em destaque. Laranja aponta a ação principal; ciano identifica links e conexões. Verde e rosa indicam sucesso e erro com texto. Space Grotesk organiza os títulos e o corpo; DM Mono marca códigos. Os painéis têm borda fina e raio de 6 px. A primeira página do PDF reúne as decisões e os dois desenhos de tela. Fonte: docs/identidade-visual-interlink.pdf; fonts.google.com/specimen/Space+Grotesk e fonts.google.com/specimen/DM+Mono.',
);
await image(
  s,
  path.join(tmp, 'identidade.png'),
  36,
  126,
  826,
  522,
  'Página da identidade visual com paleta, fontes, formas e desenhos',
);
text(s, 'Laranja', 900, 160, 310, 54, 32, C.orange, true);
text(s, 'A ação principal', 900, 215, 310, 68, 25);
text(s, 'Ciano', 900, 323, 310, 54, 32, C.cyan, true);
text(s, 'Links e conexões', 900, 378, 310, 68, 25);
text(s, 'Painéis simples\ne dados legíveis', 900, 513, 310, 102, 27, C.secondary);

s = slide(
  'Investigação por conexões',
  4,
  '1:40 a 3:00. Troque para o site. Abra Suspeitos, pesquise um nome e marque Acompanhar. Ative o filtro Acompanhados. Abra /suspeitos/3 e entre em um perfil relacionado. Explique o caso em comum. Se houver tempo, registre um caso com duas pessoas e veja a nova conexão. Os perfis são fictícios da API JSONPlaceholder; os casos e os riscos são de demonstração. O armazenamento é local. Se o site estiver indisponível, use esta captura e descreva o percurso sem dizer que foi uma demonstração ao vivo. Fonte: captura do INTERLINK em docs/telas/dossie-desktop.png.',
);
await image(
  s,
  path.join(docs, 'telas/dossie-desktop.png'),
  56,
  133,
  538,
  520,
  'Dossiê com perfis vinculados ao mesmo caso',
);
text(s, 'Um caso em comum\nexplica a ligação.', 660, 161, 560, 112, 36, C.cyan, true);
text(s, 'A busca leva ao dossiê.\nO dossiê leva a outras pessoas.', 660, 330, 540, 120, 28);
text(
  s,
  'Perfis e casos fictícios.\nCasos salvos neste navegador.',
  660,
  554,
  545,
  72,
  22,
  C.secondary,
);

s = slide(
  'Estado e valores calculados',
  5,
  '3:00 a 4:00. Abra também src/app/pages/suspects.ts. Um signal guarda um valor que muda, como a busca. Para ler, uso search(); para trocar, search.set(...). filtered combina a busca com os filtros. count é computed porque resulta da lista filtrada. Não incremento nem decremento count: o Angular acompanha as dependências lidas. Se a busca deixa apenas dois registros, a contagem vale dois. Os blocos exibem trechos do arquivo, com quebras de linha ajustadas.',
);
text(s, 'signal', 56, 157, 560, 64, 40, C.orange, true, true);
text(s, "readonly search = signal('');", 56, 256, 1140, 52, 29, C.text, false, true);
text(s, 'Guarda o texto que a pessoa digita.', 56, 324, 1140, 52, 29, C.secondary);
text(s, 'computed', 56, 438, 560, 64, 40, C.cyan, true, true);
text(
  s,
  'readonly count = computed(() => this.filtered().length);',
  56,
  534,
  1168,
  54,
  28,
  C.text,
  false,
  true,
);
text(s, 'Calcula quantos registros passaram pelos filtros.', 56, 601, 1168, 54, 27, C.secondary);

s = slide(
  'O clique muda o acompanhamento',
  6,
  '4:00 a 5:00. Abra src/app/components/suspect-card.ts e src/app/services/case-store.ts. O botão chama watchToggled.emit(s().id). O template pai recebe o evento e chama toggleWatch. A função abaixo recebe a lista atual. Se o id já existe, filter devolve uma lista sem ele; se não existe, o spread cria uma lista com o novo id. update guarda a nova referência e os computed que dependem dela ficam prontos para recalcular. O effect salva no localStorage. O código vem do projeto, com quebras de linha para leitura. Feche dizendo que as ações colocam a investigação em prática. Se perguntarem sobre IA, explique o apoio registrado no CONCEITO.md.',
);
text(
  s,
  '1. O card emite o identificador.\n2. O pai chama o serviço.',
  56,
  149,
  1150,
  105,
  30,
  C.secondary,
);
text(
  s,
  'toggleWatch(id: number): void {\n  this.watchedIds.update((ids) =>\n    ids.includes(id)\n      ? ids.filter((x) => x !== id)\n      : [...ids, id],\n  );\n}',
  56,
  288,
  1168,
  266,
  30,
  C.text,
  false,
  true,
);
text(s, 'Uma nova lista atualiza os cards e os filtros.', 56, 598, 1168, 58, 31, C.cyan, true);

for (const [i, item] of pres.slides.items.entries()) {
  const png = await pres.export({ slide: item, format: 'png', scale: 1.5 });
  await fs.writeFile(path.join(tmp, `slide-${i + 1}.png`), new Uint8Array(await png.arrayBuffer()));
}
const candidate = path.join(tmp, 'candidate.pptx');
await (await PresentationFile.exportPptx(pres)).save(candidate);
const { finalizePresentation } = await import(
  pathToFileURL(path.join(skill, 'container_tools/artifact_tool_utils.mjs'))
);
const finalDir = path.join(tmp, `final-${Date.now()}`);
await fs.mkdir(finalDir, { recursive: true });
const finalPath = path.join(finalDir, 'apresentacao-interlink.pptx');
const result = await finalizePresentation({
  workspaceDir: root,
  candidatePath: candidate,
  finalPath,
  pythonExecutable: python,
  integrityValidatorPath: path.join(
    skill,
    'container_tools/inspect_presentation_package_integrity.py',
  ),
  layoutValidatorPath: path.join(skill, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: [
    '--expected-slide-size-emu',
    '12192000,6858000',
    '--validate-bullet-geometry',
    '--validate-heading-fit',
  ],
  fontPolicy: { basis: 'design', families: ['Space Grotesk', 'DM Mono'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(tmp, `validation-${path.basename(finalDir)}.json`),
});
await fs.copyFile(finalPath, path.join(docs, 'apresentacao-interlink.pptx'));
// O PDF usa as prévias renderizadas para preservar a composição e as fontes.
// O PPTX mantém textos editáveis e notas de fala; o PDF é a cópia para exibição.
execFileSync(python, [
  '-c',
  `
from pathlib import Path
import sys
from reportlab.pdfgen import canvas
folder=Path(sys.argv[1])
c=canvas.Canvas(sys.argv[2],pagesize=(960,540),pageCompression=1)
c.setTitle('INTERLINK - Apresentação de 5 minutos')
c.setAuthor('INTERLINK')
for n in range(1,7):
    c.drawImage(str(folder/f'slide-{n}.png'),0,0,width=960,height=540)
    c.showPage()
c.save()
`,
  tmp,
  path.join(docs, 'apresentacao-interlink.pdf'),
]);
console.log(
  JSON.stringify({
    slides: pres.slides.items.length,
    pptx: path.join(docs, 'apresentacao-interlink.pptx'),
    pdf: path.join(docs, 'apresentacao-interlink.pdf'),
  }),
);
