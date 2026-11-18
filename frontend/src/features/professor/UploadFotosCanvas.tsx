import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { api } from '../../api/cliente.ts';
import { ApiError, ImageResponse } from '../../api/tipos.ts';
import ConfirmarDialogo from '../../components/ui/ConfirmarDialogo.tsx';
import { MAX_FOTOS_POR_AULA } from '../../config/limites.ts';
import { comprimirImagem, formatarTamanho } from '../../lib/imagemCompressao.ts';
import { AlertCircle, CheckCircle2, ImageIcon, ImageOff, Loader2, RefreshCw, Camera, Trash2 } from 'lucide-react';

interface UploadFotosCanvasProps {
  aulaId: number;
  /** Fotos que a aula já tem no servidor. */
  jaEnviadas: ImageResponse[];
  /** Chamado quando pelo menos uma foto foi aceita pelo servidor. */
  onEnviadas: () => void;
  /** Chamado depois que uma foto foi excluída no servidor. */
  onExcluida: () => void;
  /** O backend recusa envio e exclusão de fotos enquanto a aula processa (HTTP 409). */
  bloqueado?: boolean;
}

type EstadoFoto = 'aguardando' | 'comprimindo' | 'enviando' | 'enviada' | 'erro';

interface ItemFoto {
  chave: number;
  arquivo: File;
  estado: EstadoFoto;
  mensagem?: string;
  tamanhoFinal?: number;
}

const ROTULO_ESTADO: Record<EstadoFoto, string> = {
  aguardando: 'Na fila',
  comprimindo: 'Reduzindo a imagem…',
  enviando: 'Enviando…',
  enviada: 'Enviada',
  erro: 'Falhou',
};

function MiniaturaEnviada({
  foto,
  podeExcluir,
  onExcluir,
}: {
  foto: ImageResponse;
  podeExcluir: boolean;
  onExcluir: (foto: ImageResponse) => void;
}) {
  const [falhou, setFalhou] = useState(false);
  return (
    <li className="av-prof-mini" title={foto.originalName}>
      <button
        type="button"
        className="av-prof-mini-excluir"
        onClick={() => onExcluir(foto)}
        disabled={!podeExcluir}
        aria-label={`Excluir a foto ${foto.originalName}`}
        title={podeExcluir ? 'Excluir foto' : 'Aguarde o fim do processamento para excluir'}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {falhou ? (
        <span className="av-prof-mini-falha">
          <ImageOff className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Imagem indisponível: {foto.originalName}</span>
        </span>
      ) : (
        <img src={foto.url} alt={foto.originalName} loading="lazy" onError={() => setFalhou(true)} />
      )}
    </li>
  );
}

