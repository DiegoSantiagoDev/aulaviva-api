/**
 * Esqueleto da biblioteca: dois grupos de três cartões, com o mesmo desenho
 * (e a mesma altura) do cartão real, para a página não "pular" ao carregar.
 * Estilos: .av-esq-barra e .av-esq-cartao em aulas.css.
 */
export default function EsqueletoAulas() {
  return (
    <div className="space-y-12" role="status" aria-busy="true">
      <span className="sr-only">Carregando aulas…</span>

      {[1, 2].map((grupo) => (
        <div key={grupo} className="space-y-5" aria-hidden="true">
          <div className="av-grupo-cab">
            <div className="av-esq-barra h-8 w-8" style={{ borderRadius: 'var(--av-raio-sm)' }} />
            <div className="av-esq-barra h-7 w-40" />
          </div>

          <div className="av-grade">
            {[1, 2, 3].map((cartao) => (
              <div key={cartao} className="av-esq-cartao">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="av-esq-barra h-6 w-24" style={{ borderRadius: '999px' }} />
                    <div className="av-esq-barra h-4 w-20" />
                  </div>
                  <div className="av-esq-barra h-6 w-4/5 mb-2" />
                  <div className="av-esq-barra h-6 w-3/5" />
                </div>
                <div className="flex items-center justify-between gap-3 pt-4 mt-6">
                  <div className="av-esq-barra h-5 w-16" />
                  <div className="av-esq-barra h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
