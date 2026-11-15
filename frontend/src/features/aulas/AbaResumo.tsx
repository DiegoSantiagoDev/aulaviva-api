import { useState, useMemo } from 'react';
import { analisarResumo } from '../../lib/resumo';
import { copiarTexto } from '../../lib/clipboard';
import { Copy, Check, Printer, BookOpen, Clock, ListTree, AlertCircle } from 'lucide-react';

interface AbaResumoProps {
  resumoBruto: string | null;
  tituloAula: string;
}

type EstadoCopia = 'parado' | 'ok' | 'erro';

export default function AbaResumo({ resumoBruto, tituloAula }: AbaResumoProps) {
  const [copia, setCopia] = useState<EstadoCopia>('parado');

  const dadosResumo = useMemo(() => analisarResumo(resumoBruto), [resumoBruto]);

  // Tempo estimado de leitura (200 palavras por minuto)
  const minutosLeitura = useMemo(() => {
    const textos = [
      ...dadosResumo.paragrafosGerais,
      ...dadosResumo.secoes.flatMap((s) => [...s.paragrafos, ...s.itensLista]),
    ];
    const palavras = textos.join(' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(palavras / 200));
  }, [dadosResumo]);

  const aoCopiar = async () => {
    if (!resumoBruto) return;
    let ok = false;
    try {
      ok = await copiarTexto(resumoBruto);
    } catch {
      ok = false;
    }
    setCopia(ok ? 'ok' : 'erro');
    setTimeout(() => setCopia('parado'), 2500);
  };

  const aoImprimir = () => {
    window.print();
  };

  const rolarParaSecao = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Estado vazio
  if (!resumoBruto || (!dadosResumo.temSecoes && dadosResumo.paragrafosGerais.length === 0)) {
    return (
      <div className="av-estado av-estado-vazio">
        <div className="av-estado-icone">
          <BookOpen className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="av-estado-titulo">Resumo não disponível</h3>
        <p className="av-estado-texto">
          O resumo didático desta aula ainda não foi sintetizado pelos modelos de inteligência
          artificial. Volte mais tarde ou estude pelos slides e pelas fotos do quadro.
        </p>
      </div>
    );
  }

  const comIndice = dadosResumo.secoes.length >= 3;
  const totalSecoes = dadosResumo.secoes.length;

  return (
    <div className={`av-resumo-grade ${comIndice ? 'av-resumo-grade-com-indice' : ''}`}>
      {/* Índice lateral (desktop), quando houver 3 ou mais seções */}
      {comIndice && (
        <aside className="av-resumo-indice no-print">
          <p className="av-resumo-indice-titulo">Nesta aula</p>
          <nav aria-label="Navegação do resumo">
            <ul>
              {dadosResumo.secoes.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => rolarParaSecao(s.id)}
                    className="av-resumo-indice-item"
                    title={s.titulo}
                  >
                    {s.titulo}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Índice em faixa (celular e tablet) */}
        {comIndice && (
          <nav className="av-resumo-chips no-print" aria-label="Seções do resumo">
            {dadosResumo.secoes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => rolarParaSecao(s.id)}
                className="av-aula-chip"
                title={s.titulo}
              >
                {s.titulo}
              </button>
            ))}
          </nav>
        )}

        {/* Conteúdo formatado (nós React puros, sem dangerouslySetInnerHTML) */}
        <article className="av-resumo-artigo" aria-label={`Resumo da aula ${tituloAula}`}>
          <div className="av-resumo-cab">
            <div>
              <h2 className="av-resumo-h2">Resumo da aula</h2>
              <p className="av-resumo-info">
                {totalSecoes > 0 && (
                  <span>
                    <ListTree className="w-3.5 h-3.5" aria-hidden="true" />
                    {totalSecoes} {totalSecoes === 1 ? 'seção' : 'seções'}
                  </span>
                )}
                <span>
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {minutosLeitura} min de leitura
                </span>
              </p>
            </div>

            <div className="av-resumo-acoes no-print">
              <button
                type="button"
                onClick={aoCopiar}
                className={`av-btn av-btn-contorno ${
                  copia === 'ok' ? 'av-resumo-btn-ok' : copia === 'erro' ? 'av-resumo-btn-erro' : ''
                }`}
                aria-live="polite"
              >
                {copia === 'ok' && (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copiado</span>
                  </>
                )}
                {copia === 'erro' && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Não foi possível copiar</span>
                  </>
                )}
                {copia === 'parado' && (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copiar resumo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={aoImprimir}
                className="av-btn av-btn-contorno"
                title="Imprimir ou salvar como PDF"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          <div className="av-resumo-corpo">
            {/* Parágrafos introdutórios, quando houver */}
            {dadosResumo.paragrafosGerais.length > 0 && (
              <div className="av-resumo-intro">
                {dadosResumo.paragrafosGerais.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {/* Seções identificadas */}
            {dadosResumo.secoes.map((secao) => (
              <section key={secao.id} id={secao.id} className="av-resumo-secao">
                <h3 className="av-resumo-h3">
                  <span className="av-losango" aria-hidden="true" />
                  {secao.titulo}
                </h3>

                {secao.paragrafos.map((paragrafo, idx) => (
                  <p key={idx} className="av-resumo-p">
                    {paragrafo}
                  </p>
                ))}

                {secao.itensLista.length > 0 && (
                  <ul className="av-resumo-lista">
                    {secao.itensLista.map((item, idx) => (
                      <li key={idx}>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
