#!/usr/bin/env python3
"""Gera o moodboard independente do INTERLINK.

Uso: python docs/gerar-moodboard.py
Dependências: pip install reportlab pillow
As imagens ficam em docs/moodboard-assets; as fontes são do Windows ou DejaVu.
O script usa apenas arquivos locais e não altera a aplicação Angular.
"""
from pathlib import Path
from html import escape
import argparse

from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

HERE = Path(__file__).resolve().parent
ASSETS = HERE / 'moodboard-assets'
OUTPUT = HERE / 'moodboard-interlink-blade-runner-2049.pdf'
W, H = 1190, 842
M, GAP = 44, 20
BG, PANEL, WHITE, MUTED = '#080B12', '#0E131C', '#EDF2F7', '#8993A5'
ORANGE, CYAN, GREEN, LINE = '#F26A3D', '#42D9FF', '#A7F36B', '#273140'
WARNER = 'https://www.warnerbros.it/recap/blade-runner-2049/'
PACK1 = 'https://distribuzione.bradek.net/bladerunner2049/img/bladerunner2049_packshot1.zip'
PACK2 = 'https://distribuzione.bradek.net/bladerunner2049/img/bladerunner2049_packshot2.zip'

GROUPS = [
    dict(name='CONCEITO', color=ORANGE, subtitle='Quem é a pessoa por trás do registro?',
         why='Escolhi esse grupo porque investigar uma identidade exige juntar marcas, lembranças e pistas. Ele liga o clima do filme à consulta de suspeitos e à leitura de dossiês no INTERLINK.', refs=[
        dict(id=1, title='Uma marca única', keyword='identidade', image='01-identidade.jpg',
             text='A impressão digital lembra que cada pessoa tem características próprias. No INTERLINK, isso inspira fichas com nome, código e informações que ajudam a distinguir cada registro.',
             credit='cottonbro studio / Pexels', url='https://www.pexels.com/photo/close-up-photo-of-putting-of-fingerprint-on-paper-8382599/'),
        dict(id=2, title='Fragmentos do passado', keyword='memória', image='02-memoria.jpg',
             text='As fotografias antigas mostram uma história construída por fragmentos. Essa ideia orienta a organização das informações e dos registros anteriores dentro de cada dossiê.',
             credit='AOSHS / coleção de fotografias', url='https://aoshs.org/collections/'),
        dict(id=3, title='Seguir os vestígios', keyword='investigação', image='pack1-TRI-01774r.jpeg',
             text='O exame de uma pista sugere atenção aos detalhes e descoberta aos poucos. No INTERLINK, a busca leva da lista de suspeitos ao dossiê, onde as informações podem ser comparadas.',
             credit='Blade Runner 2049 / material oficial Warner', url=WARNER, focus=(0.55, 0.06)),
        dict(id=4, title='Presença e simulação', keyword='humano x artificial', image='pack2-TRI-05445r.jpg',
             text='A aproximação entre K e Joi traz a dúvida sobre o que parece humano. No INTERLINK, nomes e histórias convivem com códigos e dados, mostrando uma identidade mediada pela tecnologia.',
             credit='Blade Runner 2049 / material oficial Warner', url=WARNER, focus=(0.53, 0.32)),
    ]),
    dict(name='COR E LUZ', color=CYAN, subtitle='Contraste para criar clima e orientar o olhar.',
         why='Escolhi esse grupo pelo contraste entre calor e frieza presente no pôster. Os tons escuros sustentam a leitura, enquanto os pontos de cor ajudam a localizar ações e informações importantes.', refs=[
        dict(id=5, title='Escuro em camadas', keyword='tons escuros', art='dark',
             text='O preto azulado cria a sensação de uma central em operação. A diferença entre #080B12 e #0E131C separa o fundo dos painéis sem depender de bordas muito fortes.',
             credit='Estudo gráfico para este moodboard / paleta proposta', url=None),
        dict(id=6, title='Calor de alerta', keyword='laranja/âmbar', image='pack1-BR-SINTL-87634.jpeg',
             text='A paisagem alaranjada chama a atenção e passa tensão. No INTERLINK, o #F26A3D pode destacar ações principais e avisos, sempre acompanhado de um texto que explique seu sentido.',
             credit='Blade Runner 2049 / material oficial Warner', url=WARNER, focus=(0.5, 0.47)),
        dict(id=7, title='Sinal frio', keyword='azul/ciano', image='07-ciano.jpg',
             text='As linhas de luz azul lembram conexão e circulação de dados. O #42D9FF orienta links, foco de seleção e relações entre registros no INTERLINK.',
             credit='Elmer Cañas / Unsplash', url='https://unsplash.com/photos/a-dark-hallway-with-blue-lighting-and-a-white-wall-UPdnd-STx5k', focus=(0.5, 0.53)),
        dict(id=8, title='Luz em suspensão', keyword='luz difusa/neon/fumaça', image='pack1-TRI-17250r.jpeg',
             text='A luz espalhada cria profundidade e deixa o ambiente menos definido. No INTERLINK, ela inspira brilhos suaves em detalhes e áreas de destaque, mantendo os textos sempre nítidos.',
             credit='Blade Runner 2049 / material oficial Warner', url=WARNER, focus=(0.5, 0.04)),
    ]),
    dict(name='TEXTURA E FORMA', color=ORANGE, subtitle='Estruturas firmes, superfícies discretas e informação em blocos.',
         why='Escolhi essas referências para combinar a rigidez de um sistema com a atmosfera urbana do filme. A textura cria o clima; as formas simples ajudam a organizar a investigação.', refs=[
        dict(id=9, title='Massa de concreto', keyword='arquitetura brutalista', image='09-brutalismo.jpg',
             text='O concreto aparente e os grandes volumes passam uma sensação de estrutura e peso. No INTERLINK, essa referência vira painéis firmes, áreas bem delimitadas e poucos enfeites.',
             credit='Marc Cordeau / Unsplash', url='https://unsplash.com/photos/geometric-concrete-structure-with-glass-windows-Z3MsCdxNJg4', focus=(0.5, 0.4)),
        dict(id=10, title='Geometria de conexão', keyword='formas geométricas', art='geometry',
             text='Retângulos, círculos e linhas formam uma linguagem fácil de reconhecer. Eles podem organizar os cards e representar ligações entre pessoas, pistas e registros.',
             credit='Estudo gráfico para este moodboard / formas e conexões', url=None),
        dict(id=11, title='Cidade embaçada', keyword='névoa/chuva', image='11-chuva.jpg',
             text='A chuva no vidro fragmenta a cidade e sugere algo que ainda precisa ser descoberto. No INTERLINK, essa textura inspira fundos sutis e efeitos de profundidade, sem passar por cima dos dados.',
             credit='Jahanzeb Ahsan / Unsplash', url='https://unsplash.com/photos/colorful-city-lights-reflected-on-a-rainy-window-8HvGp9KFM44', focus=(0.5, 0.55)),
        dict(id=12, title='Informação em módulos', keyword='painéis e blocos de informação', art='panels',
             text='A repetição de blocos cria ordem mesmo quando há muitos dados. No INTERLINK, ela ajuda a separar identidade, risco e conexões, facilitando a comparação entre dossiês.',
             credit='Estudo gráfico para este moodboard / composição modular', url=None),
    ]),
    dict(name='INTERFACE', color=CYAN, subtitle='Referências reais para transformar a atmosfera em uso.',
         why='Escolhi interfaces que organizam consultas, relações e detalhes em níveis diferentes. Elas ajudam a transformar a inspiração visual em ações claras: pesquisar, comparar, abrir um dossiê e explorar conexões.', refs=[
        dict(id=13, title='Terminal em operação', keyword='terminal futurista', image='13-edex.png', contain=True,
             text='O eDEX-UI combina fundo escuro, linhas finas e texto monoespaçado. No INTERLINK, essa linguagem inspira códigos e indicadores de sistema, com menos elementos para preservar a clareza.',
             credit='eDEX-UI / GitSquared / captura do projeto', url='https://github.com/GitSquared/edex-ui'),
        dict(id=14, title='Mapa de relações', keyword='dashboard investigativo', image='14-maltego.png', contain=True,
             text='O Maltego mostra registros como pontos ligados por relações. Essa organização inspira a visualização das conexões entre suspeitos no INTERLINK, adaptada à paleta escura do projeto.',
             credit='Maltego / guia oficial de investigação em grafos', url='https://www.maltego.com/blog/beginners-guide-to-maltego-charting-my-first-maltego-graph/'),
        dict(id=15, title='Dados de relance', keyword='cards de dados', image='15-grafana.png', contain=True,
             text='Os cards do Grafana colocam números e rótulos em posições constantes. No INTERLINK, essa hierarquia ajuda a consultar casos, evidências e conexões, usando menos cores que a referência.',
             credit='Grafana / documentação do painel Stat', url='https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/stat/'),
        dict(id=16, title='Um registro, várias camadas', keyword='sistema de dossiês/perfis', image='16-opencti.png', contain=True,
             text='O OpenCTI reúne resumo, propriedades e relações em um perfil de entidade. Essa divisão inspira o dossiê individual do INTERLINK, aproximando os dados básicos das conexões do registro.',
             credit='OpenCTI / documentação de entidades', url='https://docs.opencti.io/latest/usage/exploring-entities/'),
    ]),
]


