import { useId, useState, type ChangeEvent, type DragEvent } from 'react';
import { api } from '../../api/cliente.ts';
import { formatarTamanho } from '../../lib/imagemCompressao.ts';
import { AlertCircle, CheckCircle2, FileAudio, Loader2, UploadCloud } from 'lucide-react';

import { EXTENSOES_AUDIO, LIMITE_AUDIO_BYTES } from '../../config/limites.ts';

interface UploadAudioProgressoProps {
  aulaId: number;
  /** Bloqueia o envio (por exemplo, enquanto a aula está em processamento). */
  bloqueado?: boolean;
  motivoBloqueio?: string;
  /** Chamado depois de um envio aceito (ou de um 409): o painel atualiza o acompanhamento. */
  onEnviado: () => void;
}

type Fase = 'parado' | 'enviando' | 'sucesso' | 'erro';

function validarArquivo(arquivo: File): string | null {
  const ext = arquivo.name.split('.').pop()?.toLowerCase() ?? '';
  if (!(EXTENSOES_AUDIO as readonly string[]).includes(ext)) {
    return `Formato não aceito. Use ${EXTENSOES_AUDIO.map((e) => e.toUpperCase()).join(', ')}.`;
  }
  if (arquivo.size === 0) return 'O arquivo está vazio.';
  if (arquivo.size > LIMITE_AUDIO_BYTES) {
    return `O arquivo tem ${formatarTamanho(arquivo.size)}. O limite é ${formatarTamanho(LIMITE_AUDIO_BYTES)}.`;
  }
  return null;
}

export default function UploadAudioProgresso({
  aulaId,
  bloqueado = false,
  motivoBloqueio,
  onEnviado,
}: UploadAudioProgressoProps) {
  const idBase = useId();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [fase, setFase] = useState<Fase>('parado');
  const [progresso, setProgresso] = useState(0);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);

  const enviando = fase === 'enviando';
  const desabilitado = bloqueado || enviando;

  const escolher = (novo: File | null) => {
    setProgresso(0);
    if (!novo) {
      setArquivo(null);
      setFase('parado');
      setMensagem(null);
      return;
    }
    const problema = validarArquivo(novo);
    if (problema) {
      setArquivo(null);
      setFase('erro');
      setMensagem(problema);
      return;
    }
    setArquivo(novo);
    setFase('parado');
    setMensagem(null);
  };

  const aoEscolher = (e: ChangeEvent<HTMLInputElement>) => {
    escolher(e.target.files?.[0] ?? null);
    e.target.value = '';
  };

  const aoSoltar = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setArrastando(false);
    if (desabilitado) return;
    escolher(e.dataTransfer.files?.[0] ?? null);
  };

  const enviar = async () => {
    if (!arquivo || desabilitado) return;
    setFase('enviando');
    setProgresso(0);
    setMensagem(null);
    try {
      await api.enviarAudio(aulaId, arquivo, setProgresso);
      setProgresso(100);
      setFase('sucesso');
      setMensagem('Áudio enviado. A aula entrou em processamento.');
      setArquivo(null);
      onEnviado();
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'status' in err ? Number((err as { status: number }).status) : 0;
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Não foi possível enviar o áudio.';
      setFase('erro');
      setMensagem(
        status === 409
          ? `${msg} Quando o processamento terminar, você poderá enviar outro áudio.`
          : msg
      );
      // Em 409 o estado da aula mudou no servidor: atualiza o acompanhamento.
      if (status === 409) onEnviado();
    }
  };

  const idZona = `${idBase}-zona`;

  return (
    <section className="av-prof-bloco" aria-labelledby={`${idBase}-h`}>
      <h3 className="av-prof-h3" id={`${idBase}-h`}>Áudio da aula</h3>
      <p className="av-prof-ajuda">
        Até {formatarTamanho(LIMITE_AUDIO_BYTES)}. Aceita {EXTENSOES_AUDIO.map((e) => e.toUpperCase()).join(', ')}.
      </p>

      {bloqueado && motivoBloqueio && <p className="av-prof-aviso av-prof-aviso-neutro">{motivoBloqueio}</p>}

      <label
        htmlFor={idZona}
        className={`av-prof-zona ${arrastando ? 'av-prof-zona-ativa' : ''} ${desabilitado ? 'av-prof-zona-off' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!desabilitado) setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
      >
        <input
          id={idZona}
          type="file"
          accept=".mp3,.wav,.m4a,.ogg,.webm"
          className="av-prof-arquivo"
          onChange={aoEscolher}
          disabled={desabilitado}
        />
        {arquivo ? <FileAudio className="w-6 h-6" aria-hidden="true" /> : <UploadCloud className="w-6 h-6" aria-hidden="true" />}
        {arquivo ? (
          <span className="av-prof-zona-texto">
            <strong>{arquivo.name}</strong>
            <span>{formatarTamanho(arquivo.size)}. Toque para trocar o arquivo.</span>
          </span>
        ) : (
          <span className="av-prof-zona-texto">
            <strong>Escolher o arquivo de áudio</strong>
            <span>ou arraste e solte aqui</span>
          </span>
        )}
      </label>

      {enviando && (
        <div className="av-prof-progresso">
          <div
            className="av-prof-barra"
            role="progressbar"
            aria-label="Progresso do envio do áudio"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progresso}
          >
            <span className="av-prof-barra-cheia" style={{ width: `${progresso}%` }} />
          </div>
          <p className="av-prof-progresso-texto">
            {progresso < 100 ? `Enviando… ${progresso}%` : 'Finalizando o envio…'} Mantenha esta página aberta.
          </p>
        </div>
      )}

      {fase === 'erro' && mensagem && (
        <p className="av-prof-aviso av-prof-aviso-erro" role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{mensagem}</span>
        </p>
      )}
      {fase === 'sucesso' && mensagem && (
        <p className="av-prof-aviso av-prof-aviso-ok" role="status">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>{mensagem}</span>
        </p>
      )}

      <button
        type="button"
        className="av-btn av-btn-primario av-prof-acao"
        onClick={enviar}
        disabled={!arquivo || desabilitado}
      >
        {enviando ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
        )}
        <span>{enviando ? 'Enviando áudio…' : 'Enviar áudio'}</span>
      </button>
    </section>
  );
}
