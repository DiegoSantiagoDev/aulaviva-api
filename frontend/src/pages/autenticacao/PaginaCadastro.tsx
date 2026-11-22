import { useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, Clock, KeyRound, Loader2, Lock, Mail, ShieldAlert, ShieldCheck, User, UserPlus } from 'lucide-react';
import { api } from '../../api/cliente.ts';
import type { ApiError } from '../../api/tipos.ts';
import { useRoteador } from '../../app/Roteador.tsx';
import PalcoAutenticacao, { LinhaTitulo } from './PalcoAutenticacao.tsx';

interface Erros {
  nome?: string;
  email?: string;
  senha?: string;
  confirmar?: string;
}

/** Limites idênticos aos do RegisterRequest do backend. */
const LIMITES = { nome: 100, email: 150, senhaMin: 8, senhaMax: 72 };
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(nome: string, email: string, senha: string, confirmar: string): Erros {
  const erros: Erros = {};
  if (!nome.trim()) erros.nome = 'Informe o seu nome.';
  else if (nome.trim().length > LIMITES.nome) erros.nome = `O nome pode ter no máximo ${LIMITES.nome} caracteres.`;
  if (!email.trim()) erros.email = 'Informe o seu e-mail.';
  else if (!EMAIL_VALIDO.test(email.trim())) erros.email = 'Digite um e-mail válido.';
  else if (email.trim().length > LIMITES.email) erros.email = `O e-mail pode ter no máximo ${LIMITES.email} caracteres.`;
  if (senha.length < LIMITES.senhaMin) erros.senha = `A senha precisa ter pelo menos ${LIMITES.senhaMin} caracteres.`;
  else if (senha.length > LIMITES.senhaMax) erros.senha = `A senha pode ter no máximo ${LIMITES.senhaMax} caracteres.`;
  if (confirmar !== senha) erros.confirmar = 'As senhas não são iguais.';
  return erros;
}

/**
 * Cadastro exclusivo de professor. O backend sempre cria a conta como PROFESSOR/PENDING:
 * o acesso só vem depois da aprovação de um administrador.
 */
