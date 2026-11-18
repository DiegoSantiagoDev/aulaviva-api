import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Chamado quando a cena 3D falha ao carregar ou desenhar; a página troca pelo núcleo em CSS. */
  aoFalhar: () => void;
}

/** Limite de erro da cena 3D: uma falha de WebGL nunca derruba a página. */
export default class ErroLimite extends Component<Props, { falhou: boolean }> {
  state = { falhou: false };

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.warn('Cena 3D indisponível, usando alternativa em CSS.', erro, info.componentStack);
    this.props.aoFalhar();
  }

  render() {
    return this.state.falhou ? null : this.props.children;
  }
}
