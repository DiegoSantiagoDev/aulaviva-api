import { SlideItem, SlideLayout } from '../../api/tipos';
import { resolverLayout } from './heuristicaLayout';

/** Máximo de itens visíveis por slide (seção 7.5 do prompt). */
export const MAX_ITENS_POR_SLIDE = 6;

export interface SlideDerivado extends SlideItem {
  /** Layout final já resolvido pela heurística. */
  layoutResolvido: SlideLayout;
  /** Índice do slide original que originou este slide. */
  indiceOriginal: number;
  /** Preenchido quando o slide é uma continuação de outro. */
  continuacao?: { parte: number; total: number };
}

/**
 * Deriva o deck exibido a partir da apresentação bruta.
 *
 * Slides com mais de 6 itens são divididos em slides de continuação,
 * preservando a ordem e o sentido didático do conteúdo. O layout é
 * resolvido uma única vez, sobre o slide original, para que as partes
 * mantenham a mesma composição visual.
 */
export function derivarSlides(slides: SlideItem[]): SlideDerivado[] {
  const derivados: SlideDerivado[] = [];

  slides.forEach((slide, indice) => {
    const layout = resolverLayout(slide, indice, slides.length);
    const itens = Array.isArray(slide.content)
      ? slide.content.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [];

    const precisaDividir = layout !== 'capa' && itens.length > MAX_ITENS_POR_SLIDE;

    if (!precisaDividir) {
      derivados.push({
        ...slide,
        content: itens,
        layoutResolvido: layout,
        indiceOriginal: indice,
      });
      return;
    }

    const totalPartes = Math.ceil(itens.length / MAX_ITENS_POR_SLIDE);

    for (let parte = 0; parte < totalPartes; parte++) {
      const inicio = parte * MAX_ITENS_POR_SLIDE;
      const fatia = itens.slice(inicio, inicio + MAX_ITENS_POR_SLIDE);

      // A partir da segunda parte, "definição" vira "conteúdo": a frase de
      // destaque já apareceu na primeira parte e não deve ser repetida.
      const layoutParte: SlideLayout =
        parte === 0 ? layout : layout === 'definicao' ? 'conteudo' : layout;

      derivados.push({
        ...slide,
        title:
          parte === 0
            ? slide.title
            : `${slide.title} — parte ${parte + 1} de ${totalPartes}`,
        content: fatia,
        layoutResolvido: layoutParte,
        indiceOriginal: indice,
        continuacao: { parte: parte + 1, total: totalPartes },
      });
    }
  });

  return derivados;
}