export default function PaginaCadastro() {
  const { navegar } = useRoteador();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState<ApiError | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagemOk, setMensagemOk] = useState<string | null>(null);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    const encontrados = validar(nome, email, senha, confirmar);
    setErros(encontrados);
    setErroApi(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const resposta = await api.cadastrar({ name: nome.trim(), email: email.trim(), password: senha });
      setMensagemOk(resposta.message);
    } catch (err) {
      setErroApi(err as ApiError);
    } finally {
      setEnviando(false);
    }
  };

  if (mensagemOk) {
    return (
      <PalcoAutenticacao etiqueta="Cadastro recebido" chamada={<>Agora é com a <em>administração</em>.</>}>
        <div className="av-aut-sucesso" role="status">
          <span className="av-aut-sucesso-icone">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </span>
          <h1 className="av-aut-titulo">
            <LinhaTitulo>Cadastro</LinhaTitulo>
            <LinhaTitulo>enviado.</LinhaTitulo>
          </h1>
          <p className="av-aut-texto-corrido">{mensagemOk}</p>
          <ol className="av-aut-etapas" aria-label="Situação do cadastro">
            <li data-estado="feito">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Cadastro enviado</span>
            </li>
            <li data-estado="agora">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>Aguardando aprovação da administração</span>
            </li>
            <li data-estado="depois">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Acesso liberado</span>
            </li>
          </ol>
          <div className="av-aviso av-aviso-atencao">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>
              Enquanto a conta estiver aguardando aprovação, o login é recusado. Volte a tentar depois que a
              administração liberar o seu acesso.
            </span>
          </div>
          <div className="av-linha-acoes">
            <button type="button" className="av-btn av-btn-primario" onClick={() => navegar('/entrar')}>
              Ir para o login
            </button>
            <button type="button" className="av-btn av-btn-contorno" onClick={() => navegar('/aulas')}>
              Ver as aulas
            </button>
          </div>
        </div>
      </PalcoAutenticacao>
    );
  }

  const campo = (
    id: string,
    rotulo: string,
    valor: string,
    set: (v: string) => void,
    erro: string | undefined,
    extra: { type?: string; autoComplete: string; ajuda?: string; maxLength?: number; icone: ReactNode; placeholder: string }
  ) => (
    <div className="av-campo av-aut-entra">
      <label className="av-campo-rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <div className="av-entrada-grupo">
        {extra.icone}
        <input
          id={id}
          className="av-entrada av-entrada--icone"
          type={extra.type ?? 'text'}
          autoComplete={extra.autoComplete}
          placeholder={extra.placeholder}
          value={valor}
          onChange={(e) => set(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${id}-erro` : extra.ajuda ? `${id}-ajuda` : undefined}
          maxLength={extra.maxLength}
          disabled={enviando}
        />
      </div>
      {erro ? (
        <span id={`${id}-erro`} className="av-campo-erro" role="alert">
          {erro}
        </span>
      ) : extra.ajuda ? (
        <span id={`${id}-ajuda`} className="av-campo-ajuda">
          {extra.ajuda}
        </span>
      ) : null}
    </div>
  );

  return (
    <PalcoAutenticacao
      etiqueta="Cadastro · somente professores"
      chamada={
        <>
          Grave a aula.
          <br />
          Deixe o <em>conhecimento</em> pronto para estudar.
        </>
      }
    >
      <p className="av-rotulo av-aut-entra">Criar conta de professor</p>
      <h1 className="av-aut-titulo">
        <LinhaTitulo>Acenda a</LinhaTitulo>
        <LinhaTitulo>sua aula.</LinhaTitulo>
      </h1>

      <form className="av-aut-form" onSubmit={enviar} noValidate>
        {campo('cad-nome', 'Nome', nome, setNome, erros.nome, { autoComplete: 'name', maxLength: LIMITES.nome, placeholder: 'Seu nome completo', icone: <User className="av-entrada-icone" aria-hidden="true" /> })}
        {campo('cad-email', 'E-mail', email, setEmail, erros.email, { type: 'email', autoComplete: 'email', maxLength: LIMITES.email, placeholder: 'voce@escola.com.br', icone: <Mail className="av-entrada-icone" aria-hidden="true" /> })}
        {campo('cad-senha', 'Senha', senha, setSenha, erros.senha, {
          type: 'password',
          autoComplete: 'new-password',
          maxLength: LIMITES.senhaMax,
          ajuda: `De ${LIMITES.senhaMin} a ${LIMITES.senhaMax} caracteres.`,
          placeholder: `Mínimo de ${LIMITES.senhaMin} caracteres`,
          icone: <Lock className="av-entrada-icone" aria-hidden="true" />,
        })}
        {campo('cad-confirmar', 'Repita a senha', confirmar, setConfirmar, erros.confirmar, {
          type: 'password',
          autoComplete: 'new-password',
          maxLength: LIMITES.senhaMax,
          placeholder: 'Digite a senha de novo',
          icone: <KeyRound className="av-entrada-icone" aria-hidden="true" />,
        })}

        {erroApi && (
          <div className="av-aviso av-aviso-erro" role="alert">
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            <span>{erroApi.message}</span>
          </div>
        )}

        <p className="av-campo-ajuda av-aut-entra">
          Depois do cadastro, a conta fica <strong>aguardando aprovação</strong> de um administrador.
        </p>

        <button type="submit" className="av-btn av-btn-primario av-aut-enviar av-aut-entra" disabled={enviando}>
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <UserPlus className="w-4 h-4" aria-hidden="true" />}
          <span>{enviando ? 'Enviando…' : 'Enviar cadastro'}</span>
        </button>
      </form>

      <div className="av-aut-rodape av-aut-entra">
        <p>
          Já tenho conta:{' '}
          <button type="button" className="av-link" onClick={() => navegar('/entrar')}>
            entrar
          </button>
        </p>
      </div>
    </PalcoAutenticacao>
  );
}
