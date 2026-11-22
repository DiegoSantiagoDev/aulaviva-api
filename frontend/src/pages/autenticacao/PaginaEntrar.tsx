import { useEffect, useState, type FormEvent } from 'react';
import { Clock, Eye, EyeOff, Loader2, Lock, LogIn, Mail, ShieldAlert } from 'lucide-react';
import type { ApiError } from '../../api/tipos.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { destinoPosLogin } from '../../auth/rotas.ts';
import { useRoteador } from '../../app/Roteador.tsx';
import PalcoAutenticacao, { LinhaTitulo } from './PalcoAutenticacao.tsx';

/**
 * Login. Fluxo real do backend:
 * 200 → token e papel; 401 → credenciais inválidas;
 * 403 → conta de professor ainda PENDING ou REJECTED (a mensagem vem do servidor).
 */
export default function PaginaEntrar() {
  const { navegar, searchParams } = useRoteador();
  const { sessao, entrar, motivoSaida } = useAuth();
  const proximo = searchParams.get('proximo');
  const sessaoExpirou = searchParams.get('motivo') === 'expirada' || motivoSaida === 'expirada';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<ApiError | null>(null);

  // Já autenticado (ou acabou de autenticar): segue para a área do papel.
  useEffect(() => {
    if (sessao) navegar(destinoPosLogin(sessao.papel, proximo));
  }, [sessao, proximo, navegar]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (enviando) return;
    if (!email.trim() || !senha) {
      setErro({ status: 400, message: 'Informe o e-mail e a senha.' });
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await entrar(email, senha);
    } catch (err) {
      setErro(err as ApiError);
      setEnviando(false);
    }
  };

  const contaBloqueada = erro?.status === 403;

  return (
    <PalcoAutenticacao
      etiqueta="Acesso · professores e administração"
      chamada={
        <>
          Quem ensina <em>acende</em> a sala.
          <br />
          A gente cuida do resto.
        </>
      }
    >
      <p className="av-rotulo av-aut-entra">Entrar</p>
      <h1 className="av-aut-titulo">
        <LinhaTitulo>Bem-vindo</LinhaTitulo>
        <LinhaTitulo>de volta.</LinhaTitulo>
      </h1>

      {sessaoExpirou && (
        <div className="av-aviso av-aviso-info av-aut-entra" role="status">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span>Sua sessão expirou. Entre novamente para continuar.</span>
        </div>
      )}

      <form className="av-aut-form" onSubmit={enviar} noValidate>
        <div className="av-campo av-aut-entra">
          <label className="av-campo-rotulo" htmlFor="login-email">
            E-mail
          </label>
          <div className="av-entrada-grupo">
            <Mail className="av-entrada-icone" aria-hidden="true" />
            <input
              id="login-email"
              className="av-entrada av-entrada--icone"
              type="email"
              autoComplete="username"
              inputMode="email"
              placeholder="voce@escola.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'login-erro' : undefined}
              disabled={enviando}
              required
            />
          </div>
        </div>

        <div className="av-campo av-aut-entra">
          <label className="av-campo-rotulo" htmlFor="login-senha">
            Senha
          </label>
          <div className="av-entrada-grupo">
            <Lock className="av-entrada-icone" aria-hidden="true" />
            <input
              id="login-senha"
              className="av-entrada av-entrada--icone"
              type={mostrarSenha ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'login-erro' : undefined}
              disabled={enviando}
              required
            />
            <button
              type="button"
              className="av-entrada-botao"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? 'Ocultar a senha' : 'Mostrar a senha'}
              aria-pressed={mostrarSenha}
            >
              {mostrarSenha ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {erro && (
          <div
            id="login-erro"
            className={`av-aviso ${contaBloqueada ? 'av-aviso-atencao' : 'av-aviso-erro'}`}
            role="alert"
          >
            {contaBloqueada ? <Clock className="w-4 h-4" aria-hidden="true" /> : <ShieldAlert className="w-4 h-4" aria-hidden="true" />}
            <span>{erro.message}</span>
          </div>
        )}

        <button type="submit" className="av-btn av-btn-primario av-aut-enviar av-aut-entra" disabled={enviando}>
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <LogIn className="w-4 h-4" aria-hidden="true" />}
          <span>{enviando ? 'Entrando…' : 'Entrar'}</span>
        </button>
      </form>

      <div className="av-aut-rodape av-aut-entra">
        <p>
          Sou professor e ainda não tenho conta:{' '}
          <button type="button" className="av-link" onClick={() => navegar('/cadastro')}>
            cadastrar-me
          </button>
        </p>
        <p>
          Só quero estudar:{' '}
          <button type="button" className="av-link" onClick={() => navegar('/aulas')}>
            ver as aulas
          </button>{' '}
          <span className="av-campo-ajuda">(não precisa de conta)</span>
        </p>
      </div>
    </PalcoAutenticacao>
  );
}