def register_fonts():
    candidates = [
        (Path('C:/Windows/Fonts'), ('segoeui.ttf', 'segoeuib.ttf', 'consola.ttf', 'segoeuil.ttf')),
        (Path('/usr/share/fonts/truetype/dejavu'), ('DejaVuSans.ttf', 'DejaVuSans-Bold.ttf', 'DejaVuSansMono.ttf', 'DejaVuSans.ttf')),
    ]
    for folder, names in candidates:
        if all((folder / f).exists() for f in names):
            for alias, name in zip(('Body', 'Bold', 'Mono', 'Light'), names):
                pdfmetrics.registerFont(TTFont(alias, str(folder / name)))
            return
    raise RuntimeError('Instale as fontes Segoe UI e Consolas, ou DejaVu Sans e DejaVu Sans Mono.')


def rect(c, x, y, w, h, fill, stroke=None, line=0.6):
    c.setFillColor(HexColor(fill))
    c.setStrokeColor(HexColor(stroke or fill))
    c.setLineWidth(line)
    c.rect(x, H-y-h, w, h, fill=1, stroke=bool(stroke))


def rule(c, x1, y1, x2, y2, color=LINE, width=0.6):
    c.setStrokeColor(HexColor(color)); c.setLineWidth(width)
    c.line(x1, H-y1, x2, H-y2)


