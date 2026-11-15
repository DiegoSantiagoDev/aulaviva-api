/**
 * Ajustes globais de ambiente:
 *  - modo leve somente quando solicitado explicitamente pelo usuário;
 *  - pausa das animações quando a aba fica oculta.
 *
 * Deve ser chamado uma única vez na entrada da aplicação.
 */
export function configurarAmbiente(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  aplicarModoLeve();
  aplicarPausaPorVisibilidade();
}

function preferenciaModoLeve(): boolean {
  try {
    return window.localStorage.getItem('aulaviva_modo_leve') === '1';
  } catch {
    return false;
  }
}

function aplicarModoLeve(): void {
  // Não ativar o modo leve automaticamente por memória ou núcleos do dispositivo.
  // Assim, as animações visuais permanecem ativas por padrão.
  document.documentElement.classList.toggle('modo-leve', preferenciaModoLeve());
}

function aplicarPausaPorVisibilidade(): void {
  const sincronizar = () => {
    document.documentElement.classList.toggle('aba-oculta', document.hidden);
  };

  sincronizar();
  document.addEventListener('visibilitychange', sincronizar);
}
