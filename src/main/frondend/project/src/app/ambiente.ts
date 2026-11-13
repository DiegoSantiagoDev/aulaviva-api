import { recursos } from '../config/recursos';

/**
 * Ajustes globais de ambiente:
 *  - modo leve automático em dispositivos modestos;
 *  - pausa das animações quando a aba fica oculta.
 *
 * Deve ser chamado uma única vez na entrada da aplicação.
 */
export function configurarAmbiente(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  aplicarModoLeve();
  aplicarPausaPorVisibilidade();
}

function dispositivoModesto(): boolean {
  const navegador = navigator as Navigator & { deviceMemory?: number };

  const poucosNucleos =
    typeof navegador.hardwareConcurrency === 'number' &&
    navegador.hardwareConcurrency > 0 &&
    navegador.hardwareConcurrency <= 4;

  const poucaMemoria =
    typeof navegador.deviceMemory === 'number' && navegador.deviceMemory > 0 && navegador.deviceMemory <= 2;

  return poucosNucleos || poucaMemoria;
}

function preferenciaModoLeve(): boolean {
  try {
    return window.localStorage.getItem('aulaviva_modo_leve') === '1';
  } catch {
    return false;
  }
}

function aplicarModoLeve(): void {
  const ativo =
    preferenciaModoLeve() ||
    (recursos.modoLeveAutomatico && dispositivoModesto());

  document.documentElement.classList.toggle('modo-leve', ativo);
}

function aplicarPausaPorVisibilidade(): void {
  const sincronizar = () => {
    document.documentElement.classList.toggle('aba-oculta', document.hidden);
  };

  sincronizar();
  document.addEventListener('visibilitychange', sincronizar);
}