def text(c, s, x, y, size=12, font='Body', color=WHITE):
    c.setFont(font, size); c.setFillColor(HexColor(color))
    c.drawString(x, H-y-size*.82, s)


def para(c, s, x, y, w, size=13, leading=18, color=WHITE, max_h=None, font='Body'):
    style = ParagraphStyle('p', fontName=font, fontSize=size, leading=leading, textColor=HexColor(color))
    p = Paragraph(escape(s), style)
    _, h = p.wrap(w, H)
    if max_h is not None and h > max_h + .01:
        raise ValueError(f'Texto ultrapassa a caixa ({h}>{max_h}): {s}')
    p.drawOn(c, x, H-y-h)
    return h


def link(c, label, url, x, y, size=8.3, color=MUTED):
    text(c, label, x, y, size, color=color)
    if url:
        c.linkURL(url, (x,H-y-size-2,x+pdfmetrics.stringWidth(label,'Body',size),H-y+2), relative=0)


def photo(c, filename, x, y, w, h, contain=False, focus=(.5,.5)):
    path = ASSETS / filename
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min(w/iw,h/ih) if contain else max(w/iw,h/ih)
    dw, dh = iw*scale, ih*scale
    dx = (w-dw)*focus[0]; dy = (h-dh)*focus[1]
    c.saveState()
    p=c.beginPath();p.rect(x,H-y-h,w,h);c.clipPath(p,stroke=0,fill=0)
    # Passar o caminho preserva a compressão JPEG e reutiliza a mesma imagem no PDF.
    c.drawImage(str(path),x+dx,H-y-dy-dh,dw,dh,mask='auto')
    c.restoreState()


