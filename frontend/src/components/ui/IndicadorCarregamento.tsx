/** Indicador de carregamento da marca: um anel de brasa com um ponto em órbita. */
export default function IndicadorCarregamento({ rotulo = 'Carregando…' }: { rotulo?: string }) {
  return (
    <div className="av-carregando" role="status" aria-live="polite">
      <span className="av-carregando-anel" aria-hidden="true">
        <span className="av-carregando-orbita" />
      </span>
      <span className="av-rotulo">{rotulo}</span>
    </div>
  );
}
