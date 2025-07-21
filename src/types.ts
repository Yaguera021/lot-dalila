export type DiaSemanaId = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

export interface DiaSemana {
  id: DiaSemanaId;
  nome: string;
  cor: string;
}

export interface Slide {
  id: string;
  titulo: string;
  url: string;
  thumbnail?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'network' | 'api' | 'iframe' | 'general' | 'no_content';
}
