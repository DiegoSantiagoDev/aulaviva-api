/**
 * Redutor de imagem em canvas, usado antes de enviar fotos do quadro.
 *
 * Regras (PLANO.md, fase 8): maior lado de 2000 px, JPEG com qualidade 0,85
 * e arquivo final abaixo de 3 MB. Se a foto já é JPEG e já cabe nesses
 * limites, ela segue sem ser recodificada (evita perda de qualidade).
 */
export const LADO_MAXIMO_PX = 2000;
export const QUALIDADE_JPEG = 0.85;
export const ALVO_BYTES = 3 * 1024 * 1024;

const QUALIDADE_MINIMA = 0.5;
const PASSO_QUALIDADE = 0.1;
const FATOR_REDUCAO = 0.85;
const MAX_TENTATIVAS_REDUCAO = 6;

interface ImagemDecodificada {
  fonte: CanvasImageSource;
  largura: number;
  altura: number;
  liberar: () => void;
}

async function decodificar(arquivo: File): Promise<ImagemDecodificada> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
      return {
        fonte: bitmap,
        largura: bitmap.width,
        altura: bitmap.height,
        liberar: () => bitmap.close(),
      };
    } catch {
      // Cai para o carregamento por <img> abaixo.
    }
  }

  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Formato de imagem não reconhecido.'));
      el.src = url;
    });
    return {
      fonte: img,
      largura: img.naturalWidth,
      altura: img.naturalHeight,
      liberar: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

function paraBlobJpeg(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível gerar a imagem reduzida.'))),
      'image/jpeg',
      qualidade
    );
  });
}

function nomeComoJpg(nome: string): string {
  const base = nome.replace(/\.[^./\\]+$/, '') || 'foto';
  return `${base}.jpg`;
}

/** Devolve a foto pronta para envio (a original, se já estiver dentro dos limites). */
export async function comprimirImagem(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith('image/')) {
    throw new Error('Este arquivo não é uma imagem.');
  }

  const imagem = await decodificar(arquivo);
  try {
    const { largura, altura } = imagem;
    if (!largura || !altura) throw new Error('Não foi possível ler as dimensões da imagem.');

    const maiorLado = Math.max(largura, altura);
    const jaCabe =
      arquivo.type === 'image/jpeg' && maiorLado <= LADO_MAXIMO_PX && arquivo.size <= ALVO_BYTES;
    if (jaCabe) return arquivo;

    let escala = Math.min(1, LADO_MAXIMO_PX / maiorLado);
    let qualidade = QUALIDADE_JPEG;
    let blob: Blob | null = null;

    for (let tentativa = 0; tentativa <= MAX_TENTATIVAS_REDUCAO; tentativa += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(largura * escala));
      canvas.height = Math.max(1, Math.round(altura * escala));

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('O navegador não conseguiu preparar a imagem.');
      // JPEG não tem transparência: fundo branco evita áreas pretas em PNG.
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imagem.fonte, 0, 0, canvas.width, canvas.height);

      blob = await paraBlobJpeg(canvas, qualidade);
      if (blob.size <= ALVO_BYTES) break;

      // Ainda grande: baixa a qualidade até o mínimo e depois reduz as dimensões.
      if (qualidade - PASSO_QUALIDADE >= QUALIDADE_MINIMA) {
        qualidade = Math.round((qualidade - PASSO_QUALIDADE) * 100) / 100;
      } else {
        escala *= FATOR_REDUCAO;
      }
    }

    if (!blob) throw new Error('Não foi possível gerar a imagem reduzida.');
    return new File([blob], nomeComoJpg(arquivo.name), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } finally {
    imagem.liberar();
  }
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