export default function UploadFotosCanvas({ aulaId, jaEnviadas, onEnviadas, onExcluida, bloqueado = false }: UploadFotosCanvasProps) {
  const idBase = useId();
  const [itens, setItens] = useState<ItemFoto[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const proximaChave = useRef(1);
  const ativoRef = useRef(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aExcluir, setAExcluir] = useState<ImageResponse | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);

  useEffect(() => {
    ativoRef.current = true;
    return () => {
      ativoRef.current = false;
    };
  }, []);

  const atualizar = (chave: number, mudanca: Partial<ItemFoto>) =>
    setItens((lista) => lista.map((i) => (i.chave === chave ? { ...i, ...mudanca } : i)));

  /** Reduz e envia uma foto por vez, para não travar celulares modestos nem a rede local. */
  const processar = async (fila: ItemFoto[]) => {
    setOcupado(true);
    let algumaEnviada = false;

    for (const item of fila) {
      if (!ativoRef.current) break;
      try {
        atualizar(item.chave, { estado: 'comprimindo', mensagem: undefined });
        const pronta = await comprimirImagem(item.arquivo);
        if (!ativoRef.current) break;
        atualizar(item.chave, { estado: 'enviando', tamanhoFinal: pronta.size });
        await api.enviarImagem(aulaId, pronta);
        algumaEnviada = true;
        if (ativoRef.current) atualizar(item.chave, { estado: 'enviada' });
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Não foi possível enviar esta foto.';
        if (ativoRef.current) atualizar(item.chave, { estado: 'erro', mensagem: msg });
      }
    }

    if (ativoRef.current) setOcupado(false);
    if (algumaEnviada) onEnviadas();
  };

  const confirmarExclusao = async () => {
    if (!aExcluir) return;
    setExcluindo(true);
    setErroExcluir(null);
    try {
      await api.excluirImagem(aulaId, aExcluir.id);
      setAExcluir(null);
      onExcluida();
    } catch (err) {
      setErroExcluir((err as ApiError).message);
    } finally {
      if (ativoRef.current) setExcluindo(false);
    }
  };

  const aoEscolher = (e: ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (arquivos.length === 0 || bloqueado || restante === 0) return;

    // O backend aceita no máximo MAX_FOTOS_POR_AULA por aula; só enviamos o que cabe.
    const aceitos = arquivos.slice(0, restante);
    setAviso(
      aceitos.length < arquivos.length
        ? `Só cabem mais ${restante} ${restante === 1 ? 'foto' : 'fotos'} nesta aula (limite de ${MAX_FOTOS_POR_AULA}). As demais foram ignoradas.`
        : null
    );

    const novos: ItemFoto[] = aceitos.map((arquivo) => ({
      chave: proximaChave.current++,
      arquivo,
      estado: 'aguardando',
    }));
    setItens((lista) => [...lista, ...novos]);
    void processar(novos);
  };

  const tentarDeNovo = () => {
    const falhas = itens.filter((i) => i.estado === 'erro');
    if (falhas.length === 0) return;
    setItens((lista) =>
      lista.map((i) => (i.estado === 'erro' ? { ...i, estado: 'aguardando', mensagem: undefined } : i))
    );
    void processar(falhas.map((i) => ({ ...i, estado: 'aguardando' as const })));
  };

  const limparConcluidas = () => setItens((lista) => lista.filter((i) => i.estado !== 'enviada'));

  const emAndamento = itens.filter((i) => i.estado === 'aguardando' || i.estado === 'comprimindo' || i.estado === 'enviando').length;
  const restante = Math.max(0, MAX_FOTOS_POR_AULA - jaEnviadas.length - emAndamento);
  const semVaga = restante === 0;
  const total = itens.length;
  const enviadas = itens.filter((i) => i.estado === 'enviada').length;
  const comFalha = itens.filter((i) => i.estado === 'erro').length;
  const terminou = total > 0 && !ocupado;
  const idEntrada = `${idBase}-fotos`;

  return (
    <section className="av-prof-bloco" aria-labelledby={`${idBase}-h`}>
      <h3 className="av-prof-h3" id={`${idBase}-h`}>Fotos do quadro</h3>
      <p className="av-prof-ajuda">
        Opcional, no máximo {MAX_FOTOS_POR_AULA} por aula ({jaEnviadas.length} de {MAX_FOTOS_POR_AULA} usadas). Cada foto é
        reduzida no seu aparelho antes do envio (até 2000 px, abaixo de 3 MB).
      </p>
      {bloqueado && (
        <p className="av-prof-aviso av-prof-aviso-erro" role="status">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>Aguarde o fim do processamento para enviar ou excluir fotos.</span>
        </p>
      )}
      {!bloqueado && semVaga && emAndamento === 0 && (
        <p className="av-prof-ajuda">Limite atingido. Exclua uma foto para enviar outra.</p>
      )}
      {aviso && (
        <p className="av-prof-aviso av-prof-aviso-erro" role="status">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}

      <label
        htmlFor={idEntrada}
        className={`av-btn av-btn-contorno av-prof-acao ${ocupado || bloqueado || semVaga ? 'av-prof-zona-off' : ''}`}
      >
        <Camera className="w-4 h-4" aria-hidden="true" />
        <span>{ocupado ? 'Enviando fotos…' : 'Escolher fotos'}</span>
        <input
          id={idEntrada}
          type="file"
          accept="image/*"
          multiple
          className="av-prof-arquivo"
          onChange={aoEscolher}
          disabled={ocupado || bloqueado || semVaga}
        />
      </label>

      {total > 0 && (
        <>
          <p className="av-prof-progresso-texto" role="status" aria-live="polite">
            {ocupado
              ? `Enviando… ${enviadas} de ${total}`
              : comFalha > 0
                ? `${enviadas} de ${total} enviadas. ${comFalha} ${comFalha === 1 ? 'falhou' : 'falharam'}.`
                : `${enviadas} de ${total} enviadas.`}
          </p>

          <ul className="av-prof-fila" role="list">
            {itens.map((item) => (
              <li key={item.chave} className={`av-prof-fila-item av-prof-fila-${item.estado}`}>
                <span className="av-prof-fila-icone" aria-hidden="true">
                  {item.estado === 'enviada' && <CheckCircle2 className="w-4 h-4" />}
                  {item.estado === 'erro' && <AlertCircle className="w-4 h-4" />}
                  {(item.estado === 'comprimindo' || item.estado === 'enviando') && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {item.estado === 'aguardando' && <ImageIcon className="w-4 h-4" />}
                </span>
                <span className="av-prof-fila-nome">
                  <strong>{item.arquivo.name}</strong>
                  <span>
                    {ROTULO_ESTADO[item.estado]}
                    {item.tamanhoFinal !== undefined
                      ? `, ${formatarTamanho(item.arquivo.size)} para ${formatarTamanho(item.tamanhoFinal)}`
                      : `, ${formatarTamanho(item.arquivo.size)}`}
                  </span>
                  {item.mensagem && <span className="av-prof-fila-msg">{item.mensagem}</span>}
                </span>
              </li>
            ))}
          </ul>

          {terminou && (
            <div className="av-prof-linha-acoes">
              {comFalha > 0 && (
                <button type="button" className="av-btn av-btn-suave" onClick={tentarDeNovo}>
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  <span>Tentar de novo as que falharam</span>
                </button>
              )}
              {enviadas > 0 && (
                <button type="button" className="av-btn av-btn-contorno" onClick={limparConcluidas}>
                  Limpar a lista
                </button>
              )}
            </div>
          )}
        </>
      )}

      {jaEnviadas.length > 0 ? (
        <div className="av-prof-enviadas">
          <p className="av-prof-sub">
            {jaEnviadas.length === 1 ? '1 foto já está na aula' : `${jaEnviadas.length} fotos já estão na aula`}
          </p>
          <ul className="av-prof-minis" role="list">
            {jaEnviadas.map((foto) => (
              <MiniaturaEnviada
                key={foto.id}
                foto={foto}
                podeExcluir={!bloqueado}
                onExcluir={(f) => {
                  setErroExcluir(null);
                  setAExcluir(f);
                }}
              />
            ))}
          </ul>
        </div>
      ) : (
        total === 0 && <p className="av-prof-vazio-linha">Nenhuma foto enviada ainda.</p>
      )}

      <ConfirmarDialogo
        aberto={aExcluir !== null}
        titulo="Excluir esta foto?"
        descricao={
          aExcluir
            ? `“${aExcluir.originalName}” será removida da aula e o arquivo será apagado do servidor. Esta ação não pode ser desfeita.`
            : ''
        }
        rotuloConfirmar="Excluir foto"
        ocupado={excluindo}
        erro={erroExcluir}
        onConfirmar={() => void confirmarExclusao()}
        onCancelar={() => setAExcluir(null)}
      />
    </section>
  );
}
