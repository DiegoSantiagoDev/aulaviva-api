import { useState, useEffect, useRef } from 'react';
import { ImageResponse } from '../../api/tipos';
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn, AlertTriangle } from 'lucide-react';

interface AbaFotosProps {
  imagens: ImageResponse[];
  tituloAula: string;
}

export default function AbaFotos({ imagens, tituloAula }: AbaFotosProps) {
  const [indiceSelecionado, setIndiceSelecionado] = useState<number | null>(null);
  const [imagensComFalha, setImagensComFalha] = useState<Set<number>>(new Set());
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const fecharRef = useRef<HTMLButtonElement | null>(null);

  const abrirVisualizador = (index: number) => {
    setIndiceSelecionado(index);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
      requestAnimationFrame(() => fecharRef.current?.focus());
    }
  };

  const fecharVisualizador = () => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
    setIndiceSelecionado(null);
  };

  const navegarAnterior = () => {
    if (indiceSelecionado !== null) {
      setIndiceSelecionado((prev) => (prev! > 0 ? prev! - 1 : imagens.length - 1));
    }
  };

  const navegarProximo = () => {
    if (indiceSelecionado !== null) {
      setIndiceSelecionado((prev) => (prev! < imagens.length - 1 ? prev! + 1 : 0));
    }
  };

  const marcarFalha = (id: number) => {
    setImagensComFalha((prev) => new Set(prev).add(id));
  };

  useEffect(() => {
    if (indiceSelecionado === null) return;

    const tratarTeclado = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIndiceSelecionado((prev) =>
          prev === null ? null : prev > 0 ? prev - 1 : imagens.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIndiceSelecionado((prev) =>
          prev === null ? null : prev < imagens.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'Escape') {
        if (dialogRef.current?.open) dialogRef.current.close();
        setIndiceSelecionado(null);
      }
    };

    window.addEventListener('keydown', tratarTeclado);
    return () => window.removeEventListener('keydown', tratarTeclado);
  }, [indiceSelecionado, imagens.length]);

  if (imagens.length === 0) {
    return (
      <div className="art-frame rounded-2xl p-12 text-center border border-gold/30 anim-fade-up">
        <ImageIcon className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-display text-2xl font-bold text-ink">Nenhuma foto do quadro anexada</h3>
        <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
          O professor não incluiu fotografias da lousa nesta aula. O estudo pode ser feito diretamente pelos slides e pelo resumo.
        </p>
      </div>
    );
  }

  const imagemAtual = indiceSelecionado !== null ? imagens[indiceSelecionado] : null;

  return (
    <div className="space-y-6 anim-fade-up">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <span>Fotos do Quadro</span>
          <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-gold/15 text-terra-deep font-semibold">
            {imagens.length} {imagens.length === 1 ? 'registro' : 'registros'}
          </span>
        </h3>
        <span className="text-xs text-ink-soft hidden sm:inline">
          Clique para ampliar com zoom e navegar em tela cheia
        </span>
      </div>

      {/* Grade de Imagens */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {imagens.map((img, i) => {
          const falhou = imagensComFalha.has(img.id);
          return (
            <div
              key={img.id}
              role={falhou ? undefined : 'button'}
              tabIndex={falhou ? undefined : 0}
              aria-label={
                falhou
                  ? `Imagem ${i + 1} indisponível`
                  : `Ampliar foto ${i + 1}: ${img.originalName}`
              }
              aria-disabled={falhou || undefined}
              onClick={() => !falhou && abrirVisualizador(i)}
              onKeyDown={(e) => {
                if (falhou) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  abrirVisualizador(i);
                }
              }}
              className={`art-frame rounded-2xl overflow-hidden border border-gold/30 transition-all duration-300 group ${
                falhou
                  ? 'opacity-70 cursor-not-allowed'
                  : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-terra-deep'
              }`}
            >
              <div className="aspect-[4/3] bg-ink/5 relative flex items-center justify-center overflow-hidden">
                {falhou ? (
                  <div className="p-4 text-center text-xs text-ink-soft space-y-2">
                    <AlertTriangle className="w-6 h-6 text-terra mx-auto" />
                    <span>Imagem indisponível</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={img.url}
                      alt={`Foto do quadro da aula "${tituloAula}" - registro ${i + 1}`}
                      loading="lazy"
                      onError={() => marcarFalha(img.id)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-parchment">
                      <span className="p-2.5 rounded-full bg-ink/80 text-gold shadow-lg flex items-center gap-1.5 text-xs font-medium">
                        <ZoomIn className="w-4 h-4" />
                        <span>Ampliar</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-3 text-xs text-ink-soft flex items-center justify-between bg-parchment/70">
                <span className="truncate max-w-[180px] font-medium" title={img.originalName}>
                  {img.originalName}
                </span>
                <span className="text-[11px] text-gold font-bold">#{i + 1}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizador Modal nativo com <dialog> */}
      <dialog
        ref={dialogRef}
        onClose={fecharVisualizador}
        aria-label="Visualizador de fotos do quadro"
        className="backdrop:bg-ink/85 backdrop:backdrop-blur-sm p-0 rounded-2xl bg-parchment border border-gold/40 shadow-2xl max-w-4xl w-[92vw] overflow-hidden focus:outline-none"
      >
        {imagemAtual && (
          <div className="flex flex-col max-h-[88vh]">
            {/* Barra de controle superior */}
            <div className="p-4 border-b border-gold/25 flex items-center justify-between bg-parchment text-ink">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-gold font-bold">
                  Foto {indiceSelecionado! + 1} de {imagens.length}
                </span>
                <span className="text-xs text-ink-soft truncate max-w-xs">
                  &middot; {imagemAtual.originalName}
                </span>
              </div>
              <button
                ref={fecharRef}
                onClick={fecharVisualizador}
                className="p-1.5 rounded-full hover:bg-gold/20 text-ink transition-colors"
                aria-label="Fechar visualizador"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem ampliada */}
            <div className="relative flex-1 bg-ink/95 flex items-center justify-center p-2 sm:p-4 min-h-[300px] overflow-hidden">
              <img
                src={imagemAtual.url}
                alt={imagemAtual.originalName}
                className="max-h-[68vh] max-w-full object-contain rounded-lg"
              />

              {/* Botões de navegação lateral */}
              {imagens.length > 1 && (
                <>
                  <button
                    onClick={navegarAnterior}
                    className="absolute left-4 p-3 rounded-full bg-ink/70 hover:bg-gold hover:text-ink text-parchment border border-gold/40 transition-colors shadow-lg"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={navegarProximo}
                    className="absolute right-4 p-3 rounded-full bg-ink/70 hover:bg-gold hover:text-ink text-parchment border border-gold/40 transition-colors shadow-lg"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Rodapé do modal */}
            <div className="p-3 bg-parchment border-t border-gold/20 text-center text-xs text-ink-soft">
              Use as setas ← → do teclado para navegar ou Esc para fechar
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
