/**
 * Analisador tolerante de resumo didático da IA.
 * Converte o texto bruto do campo summary em estrutura de dados React pura.
 * PROIBIDO O USO DE dangerouslySetInnerHTML.
 */

export interface SecaoResumo {
  id: string;
  titulo: string;
  itensLista: string[];
  paragrafos: string[];
}

export interface ResumoEstruturado {
  secoes: SecaoResumo[];
  temSecoes: boolean;
  paragrafosGerais: string[];
}

function limparMarkdownResidual(linha: string): string {
  return linha
    .replace(/^\s*[#]+\s*/, '') // Remove marcadores # no início
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove negrito **
    .replace(/__(.*?)__/g, '$1') // Remove negrito __
    .trim();
}

function eTituloSecao(linha: string): boolean {
  // Tira espaços e símbolos das pontas
  const limpa = linha.replace(/^[\s#*:-]+/, '').replace(/[\s#*:-]+$/, '').trim();

  // Uma linha é título de seção se tiver 3 ou mais letras, todas maiúsculas, e no máximo 60 caracteres
  const apenasLetras = limpa.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
  if (apenasLetras.length < 3 || limpa.length > 60) {
    return false;
  }

  // Verifica se todas as letras são maiúsculas
  return apenasLetras === apenasLetras.toUpperCase();
}

export function analisarResumo(textoBruto: string | null | undefined): ResumoEstruturado {
  if (!textoBruto || !textoBruto.trim()) {
    return { secoes: [], temSecoes: false, paragrafosGerais: [] };
  }

  // 1. Normalizar quebras de linha
  let texto = textoBruto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Defesa extra: Remover blocos entre <think> e </think>
  texto = texto.replace(/<think>[\s\S]*?<\/think>/gi, '');

  const linhas = texto.split('\n');
  const secoes: SecaoResumo[] = [];
  const paragrafosGerais: string[] = [];

  let secaoAtual: SecaoResumo | null = null;
  let contadorSecao = 1;

  for (let i = 0; i < linhas.length; i++) {
    const linhaOriginal = linhas[i];
    const linhaTrim = linhaOriginal.trim();

    if (!linhaTrim) {
      continue;
    }

    // 3. Verificação de título de seção
    if (eTituloSecao(linhaTrim)) {
      const tituloLimpo = linhaTrim
        .replace(/^[\s#*:-]+/, '')
        .replace(/[\s#*:-]+$/, '')
        .trim();

      const id = `secao-${contadorSecao++}-${tituloLimpo
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')}`;

      secaoAtual = {
        id,
        titulo: tituloLimpo,
        itensLista: [],
        paragrafos: [],
      };
      secoes.push(secaoAtual);
      continue;
    }

    // 4. Verificação de item de lista (-, •, * ou número seguido de ponto/parêntese)
    const matchLista = linhaTrim.match(/^([-•*]|\d+[.)])\s+(.+)$/);
    if (matchLista) {
      const conteudoItem = limparMarkdownResidual(matchLista[2]);
      if (secaoAtual) {
        secaoAtual.itensLista.push(conteudoItem);
      } else {
        // Se ainda não houver seção, agrupa como item geral
        paragrafosGerais.push(`• ${conteudoItem}`);
      }
      continue;
    }

    // 5. Linha de texto comum / parágrafo
    const conteudoParagrafo = limparMarkdownResidual(linhaTrim);
    if (conteudoParagrafo) {
      if (secaoAtual) {
        secaoAtual.paragrafos.push(conteudoParagrafo);
      } else {
        paragrafosGerais.push(conteudoParagrafo);
      }
    }
  }

  return {
    secoes,
    temSecoes: secoes.length > 0,
    paragrafosGerais,
  };
}
