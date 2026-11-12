import { SlideItem, SlideLayout } from '../../api/tipos';

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Heurística inteligente para determinar o melhor layout visual do slide
 * quando a IA devolve layouts genéricos ou repetitivos como 'content'.
 */
export function resolverLayout(
  slide: SlideItem,
  indice: number,
  totalSlides: number
): SlideLayout {
  // 1. Respeita se já vier com layout específico conhecido
  const layoutDeclarado = (slide.layout || '').toLowerCase().trim();

  if (layoutDeclarado === 'title' || layoutDeclarado === 'capa' || indice === 0) {
    return 'capa';
  }

  if (layoutDeclarado === 'definition' || layoutDeclarado === 'definicao') {
    return 'definicao';
  }

  if (layoutDeclarado === 'example' || layoutDeclarado === 'exemplo') {
    return 'exemplo';
  }

  if (layoutDeclarado === 'formula') {
    return 'formula';
  }

  if (layoutDeclarado === 'duas-colunas') {
    return 'duas-colunas';
  }

  if (layoutDeclarado === 'revisao' || layoutDeclarado === 'perguntas') {
    return layoutDeclarado;
  }

  // 2. Análise semântica do título do slide
  const tituloNorm = normalizarTexto(slide.title);

  if (tituloNorm.includes('o que e') || tituloNorm.includes('definicao') || tituloNorm.includes('conceito')) {
    return 'definicao';
  }

  if (tituloNorm.includes('exemplo') || tituloNorm.includes('caso pratico') || tituloNorm.includes('aplicacao')) {
    return 'exemplo';
  }

  if (tituloNorm.includes('pergunta') || tituloNorm.includes('fixacao') || tituloNorm.includes('quiz')) {
    return 'perguntas';
  }

  if (
    indice === totalSlides - 1 ||
    tituloNorm.includes('revis') ||
    tituloNorm.includes('resumo') ||
    tituloNorm.includes('conclus') ||
    tituloNorm.includes('pontos principais')
  ) {
    return 'revisao';
  }

  // 3. Análise do conteúdo textual para fórmulas
  const itens = slide.content || [];
  const itensComFormula = itens.filter((item) => {
    return (
      item.includes('=') ||
      item.includes('²') ||
      item.includes('³') ||
      item.includes('Δ') ||
      item.includes('√') ||
      item.includes('≠') ||
      item.includes('f(x)') ||
      item.includes('+') ||
      item.includes('·') ||
      item.includes('/')
    );
  });

  if (itens.length > 0 && itensComFormula.length >= Math.ceil(itens.length / 2)) {
    return 'formula';
  }

  // 4. Análise para duas colunas (4 ou mais itens curtos)
  if (itens.length >= 4 && itens.every((i) => i.length < 80)) {
    return 'duas-colunas';
  }

  // Padrão editorial
  return 'conteudo';
}