def circle(c, x, y, radius, fill=BG, stroke=CYAN, width=1):
    c.setFillColor(HexColor(fill));c.setStrokeColor(HexColor(stroke));c.setLineWidth(width)
    c.circle(x,H-y,radius,stroke=1,fill=1)


def graphic(c, name, x, y, w, h):
    """Estudos vetoriais identificados como estudos, nunca como prints reais."""
    c.saveState()
    c.translate(x,H-y-h);c.scale(w/540,h/142)
    def box(a,b,ww,hh,col,stroke=None):
        c.setFillColor(HexColor(col));c.setStrokeColor(HexColor(stroke or col));c.setLineWidth(.7)
        c.rect(a,142-b-hh,ww,hh,fill=1,stroke=bool(stroke))
    def tx(s,a,b,sz=10,col=MUTED,fn='Mono'):
        c.setFillColor(HexColor(col));c.setFont(fn,sz);c.drawString(a,142-b-sz*.82,s)
    box(0,0,540,142,BG)
    if name=='dark':
        for i in range(28):
            v=i/27
            col=Color((8+6*v)/255,(11+8*v)/255,(18+10*v)/255)
            c.setFillColor(col);c.rect(i*540/28,0,540/28+.2,142,fill=1,stroke=0)
        box(52,27,214,88,BG,LINE);box(282,27,206,88,PANEL,LINE)
        tx('FUNDO',68,43,10);tx('#080B12',68,77,21,WHITE)
        tx('PAINEL',298,43,10);tx('#0E131C',298,77,21,WHITE)
        box(68,62,38,2,CYAN);box(298,62,38,2,ORANGE)
    elif name=='geometry':
        c.setStrokeColor(HexColor('#192331'));c.setLineWidth(.6)
        for a in range(0,541,27):c.line(a,0,a,142)
        for b in range(0,143,24):c.line(0,b,540,b)
        pts=[(86,74),(231,43),(254,105),(414,64)]
        for i,j in [(0,1),(0,2),(1,2),(1,3),(2,3)]:
            c.setStrokeColor(HexColor(CYAN));c.setLineWidth(1)
            c.line(pts[i][0],142-pts[i][1],pts[j][0],142-pts[j][1])
        for i,(a,b) in enumerate(pts):
            if i%2==0:
                box(a-21,b-15,42,30,PANEL,ORANGE if i==0 else CYAN)
            else:
                c.setFillColor(HexColor(PANEL));c.setStrokeColor(HexColor(CYAN))
                c.circle(a,142-b,17,fill=1,stroke=1)
        tx('01',79,70,9,ORANGE);tx('02',224,39,9,CYAN)
        tx('03',247,101,9,CYAN);tx('04',407,60,9,CYAN)
    elif name=='panels':
        for a,b,ww,hh in [(24,19,98,104),(134,19,184,32),(134,62,184,61),(330,19,185,49),(330,80,185,43)]:
            box(a,b,ww,hh,PANEL,LINE);box(a,b,2,hh,CYAN if a!=330 else ORANGE)
            for line_n in range(max(1,int(hh/19)-1)):
                box(a+13,b+13+line_n*14,ww-34-(line_n%2)*24,2,'#4C586C')
        box(36,36,29,29,'#192332',CYAN)
    c.restoreState()


def visual(c, ref, x, y, w, h):
    rect(c,x,y,w,h,BG)
    if 'art' in ref:graphic(c,ref['art'],x,y,w,h)
    else:photo(c,ref['image'],x,y,w,h,ref.get('contain',False),ref.get('focus',(.5,.5)))


def base(c, n, section, accent=CYAN):
    rect(c,0,0,W,H,BG)
    rect(c,M,30,6,6,GREEN)
    text(c,'INTERLINK / ARQUIVO VISUAL',M+16,28,9,'Mono',MUTED)
    right=f'{section}   /   {n:02d}'
    tw=pdfmetrics.stringWidth(right,'Mono',9)
    text(c,right,W-M-tw,28,9,'Mono',MUTED)
    rule(c,M,49,W-M,49)
    rule(c,M,809,W-M,809)
    text(c,'IDENTIDADE  /  MEMÓRIA  /  TECNOLOGIA  /  INVESTIGAÇÃO',M,819,8,'Mono',MUTED)
    text(c,f'MOODBOARD     {n:02d} / 07',W-205,819,8,'Mono',MUTED)
    rect(c,M,809,60,1,accent)


