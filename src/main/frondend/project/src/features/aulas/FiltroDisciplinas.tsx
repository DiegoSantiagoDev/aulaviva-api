interface FiltroDisciplinasProps {
  disciplinas: { nome: string; contagem: number }[];
  selecionada: string;
  onSelecionar: (disciplina: string) => void;
  totalAulas: number;
}

export default function FiltroDisciplinas({
  disciplinas,
  selecionada,
  onSelecionar,
  totalAulas,
}: FiltroDisciplinasProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por matéria">
      <button
        onClick={() => onSelecionar('Todas')}
        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
          selecionada === 'Todas'
            ? 'bg-ink text-parchment shadow-md'
            : 'bg-ink/5 text-ink-soft hover:bg-gold/15'
        }`}
        aria-pressed={selecionada === 'Todas'}
      >
        <span>Todas</span>
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            selecionada === 'Todas' ? 'bg-gold text-ink font-bold' : 'bg-ink/10 text-ink-soft'
          }`}
        >
          {totalAulas}
        </span>
      </button>

      {disciplinas.map((d) => {
        const ativo = selecionada === d.nome;
        return (
          <button
            key={d.nome}
            onClick={() => onSelecionar(d.nome)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
              ativo
                ? 'bg-ink text-parchment shadow-md'
                : 'bg-ink/5 text-ink-soft hover:bg-gold/15'
            }`}
            aria-pressed={ativo}
          >
            <span>{d.nome}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                ativo ? 'bg-gold text-ink font-bold' : 'bg-ink/10 text-ink-soft'
              }`}
            >
              {d.contagem}
            </span>
          </button>
        );
      })}
    </div>
  );
}
