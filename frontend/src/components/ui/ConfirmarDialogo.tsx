import { useEffect, useId, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ConfirmarDialogoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  rotuloOcupado?: string;
  ocupado?: boolean;
  erro?: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Diálogo de confirmação para ações destrutivas. Usa <dialog> nativo:
 * foco preso, Esc fecha e leitores de tela anunciam como modal.
 */
export default function ConfirmarDialogo({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloOcupado = 'Excluindo…',
  ocupado = false,
  erro,
  onConfirmar,
  onCancelar,
}: ConfirmarDialogoProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idDescricao = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className="av-dialogo"
      aria-labelledby={idTitulo}
      aria-describedby={idDescricao}
      onCancel={(e) => {
        e.preventDefault();
        if (!ocupado) onCancelar();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !ocupado) onCancelar();
      }}
    >
      <div className="av-dialogo-corpo">
        <h2 id={idTitulo} className="av-dialogo-titulo">
          {titulo}
        </h2>
        <p id={idDescricao} className="av-dialogo-texto">
          {descricao}
        </p>
        {erro && (
          <p className="av-campo-erro" role="alert">
            {erro}
          </p>
        )}
        <div className="av-dialogo-acoes">
          <button type="button" className="av-btn av-btn-contorno" onClick={onCancelar} disabled={ocupado}>
            Cancelar
          </button>
          <button type="button" className="av-btn av-btn-erro" onClick={onConfirmar} disabled={ocupado}>
            {ocupado && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            <span>{ocupado ? rotuloOcupado : rotuloConfirmar}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