def title(c, label, sub, accent=CYAN):
    text(c,label,M,69,34,'Bold')
    text(c,sub,M,109,12,'Body',MUTED)
    rect(c,W-M-58,75,58,4,accent)


def cover(c):
    base(c,1,'PONTO DE PARTIDA',ORANGE)
    c.bookmarkPage('capa');c.addOutlineEntry('Capa e ponto de partida','capa',0,False)
    text(c,'MOODBOARD — INTERLINK',M,90,32,'Bold')
    text(c,'Inspirado em Blade Runner 2049',M,138,18,'Light',MUTED)
    text(c,'CONCEITO PRINCIPAL',M,226,10,'Mono',ORANGE)
    text(c,'IDENTIDADE',M-3,253,66,'Bold')
    para(c,'Quem são as pessoas por trás dos dados?',M,335,550,25,32,WHITE)
    rule(c,M,392,645,392)
    text(c,'DA CAPA PARA A TELA',M,416,11,'Mono',CYAN)
    para(c,'A capa de Blade Runner 2049 foi usada como ponto de partida visual e conceitual. O moodboard traduz ideias de identidade, memória, tecnologia e investigação para a interface do INTERLINK.',M,445,586,16,24,WHITE,max_h=120)
    para(c,'No pôster, rostos se sobrepõem entre luz quente e fria. Essa leitura orienta a atmosfera da central de investigação: descobrir uma pessoa a partir de pistas, registros e conexões.',M,570,586,13,19,MUTED,max_h=76)
    for i,(a,b,col) in enumerate([('16','REFERÊNCIAS',ORANGE),('04','GRUPOS',CYAN),('01','CONCEITO',GREEN)]):
        xx=M+i*193
        text(c,a,xx,698,32,'Light',col);text(c,b,xx,742,9,'Mono',MUTED)
    px,py,pw,ph=727,88,349,517
    rect(c,px-12,py-12,pw+24,ph+24,PANEL,LINE)
    photo(c,'poster-oficial.jpg',px,py,pw,ph,True)
    rect(c,px-12,py-12,90,3,ORANGE);rect(c,px+pw-78,py+ph+9,90,3,CYAN)
    text(c,'REFERÊNCIA ORIGINAL',715,645,10,'Mono',ORANGE)
    text(c,'Pôster oficial / Warner Bros. Italia',715,668,13,'Bold')
    link(c,'warnerbros.it/recap/blade-runner-2049/',WARNER,715,696,10,CYAN)
    para(c,'Material promocional do filme, exibido aqui como referência de pesquisa. A imagem da capa não faz parte da aplicação.',715,727,375,11,16,MUTED,max_h=54)
    c.showPage()


def overview(c):
    base(c,2,'PAINEL GERAL')
    c.bookmarkPage('painel');c.addOutlineEntry('Painel geral: as 16 referências','painel',0,False)
    title(c,'O clima do INTERLINK','As 16 referências reunidas em um painel. As páginas seguintes explicam cada escolha.')
    col_w=(W-2*M-3*GAP)/4
    for gi,g in enumerate(GROUPS):
        x=M+gi*(col_w+GAP)
        text(c,f'0{gi+1}',x,153,11,'Mono',g['color'])
        text(c,g['name'],x+30,151,16,'Bold')
        rule(c,x,178,x+col_w,178,g['color'],1)
        for ri,r in enumerate(g['refs']):
            y=194+ri*116
            visual(c,r,x,y,col_w,83)
            rect(c,x,y,29,21,BG)
            text(c,f'{r["id"]:02d}',x+7,y+5,10,'Mono',g['color'])
            text(c,r['keyword'],x,y+91,10.5,'Body',WHITE)
        para(c,g['why'],x,675,col_w,11,15,MUTED,max_h=100)
    text(c,'Referências fotográficas + materiais oficiais + estudos gráficos + capturas de interfaces reais.',M,786,8.5,'Mono',MUTED)
    c.showPage()


