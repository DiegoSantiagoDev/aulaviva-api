import { SlideItem, SlideLayout } from '../../api/tipos';

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Apelidos aceitos para o layout declarado pela IA. */
const APELIDOS_LAYOUT: Record<string, SlideLayout> = {
  capa: 'capa',
  title: 'capa',
  titulo: 'capa',
  definicao: 'definicao',
  definition: 'definicao',
  exemplo: 'exemplo',
  example: 'exemplo',
  formula: 'formula',
  'duas-colunas': 'duas-colunas',
  'two-columns': 'duas-colunas',
  columns: 'duas-colunas',
  revisao: 'revisao',
  review: 'revisao',
  resumo: 'revisao',
  conclusion: 'revisao',
  perguntas: 'perguntas',
  questions: 'perguntas',
  quiz: 'perguntas',
};

/**
 * Sinais de título usados com limites de palavra. Isso evita que palavras
 * genéricas dentro de frases maiores (ex.: "exemplar", "resumido") mudem
 * o layout do slide por engano.
 */
const SINAL_PERGUNTAS =
  /\b(perguntas?|questoes?|fixacao|quiz|exercicios?|reflexao)\b/;
const SINAL_DEFINICAO =
  /\b(o que (?:e)|definicao|significado|conceitos? fundamentais?)\b/;
const SINAL_EXEMPLO =
  /\b(exemplos?|casos? praticos?|aplicacoes?|na pratica)\b/;
const SINAL_REVISAO =
  /\b(revisao|resumo|conclusao|sintese|pontos?[- ]chave|recapitulacao)\b/;

/**
 * Reconhece expressões matemáticas reais. Não usa `+` ou `/` isolados,
 * que aparecem com frequência em texto comum ("e/ou", "custo + taxa").
 */
const EXPRESSAO_MATEMATICA =
  /[=²³√≠≤≥Δ∑π∞^]|\b\d+\s*\/\s*\d+\b|\b\d+\s*[+\-*/]\s*\d+\b|\b[a-zA-Z]\s*\([^)]*\)\s*=/;

function ehItemMatematico(item: string): boolean {
  return EXPRESSAO_MATEMATICA.test(item);
}

/**
 * Heurística de layout: escolhe a composição visual mais adequada a partir
 * do layout declarado, do título, do conteúdo e da posição do slide.
 *
 * Regras centralizadas aqui para que o dono possa ajustá-las sem mexer
 * nos componentes visuais.
 */
export function resolverLayout(
  slide: SlideItem,
  indice: number,
  totalSlides: number
): SlideLayout {
  const declarado = APELIDOS_LAYOUT[normalizarTexto(slide.layout || '')];

  // Primeiro slide sempre é capa; layout "title/capa" também vira capa.
  if (indice === 0 || declarado === 'capa') return 'capa';

  // Layouts específicos declarados pela IA são respeitados.
  if (declarado) return declarado;

  const titulo = normalizarTexto(slide.title);
  const itens = Array.isArray(slide.content) ? slide.content.filter(Boolean) : [];

  // Sinais de título com prioridade didática.
  if (SINAL_PERGUNTAS.test(titulo)) return 'perguntas';
  if (SINAL_DEFINICAO.test(titulo)) return 'definicao';
  if (SINAL_EXEMPLO.test(titulo)) return 'exemplo';
  if (SINAL_REVISAO.test(titulo)) return 'revisao';

  // Fórmulas: maioria dos itens com expressão matemática real.
  const itensMatematicos = itens.filter(ehItemMatematico).length;
  if (itens.length > 0 && itensMatematicos > itens.length / 2) {
    return 'formula';
  }

  // Duas colunas: pelo menos 4 itens curtos e homogêneos.
  const todosCurtos = itens.length >= 4 && itens.every((item) => item.length <= 90);
  if (todosCurtos) return 'duas-colunas';

  // Último slide sem sinal específico fecha a apresentação como revisão.
  if (indice === totalSlides - 1) return 'revisao';

  return 'conteudo';
}
