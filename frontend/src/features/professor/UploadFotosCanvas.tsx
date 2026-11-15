import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { api } from '../../api/cliente';
import { ImageResponse } from '../../api/tipos';
import { comprimirImagem, formatarTamanho } from '../../lib/imagemCompressao';
import { AlertCircle, CheckCircle2, ImageIcon, ImageOff, Loader2, RefreshCw, Camera } from 'lucide-react';

interface UploadFotosCanvasProps {
  aulaId: number;
  /** Fotos que a aula já tem no servidor. */
  jaEnviadas: ImageResponse[];
  /** Chamado quando pelo menos uma foto foi aceita pelo servidor. */
  onEnviadas: () => void;
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

function MiniaturaEnviada({ foto }: { foto: ImageResponse }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <li className="av-prof-mini" title={foto.originalName}>
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

export default function UploadFotosCanvas({ aulaId, jaEnviadas, onEnviadas }: UploadFotosCanvasProps) {
  const idBase = useId();
  const [itens, setItens] = useState<ItemFoto[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const proximaChave = useRef(1);
  const ativoRef = useRef(true);

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

  const aoEscolher = (e: ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (arquivos.length === 0) return;

    const novos: ItemFoto[] = arquivos.map((arquivo) => ({
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

  const total = itens.length;
  const enviadas = itens.filter((i) => i.estado === 'enviada').length;
  const comFalha = itens.filter((i) => i.estado === 'erro').length;
  const terminou = total > 0 && !ocupado;
  const idEntrada = `${idBase}-fotos`;

  return (
    <section className="av-prof-bloco" aria-labelledby={`${idBase}-h`}>
      <h3 className="av-prof-h3" id={`${idBase}-h`}>Fotos do quadro</h3>
      <p className="av-prof-ajuda">
        Opcional. Cada foto é reduzida no seu aparelho antes do envio (até 2000 px, abaixo de 3 MB).
      </p>

      <label htmlFor={idEntrada} className={`av-btn av-btn-contorno av-prof-acao ${ocupado ? 'av-prof-zona-off' : ''}`}>
        <Camera className="w-4 h-4" aria-hidden="true" />
        <span>{ocupado ? 'Enviando fotos…' : 'Escolher fotos'}</span>
        <input
          id={idEntrada}
          type="file"
          accept="image/*"
          multiple
          className="av-prof-arquivo"
          onChange={aoEscolher}
          disabled={ocupado}
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
              <MiniaturaEnviada key={foto.id} foto={foto} />
            ))}
          </ul>
        </div>
      ) : (
        total === 0 && <p className="av-prof-vazio-linha">Nenhuma foto enviada ainda.</p>
      )}
    </section>
  );
}