def group_page(c, idx):
    g=GROUPS[idx];n=idx+3
    base(c,n,g['name'],g['color'])
    key=f'grupo-{idx+1}'
    c.bookmarkPage(key);c.addOutlineEntry(g['name'],key,0,False)
    title(c,f'0{idx+1} / {g["name"]}',g['subtitle'],g['color'])
    cw=(W-2*M-GAP)/2
    for i,r in enumerate(g['refs']):
        x=M+(i%2)*(cw+GAP);y=139+(i//2)*293
        rect(c,x,y,cw,275,PANEL,LINE)
        visual(c,r,x+1,y+1,cw-2,135)
        rect(c,x+12,y+12,35,26,BG)
        text(c,f'{r["id"]:02d}',x+20,y+18,12,'Mono',g['color'])
        text(c,r['title'],x+17,y+149,18,'Bold')
        text(c,'PALAVRA-CHAVE: '+r['keyword'],x+17,y+176,9.5,'Mono',g['color'])
        para(c,r['text'],x+17,y+195,cw-34,12.6,17,WHITE,max_h=55)
        link(c,'Fonte: '+r['credit'],r['url'],x+17,y+259,8,MUTED)
    rect(c,M,732,W-2*M,59,PANEL)
    rect(c,M,732,3,59,g['color'])
    text(c,'POR QUE ESTE GRUPO?',M+17,745,9,'Mono',g['color'])
    para(c,g['why'],M+207,744,W-2*M-226,12.7,18,WHITE,max_h=38)
    c.showPage()


def synthesis(c):
    base(c,7,'DIREÇÃO VISUAL')
    c.bookmarkPage('sintese');c.addOutlineEntry('Síntese visual','sintese',0,False)
    title(c,'Síntese visual','Uma central de investigação com informação clara e atmosfera de mistério.')
    para(c,'Cada registro é uma pista.\nCada conexão ajuda a construir uma identidade.'.replace('\n',' '),M,158,1000,31,40,WHITE,max_h=90,font='Light')
    text(c,'01 / COR',M,274,10,'Mono',ORANGE)
    para(c,'Fundos escuros e painéis discretos sustentam a leitura. O laranja destaca ações e avisos; o ciano marca links e conexões. O verde aparece em pequenos estados do sistema, sempre junto de um rótulo.',M,297,1100,14,20,WHITE,max_h=60)
    palette=[(BG,'Fundo'),(PANEL,'Painéis'),(WHITE,'Texto principal'),(MUTED,'Texto secundário'),(ORANGE,'Ações / avisos'),(CYAN,'Links / conexões'),(GREEN,'Estado do sistema')]
    sw=(W-2*M-6*12)/7
    for i,(col,label) in enumerate(palette):
        xx=M+i*(sw+12)
        rect(c,xx,365,sw,51,col,LINE)
        text(c,col,xx,429,11,'Mono',WHITE)
        text(c,label,xx,450,10,'Body',MUTED)
    rule(c,M,482,W-M,482)
    text(c,'02 / FORMA',M,509,10,'Mono',CYAN)
    para(c,'Cards retangulares, bordas finas e cantos pouco arredondados organizam o conteúdo. Linhas e pontos mostram relações; texturas e brilhos ficam nos detalhes, deixando os dados em primeiro plano.',M,536,512,14,21,WHITE,max_h=105)
    text(c,'03 / FUNÇÃO',624,509,10,'Mono',CYAN)
    para(c,'A busca inicia a investigação. Os cards permitem comparar suspeitos, os dossiês aprofundam cada identidade e as conexões ajudam a relacionar os registros. O visual acompanha esse caminho de descoberta.',624,536,522,14,21,WHITE,max_h=105)
    rect(c,M,659,W-2*M,55,PANEL,LINE)
    steps=['PESQUISAR','COMPARAR SUSPEITOS','ABRIR DOSSIÊ','EXPLORAR CONEXÕES']
    for i,s in enumerate(steps):
        xx=M+20+i*274
        text(c,f'0{i+1}',xx,680,10,'Mono',ORANGE if i==0 else CYAN)
        text(c,s,xx+31,679,10.5,'Mono')
        if i<3:
            rule(c,xx+233,687,xx+253,687,CYAN,1)
            rule(c,xx+248,683,xx+253,687,CYAN,1);rule(c,xx+248,691,xx+253,687,CYAN,1)
    text(c,'ORIGEM DAS REFERÊNCIAS',M,742,9,'Mono',MUTED)
    para(c,'O pôster e as fotos do filme vêm do material oficial divulgado pela Warner. As demais imagens e capturas têm links nos próprios cards. Os estudos 05, 10 e 12 foram desenhados para este moodboard com apoio de IA; não são telas do app.',M,763,1102,10.4,15,MUTED,max_h=34)
    c.showPage()


def write_sources():
    refs=[r for g in GROUPS for r in g['refs']]
    doc=['# Fontes do moodboard INTERLINK', '',
         'Consulta realizada em 5 de outubro de 2026. As imagens são referências de pesquisa no PDF, não recursos do app Angular.', '',
         '## Ponto de partida', '', f'- Página oficial: {WARNER}',
         '- Pôster: https://warnerbros.cloudstatix.com/wp-content/uploads/2016/12/BR2_onesheet_DIGITAL.jpg',
         f'- Imagens oficiais, pacote 1: {PACK1}',f'- Imagens oficiais, pacote 2: {PACK2}',
         '- Créditos do filme: © 2017 Alcon Entertainment, LLC. Material promocional divulgado pela Warner Bros. Italia.', '',
         '## Referências numeradas', '']
    for r in refs:
        doc.extend([f'### {r["id"]:02d}. {r["title"]} ({r["keyword"]})', '', r['credit'], '',r.get('url') or 'Estudo vetorial produzido no script do moodboard com apoio de IA.', '', f'Arquivo: `{r.get("image", "desenho vetorial no PDF")}`', ''])
    doc.extend(['## Como gerar novamente', '',
                'Instale Python, `reportlab` e `Pillow`. Mantenha a pasta `moodboard-assets` ao lado do script e execute:', '',
                '```text', 'python docs/gerar-moodboard.py', '```', '',
                'O script funciona sem rede. Usa Segoe UI/Consolas no Windows, com alternativa DejaVu Sans/Mono no Linux. Não inclui nem modifica arquivos em `src`.', '',
                '## Organização do entregável', '',
                'A página 2 reúne as 16 referências em um único painel. As páginas 3 a 6 ampliam os quatro grupos, com título, palavra-chave, aplicação no INTERLINK e justificativa. A página 7 fecha a direção visual.', '',
                'As fotografias são apresentadas com recortes de enquadramento no PDF. As capturas de interfaces preservam as cores e proporções originais. Os textos explicam a adaptação para a paleta do projeto.', ''])
    (HERE/'fontes-moodboard.md').write_text('\n'.join(doc),encoding='utf-8')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=OUTPUT)
    args=parser.parse_args()
    register_fonts()
    refs=[r for g in GROUPS for r in g['refs']]
    assert len(GROUPS)==4 and all(len(g['refs'])==4 for g in GROUPS)
    for r in refs:
        if 'image' in r and not (ASSETS/r['image']).is_file():raise FileNotFoundError(ASSETS/r['image'])
    args.output.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(args.output),pagesize=(W,H),pageCompression=1,invariant=1)
    c.setTitle('MOODBOARD — INTERLINK | Inspirado em Blade Runner 2049')
    c.setAuthor('INTERLINK')
    c.setSubject('Identidade, memória, tecnologia e investigação: 16 referências em quatro grupos.')
    c.setKeywords('INTERLINK, moodboard, identidade, Blade Runner 2049, investigação')
    c.setViewerPreference('DisplayDocTitle','true')
    cover(c);overview(c)
    for idx in range(4):group_page(c,idx)
    synthesis(c);c.save()
    write_sources()
    print(f'PDF gerado: {args.output.resolve()}')
    print(f'Paginas: 7 | Grupos: 4 | Referencias: {len(refs)} | Bytes: {args.output.stat().st_size}')


if __name__=='__main__':main()
