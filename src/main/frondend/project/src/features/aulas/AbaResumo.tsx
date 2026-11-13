import { useState, useMemo } from 'react';
import { analisarResumo } from '../../lib/resumo';
import { copiarTexto } from '../../lib/clipboard';
import { Copy, Check, Printer, ListTree, BookOpen } from 'lucide-react';

interface AbaResumoProps {
  resumoBruto: string | null;
  tituloAula: string;
}

export default function AbaResumo({ resumoBruto, tituloAula }: AbaResumoProps) {
  const [copiado, setCopiado] = useState(false);

  const dadosResumo = useMemo(() => analisarResumo(resumoBruto), [resumoBruto]);

  const aoCopiar = async () => {
    if (!resumoBruto) return;
    const ok = await copiarTexto(resumoBruto);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
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

  if (!resumoBruto || (!dadosResumo.temSecoes && dadosResumo.paragrafosGerais.length === 0)) {
    return (
      <div className="art-frame rounded-2xl p-12 text-center border border-gold/30">
        <BookOpen className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-display text-2xl font-bold text-ink">Resumo não disponível</h3>
        <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
          O resumo didático desta aula ainda não foi sintetizado pelos modelos de inteligência artificial.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 anim-fade-up">
      {/* Barra de ações do resumo */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl art-frame border border-gold/25 no-print">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
          <BookOpen className="w-4 h-4 text-gold" />
          <span>Síntese Didática da Aula</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={aoCopiar}
            className="ink-btn px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
            aria-live="polite"
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-sage" />
                <span className="text-sage">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gold" />
                <span>Copiar resumo</span>
              </>
            )}
          </button>

          <button
            onClick={aoImprimir}
            className="gold-outline-btn px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
            title="Imprimir ou salvar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Índice de Seções quando houver 3 ou mais */}
        {dadosResumo.secoes.length >= 3 && (
          <aside className="sticky top-24 art-frame rounded-2xl p-5 border border-gold/25 space-y-3 no-print hidden lg:block">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terra-deep">
              <ListTree className="w-4 h-4 text-gold" />
              <span>Neste Resumo</span>
            </div>
            <nav className="space-y-1.5" aria-label="Navegação do resumo">
              {dadosResumo.secoes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => rolarParaSecao(s.id)}
                  className="block w-full text-left text-xs py-1.5 px-2 rounded-lg text-ink-soft hover:text-ink hover:bg-gold/15 transition-colors truncate"
                  title={s.titulo}
                >
                  {s.titulo}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* Conteúdo textual formatado (Renderização pura de nós React, zero dangerouslySetInnerHTML) */}
        <article className="art-frame rounded-3xl p-6 sm:p-10 border border-gold/30 space-y-8 print:p-0 print:border-none print:shadow-none bg-parchment">
          <div className="border-b border-gold/20 pb-4">
            <span className="text-xs uppercase tracking-widest2 text-gold font-semibold">Resumo Didático</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-1">
              {tituloAula}
            </h2>
          </div>

          {/* Se houver parágrafos introdutórios gerais */}
          {dadosResumo.paragrafosGerais.length > 0 && (
            <div className="space-y-3">
              {dadosResumo.paragrafosGerais.map((p, idx) => (
                <p key={idx} className="text-base text-ink leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Renderização das seções identificadas */}
          {dadosResumo.secoes.map((secao) => (
            <section key={secao.id} id={secao.id} className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <h3 className="font-display text-2xl font-bold text-ink tracking-tight">
                  {secao.titulo}
                </h3>
                <div className="flex-1 h-px bg-gold/20" />
              </div>

              {/* Parágrafos da seção */}
              {secao.paragrafos.length > 0 && (
                <div className="space-y-3">
                  {secao.paragrafos.map((paragrafo, idx) => (
                    <p key={idx} className="text-base sm:text-lg text-ink/90 leading-relaxed font-sans">
                      {paragrafo}
                    </p>
                  ))}
                </div>
              )}

              {/* Lista com marcadores customizados */}
              {secao.itensLista.length > 0 && (
                <ul className="space-y-2.5 pl-2">
                  {secao.itensLista.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-ink leading-relaxed">
                      <span className="text-gold font-bold mt-1.5 flex-shrink-0">◆</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
