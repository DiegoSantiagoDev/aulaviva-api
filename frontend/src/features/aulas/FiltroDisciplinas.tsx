/**
 * Chips de filtro por disciplina, com a contagem de aulas de cada uma.
 * Usa .av-filtros e .av-chip de compartilhado.css (no celular a faixa rola
 * na horizontal; a partir de 768 px os chips quebram em linhas).
 */
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
  const opcoes = [{ nome: 'Todas', contagem: totalAulas }, ...disciplinas];

  return (
    <div className="av-filtros" role="group" aria-label="Filtrar por disciplina">
      {opcoes.map((opcao) => (
        <button
          key={opcao.nome}
          type="button"
          className="av-chip"
          aria-pressed={selecionada === opcao.nome}
          onClick={() => onSelecionar(opcao.nome)}
        >
          <span>{opcao.nome}</span>
          <span className="av-chip-qtd">{opcao.contagem}</span>
        </button>
      ))}
    </div>
  );
}
