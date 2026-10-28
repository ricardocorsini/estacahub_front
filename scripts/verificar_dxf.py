"""Leitor independente opcional: pip install ezdxf matplotlib. Nenhum serviço externo."""
from pathlib import Path
import json
import math
import ezdxf
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import Frontend, RenderContext
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.config import Configuration, BackgroundPolicy

out = Path('artifacts')
for nome in ['fixture', 'ampla', 'sem-locacao']:
    entrada = json.loads((out / f'{nome}.json').read_text())
    doc = ezdxf.readfile(out / f'{nome}.dxf')
    auditoria = doc.audit()
    assert not auditoria.errors, [(e.code, e.message) for e in auditoria.errors]
    assert not auditoria.fixes, [(e.code, e.message) for e in auditoria.fixes]
    assert doc.header['$INSUNITS'] == 6
    assert doc.dxfversion == 'AC1021'
    msp = doc.modelspace()
    circulos = list(msp.query('CIRCLE[layer=="EH_ESTACAS"]'))
    esperadas = [p for p in entrada['localizados'] if p['tipo'] == 'estaca' and p['raio'] is not None]
    assert len(circulos) == len(esperadas)
    for circulo, ponto in zip(circulos, esperadas):
        assert circulo.dxf.center.x == ponto['x']
        assert circulo.dxf.center.y == ponto['y']
        assert circulo.dxf.center.z == 0
        assert circulo.dxf.radius == ponto['raio']
    furos = list(msp.query('INSERT[layer=="EH_SONDAGENS"]'))
    assert len(furos) == len([p for p in entrada['localizados'] if p['tipo'] == 'sondagem'])
    for e in msp.query('DIMENSION'):
        assert e.dxf.dimstyle == 'EH_METROS'
        assert len(doc.blocks[e.dxf.geometry]) > 0
        assert math.isclose(e.get_measurement(), e.dxf.actual_measurement, abs_tol=1e-9)
    estilo = doc.dimstyles.get('EH_METROS')
    assert estilo.dxf.dimlfac == 1 and estilo.dxf.dimscale == 1
    for nome_layer in ['EH_ESTACAS','EH_SONDAGENS','EH_IDENTIFICACOES','EH_REFERENCIA_LOCACAO','EH_COTAS_PLANTA','EH_CHAMADAS_NOTAS','EH_QUADROS_CADASTRAIS']:
        assert doc.layers.get(nome_layer).dxf.lineweight > 0
    textos = ' '.join(e.plain_text(fast=False) for e in msp.query('MTEXT'))
    assert 'São João' in textos and 'Não informado' in textos
    if nome == 'fixture':
        assert math.hypot(circulos[1].dxf.center.x - circulos[0].dxf.center.x, circulos[1].dxf.center.y - circulos[0].dxf.center.y) == 5
        assert circulos[0].dxf.radius * 2 == 0.4
        assert r'\P {teste} %%d' in textos, textos[:1000]
        assert any(math.isclose(e.get_measurement(),5) for e in msp.query('DIMENSION'))
    print(f'{nome}: audit sem erros/correções, {len(msp)} entidades, {len(circulos)} estacas, {len(furos)} sondagens, unidades/layers/textos/dimensões OK')
    # Renderização CAD independente para inspeção visual da planta e do conjunto de folhas.
    grupos = [('completo', list(msp))]
    if entrada['localizados']:
        grupos.append(('planta', [e for e in msp if e.dxf.layer != 'EH_QUADROS_CADASTRAIS' and not (e.dxftype() in ('CIRCLE','INSERT') and e.dxf.layer == 'EH_CHAMADAS_NOTAS')]))
    for sufixo, entidades in grupos:
        fig = plt.figure(figsize=(18,10), dpi=150)
        ax = fig.add_axes([0,0,1,1])
        ctx = RenderContext(doc)
        backend = MatplotlibBackend(ax)
        Frontend(ctx,backend).draw_entities(entidades)
        backend.finalize()
        ax.set_aspect('equal', adjustable='box')
        fig.savefig(out/f'{nome}-{sufixo}.png', dpi=150)
        plt.close(fig)

# Ampliações de folhas a partir das entidades lidas, para conferir tipografia e quebras.
doc = ezdxf.readfile(out / 'fixture.dxf')
meta = json.loads((out / 'fixture-layout.json').read_text())
for i, folha in enumerate(meta['folhas']):
    fig = plt.figure(figsize=(15, 10), dpi=150)
    ax = fig.add_axes([0,0,1,1])
    backend = MatplotlibBackend(ax)
    Frontend(RenderContext(doc), backend, config=Configuration(background_policy=BackgroundPolicy.WHITE)).draw_layout(doc.modelspace(), finalize=True)
    ax.set_xlim(folha['x']-0.3, folha['x']+folha['largura']+0.3)
    ax.set_ylim(folha['y']-folha['altura']-0.3,folha['y']+0.3)
    ax.set_aspect('equal', adjustable='box')
    fig.set_size_inches(15,10)
    fig.savefig(out/f'fixture-folha-{i+1}.png',dpi=150)
    plt.close(fig)
