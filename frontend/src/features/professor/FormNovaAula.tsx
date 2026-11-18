import { useId, useState, type FormEvent } from 'react';
import { api } from '../../api/cliente.ts';
import { LessonResponse } from '../../api/tipos.ts';
import { AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react';

export const LIMITE_TITULO = 150;
export const LIMITE_DISCIPLINA = 80;

interface FormNovaAulaProps {
  /** Disciplinas já usadas, para sugerir no campo e evitar grafias diferentes. */
  disciplinas: string[];
  onCriada: (aula: LessonResponse) => void;
}

type CampoNome = 'titulo' | 'disciplina';

function validar(campo: CampoNome, valor: string): string | null {
  const limpo = valor.trim();
  const limite = campo === 'titulo' ? LIMITE_TITULO : LIMITE_DISCIPLINA;
  const nome = campo === 'titulo' ? 'título' : 'disciplina';
  if (!limpo) return `Informe o ${nome} da aula.`;
  if (limpo.length > limite) return `O ${nome} pode ter no máximo ${limite} caracteres.`;
  return null;
}

export default function FormNovaAula({ disciplinas, onCriada }: FormNovaAulaProps) {
  const idBase = useId();
  const idTitulo = `${idBase}-titulo`;
  const idDisciplina = `${idBase}-disciplina`;
  const idLista = `${idBase}-sugestoes`;

  const [titulo, setTitulo] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [tocados, setTocados] = useState<Record<CampoNome, boolean>>({ titulo: false, disciplina: false });
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const erroTitulo = tocados.titulo ? validar('titulo', titulo) : null;
  const erroDisciplina = tocados.disciplina ? validar('disciplina', disciplina) : null;

  const marcar = (campo: CampoNome) => setTocados((t) => ({ ...t, [campo]: true }));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setSucesso(null);
    setErroEnvio(null);
    setTocados({ titulo: true, disciplina: true });
    if (validar('titulo', titulo) || validar('disciplina', disciplina)) return;

    setEnviando(true);
    try {
      const aula = await api.criarAula({ title: titulo.trim(), subject: disciplina.trim() });
      setSucesso(`Aula “${aula.title}” criada. Agora envie o áudio dela.`);
      setTitulo('');
      setDisciplina('');
      setTocados({ titulo: false, disciplina: false });
      onCriada(aula);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Não foi possível criar a aula.';
      setErroEnvio(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="av-prof-cartao" onSubmit={enviar} noValidate aria-labelledby={`${idBase}-h`}>
      <h2 className="av-prof-h2" id={`${idBase}-h`}>Nova aula</h2>
      <p className="av-prof-ajuda">Dê um título e escolha a disciplina. O áudio e as fotos vêm depois.</p>

      <div className="av-prof-campo">
        <div className="av-prof-campo-topo">
          <label htmlFor={idTitulo}>Título da aula</label>
          <span
            className={`av-prof-contador ${titulo.length >= LIMITE_TITULO * 0.9 ? 'av-prof-contador-cheio' : ''}`}
            aria-hidden="true"
          >
            {titulo.length}/{LIMITE_TITULO}
          </span>
        </div>
        <input
          id={idTitulo}
          type="text"
          className="av-prof-input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={() => marcar('titulo')}
          maxLength={LIMITE_TITULO}
          autoComplete="off"
          placeholder="Ex.: Função do 1º grau"
          aria-invalid={erroTitulo ? true : undefined}
          aria-describedby={erroTitulo ? `${idTitulo}-erro` : undefined}
          disabled={enviando}
        />
        {erroTitulo && (
          <p className="av-prof-erro-campo" id={`${idTitulo}-erro`}>
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {erroTitulo}
          </p>
        )}
      </div>

      <div className="av-prof-campo">
        <div className="av-prof-campo-topo">
          <label htmlFor={idDisciplina}>Disciplina</label>
          <span
            className={`av-prof-contador ${disciplina.length >= LIMITE_DISCIPLINA * 0.9 ? 'av-prof-contador-cheio' : ''}`}
            aria-hidden="true"
          >
            {disciplina.length}/{LIMITE_DISCIPLINA}
          </span>
        </div>
        <input
          id={idDisciplina}
          type="text"
          className="av-prof-input"
          value={disciplina}
          onChange={(e) => setDisciplina(e.target.value)}
          onBlur={() => marcar('disciplina')}
          maxLength={LIMITE_DISCIPLINA}
          autoComplete="off"
          list={disciplinas.length > 0 ? idLista : undefined}
          placeholder="Ex.: Matemática"
          aria-invalid={erroDisciplina ? true : undefined}
          aria-describedby={erroDisciplina ? `${idDisciplina}-erro` : undefined}
          disabled={enviando}
        />
        {disciplinas.length > 0 && (
          <datalist id={idLista}>
            {disciplinas.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        )}
        {erroDisciplina && (
          <p className="av-prof-erro-campo" id={`${idDisciplina}-erro`}>
            <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {erroDisciplina}
          </p>
        )}
      </div>

      {erroEnvio && (
        <p className="av-prof-aviso av-prof-aviso-erro" role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          <span>{erroEnvio}</span>
        </p>
      )}
      <p className={sucesso ? 'av-prof-aviso av-prof-aviso-ok' : 'sr-only'} role="status">
        {sucesso && <CheckCircle2 className="w-4 h-4" aria-hidden="true" />}
        <span>{sucesso ?? ''}</span>
      </p>

      <button type="submit" className="av-btn av-btn-primario av-prof-submit" disabled={enviando}>
        {enviando ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus className="w-4 h-4" aria-hidden="true" />
        )}
        <span>{enviando ? 'Criando aula…' : 'Criar aula'}</span>
      </button>
    </form>
  );
}
