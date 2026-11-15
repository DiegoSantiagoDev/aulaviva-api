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

  // Estado vazio
  if (imagens.length === 0) {
    return (
      <div className="av-estado av-estado-vazio">
        <div className="av-estado-icone">
          <ImageIcon className="w-6 h-6" aria-hidden="true" />
        </div>
        <h3 className="av-estado-titulo">Nenhuma foto do quadro anexada</h3>
        <p className="av-estado-texto">
          O professor não incluiu fotografias da lousa nesta aula. O estudo pode ser feito diretamente
          pelos slides e pelo resumo.
        </p>
      </div>
    );
  }

  const imagemAtual = indiceSelecionado !== null ? imagens[indiceSelecionado] : null;
  const imagemAtualFalhou = imagemAtual ? imagensComFalha.has(imagemAtual.id) : false;

  return (
    <div className="av-fotos">
      <div className="av-fotos-cab">
        <h3 className="av-fotos-titulo">
          <span>Fotos do quadro</span>
          <span className="av-pill">
            {imagens.length} {imagens.length === 1 ? 'registro' : 'registros'}
          </span>
        </h3>
        <p className="av-fotos-dica">Selecione uma foto para ampliar</p>
      </div>

      {/* Grade de imagens */}
      <div className="av-fotos-grade">
        {imagens.map((img, i) => {
          const falhou = imagensComFalha.has(img.id);
          return (
            <div
              key={img.id}
              className="av-foto"
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
            >
              <div className="av-foto-moldura">
                {falhou ? (
                  <div className="av-foto-falha">
                    <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                    <span>Imagem indisponível</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={img.url}
                      alt={`Foto do quadro da aula "${tituloAula}" - registro ${i + 1}`}
                      loading="lazy"
                      onError={() => marcarFalha(img.id)}
                    />
                    <span className="av-foto-ampliar" aria-hidden="true">
                      <ZoomIn className="w-4 h-4" />
                      <span>Ampliar</span>
                    </span>
                  </>
                )}
              </div>
              <div className="av-foto-legenda">
                <span className="av-foto-nome" title={img.originalName}>
                  {img.originalName}
                </span>
                <span className="av-foto-num">#{i + 1}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualizador modal nativo com <dialog> */}
      <dialog
        ref={dialogRef}
        onClose={fecharVisualizador}
        aria-label="Visualizador de fotos do quadro"
        className="av-foto-dialogo"
      >
        {imagemAtual && (
          <div className="av-foto-dialogo-corpo">
            {/* Barra superior */}
            <div className="av-foto-topo">
              <div className="av-foto-info">
                <strong>
                  Foto {indiceSelecionado! + 1} de {imagens.length}
                </strong>
                <span title={imagemAtual.originalName}>{imagemAtual.originalName}</span>
              </div>
              <button
                ref={fecharRef}
                type="button"
                onClick={fecharVisualizador}
                className="av-foto-fechar"
                aria-label="Fechar visualizador"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Imagem ampliada */}
            <div className="av-foto-palco">
              {imagemAtualFalhou ? (
                <div className="av-foto-palco-erro" role="alert">
                  <AlertTriangle className="w-8 h-8" aria-hidden="true" />
                  <span>Não foi possível carregar esta imagem.</span>
                </div>
              ) : (
                <img
                  key={imagemAtual.id}
                  src={imagemAtual.url}
                  alt={imagemAtual.originalName}
                  onError={() => marcarFalha(imagemAtual.id)}
                />
              )}

              {imagens.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={navegarAnterior}
                    className="av-foto-nav av-foto-nav-ant"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-6 h-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={navegarProximo}
                    className="av-foto-nav av-foto-nav-prox"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-6 h-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            {/* Rodapé (some em telas de toque) */}
            <p className="av-foto-dica-teclado">
              Use as setas ← → do teclado para navegar ou Esc para fechar
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}
