"""Gera o contrato visual e dois desenhos de tela. Requer reportlab e Pillow.
Execute: python docs/gerar-identidade-visual.py
"""
from pathlib import Path
import importlib.util
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('moodboard', HERE / 'gerar-moodboard.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
fonts = HERE.parent / 'public/fonts'
for alias, file in [('Body','space-grotesk-regular.ttf'),('Light','space-grotesk-regular.ttf'),('Bold','space-grotesk-bold.ttf'),('Mono','dm-mono-regular.ttf')]:
    pdfmetrics.registerFont(TTFont(alias, str(fonts / file)))
R,T,P,L = m.rect,m.text,m.para,m.rule
B,F,W,G,O,C,S = m.BG,m.PANEL,m.WHITE,m.MUTED,m.ORANGE,m.CYAN,m.GREEN
OUT=HERE/'identidade-visual-interlink.pdf'
c=canvas.Canvas(str(OUT),pagesize=(m.W,m.H),pageCompression=1,invariant=1)
c.setTitle('INTERLINK | Identidade visual e estudos de tela')
c.setAuthor('INTERLINK')

def base(n,label):
    R(c,0,0,1190,842,B)
    T(c,'INTERLINK / IDENTIDADE VISUAL',44,30,10,'Mono',G)
    T(c,label,852,30,10,'Mono',C)
    L(c,44,53,1146,53);L(c,44,802,1146,802)
    T(c,'DA CAPA PARA A TELA  /  CONCEITO: IDENTIDADE',44,815,9,'Mono',G)
    T(c,f'{n:02d} / 02',1090,815,9,'Mono',G)

def screen(x,y,w,h,detail=False):
    R(c,x,y,w,h,F,m.LINE)
    sx,sy=w/1060,h/265
    def rr(a,b,ww,hh,col,st=None):R(c,x+a*sx,y+b*sy,ww*sx,hh*sy,col,st)
    def tt(s,a,b,size=12,col=W,font='Body'):T(c,s,x+a*sx,y+b*sy,size*sx,font,col)
    rr(0,0,1060,30,B)
    tt('INTERLINK',20,9,12,W,'Bold');tt('CENTRAL     SUSPEITOS     NOVO CASO',375,10,8,G,'Mono')
    tt('DADOS FICTÍCIOS',900,10,8,S,'Mono')
    if not detail:
        tt('SISTEMA DE INVESTIGAÇÃO / 01',25,48,8,C,'Mono')
        tt('Toda identidade',25,70,35,W,'Bold');tt('deixa um rastro.',25,107,35,O,'Bold')
        tt('Cruze registros. Encontre conexões.',25,153,12,G)
        rr(25,181,151,27,O);tt('Explorar suspeitos',37,189,10,B,'Bold')
        rr(186,181,132,27,F,m.LINE);tt('Registrar ocorrência',196,189,9,W)
        rr(641,45,390,161,B,m.LINE)
        for a,b,d,e in [(710,90,818,134),(818,134,940,84),(818,134,979,170),(710,179,818,134)]:
            L(c,x+a*sx,y+b*sy,x+d*sx,y+e*sy,C,.8)
        for a,b in [(710,90),(818,134),(940,84),(979,170),(710,179)]:
            m.circle(c,x+a*sx,y+b*sy,9*sx,B,O if a==818 else C)
        tt('REGISTROS CONECTADOS',659,217,8,G,'Mono')
        for i,(n,label) in enumerate([('02','CASOS ATIVOS'),('23','EVIDÊNCIAS'),('10','REGISTROS')]):
            xx=25+i*193
            rr(xx,225,182,28,B,m.LINE);tt(n,xx+8,231,13,C,'Bold');tt(label,xx+40,235,7,G,'Mono')
    else:
        tt('DOSSIÊ / #003',25,48,8,C,'Mono');tt('Uma pessoa, várias pistas.',25,70,28,W,'Bold')
        tt('Identidade, casos vinculados e relações em um só lugar.',25,109,11,G)
        for i,(a,b) in enumerate([('IDENTIDADE','Nome / contato / origem'),('CLASSIFICAÇÃO','Risco e acompanhamento'),('CONEXÕES','Registros em casos comuns')]):
            xx=25+i*343
            rr(xx,139,325,46,B,m.LINE);tt(a,xx+10,147,8,C,'Mono');tt(b,xx+10,162,11,W)
        tt('REGISTROS RELACIONADOS',25,203,8,G,'Mono')
        for i in range(3):
            xx=25+i*343
            rr(xx,220,325,30,B,m.LINE);tt(f'0{i+1} / Perfil relacionado',xx+10,230,10,W);tt('ABRIR >',xx+247,230,8,C,'Mono')

base(1,'01 / SISTEMA VISUAL')
T(c,'INTERLINK',44,79,42,'Bold')
P(c,'O nome une interligação e link: a identidade de cada registro fica mais clara quando suas conexões são vistas em conjunto.',383,85,710,15,22,W,max_h=66)
R(c,44,156,1102,58,F)
T(c,'FRASE DE DIREÇÃO',60,170,9,'Mono',C)
T(c,'Informação em primeiro plano; a luz revela as conexões.',285,171,21,'Bold')
T(c,'01 / PALETA E PAPÉIS',44,242,12,'Mono',O)
palette=[(B,'Fundo'),(F,'Painéis'),(W,'Texto principal'),(G,'Texto secundário'),(O,'Ação principal'),(C,'Links / conexões'),(S,'Sucesso'),('#FF6875','Erro')]
pw=(1102-7*12)/8
for i,(col,label) in enumerate(palette):
    xx=44+i*(pw+12);R(c,xx,272,pw,44,col,m.LINE)
    T(c,col,xx,326,10,'Mono');T(c,label,xx,346,10,'Body',G)
P(c,'Quatro cores de acento. Botões laranja usam texto escuro; links são ciano. Sucesso e erro sempre têm ícone ou texto junto da cor. Os tons neutros formam a maior parte da tela.',44,378,1080,13,19,W,max_h=42)
L(c,44,432,1146,432)
T(c,'02 / TIPOGRAFIA',44,448,12,'Mono',C)
T(c,'Space Grotesk',44,472,25,'Bold')
P(c,'Títulos: 700, 48 px (32 px no celular). Abertura: 72 px (44 px no celular). Subtítulos: 24 px / 700. Texto: 16 px / 400, linha 1,6.',44,510,505,12,17,W,max_h=48)
T(c,'DM MONO / 012345',626,475,23,'Mono')
P(c,'Códigos e estados: 12 px / 400; legendas: 10 px. Linha 1,5. Fontes do Google Fonts, servidas localmente, com licenças OFL em public/fonts.',626,510,510,12,17,W,max_h=48)
L(c,44,565,1146,565)
T(c,'03 / FORMA E ESPAÇO',44,580,12,'Mono',O)
P(c,'Raio: 6 px. Borda: 1 px, #273140. Espaços em múltiplos de 4 px, intervalo-base de 24 px. Conteúdo: até 1180 px.',44,606,505,12,17,W,max_h=40)
P(c,'Cards sem sombra; brilhos suaves no mapa. No celular, colunas empilham. Botões de pelo menos 44 px e foco visível.',626,606,510,12,17,W,max_h=40)
T(c,'04 / TELAS DESENHADAS  ·  CENTRAL',44,656,10,'Mono',O)
T(c,'DOSSIÊ INDIVIDUAL  ·  AMPLIADAS NA PÁGINA 2',609,656,10,'Mono',C)
screen(44,678,537,113)
screen(609,678,537,113,True)
c.showPage()

base(2,'02 / DUAS TELAS DESENHADAS')
T(c,'Da identidade à navegação',44,79,34,'Bold')
P(c,'Estudos vetoriais preparados para orientar a revisão do site. Definem a hierarquia e a distribuição dos elementos; os dados abaixo são exemplos.',44,127,1080,14,20,G,max_h=42)
T(c,'TELA 01 / CENTRAL',44,183,11,'Mono',O)
screen(44,208,1102,231)
P(c,'Uma entrada clara para pesquisar suspeitos, acompanhar casos e ver o resumo da central. O mapa de linhas e pontos traduz o conceito de conexões.',44,452,1090,13,19,G,max_h=40)
T(c,'TELA 02 / DOSSIÊ INDIVIDUAL',44,496,11,'Mono',C)
screen(44,521,1102,231,True)
P(c,'O dossiê aproxima os dados da pessoa dos casos e registros relacionados. As conexões levam a outros perfis e mantêm a investigação em continuidade.',44,766,1090,12,17,G,max_h=34)
c.showPage();c.save()
print(OUT)
