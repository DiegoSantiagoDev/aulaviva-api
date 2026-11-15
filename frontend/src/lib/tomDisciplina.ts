/**
 * Tom por disciplina: um só lugar para a biblioteca, o detalhe da aula e a
 * página institucional. O resultado vai em data-tom="..." e ativa as variáveis
 * --tom, --tom-suave e --tom-barra definidas em src/styles/tokens.css.
 */
export const TONS = ['ouro', 'terra', 'salvia', 'destaque'] as const;

export type TomDisciplina = (typeof TONS)[number];

/** Disciplinas conhecidas têm tom fixo; as demais caem no cálculo estável abaixo. */
const TONS_FIXOS: Record<string, TomDisciplina> = {
  matematica: 'ouro',
  historia: 'terra',
  ciencias: 'salvia',
  portugues: 'destaque',
};

function semAcento(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Mesma disciplina, mesmo tom, em qualquer tela. */
export function tomDaDisciplina(disciplina: string): TomDisciplina {
  const chave = semAcento(disciplina);
  const fixo = TONS_FIXOS[chave];
  if (fixo) return fixo;

  let soma = 0;
  for (const letra of chave) {
    soma = (soma * 31 + letra.charCodeAt(0)) >>> 0;
  }
  return TONS[soma % TONS.length];
}
