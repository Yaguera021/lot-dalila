import { useState, useEffect, useRef, useCallback } from 'react';
import type { DiaSemanaId, Slide, ErrorState } from '../types';

const API_URL = 'https://webhook.brxlabs.com.br/webhook/slides/loterica';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const isCurrentDay = (dayId: DiaSemanaId): boolean => {
  const today = new Date();
  const currentDayOfWeek = today.getDay();

  const dayMap: { [key in DiaSemanaId]: number } = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
  };

  return dayMap[dayId] === currentDayOfWeek;
};

export default function useSlides(selectedDayId: DiaSemanaId | null) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    type: 'general',
  });
  const abortRef = useRef<AbortController | null>(null);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const fetchSlides = useCallback(async (dayId: DiaSemanaId, attempt = 0): Promise<Slide[]> => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}?day=${dayId}`, {
        signal: abortRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Slides não encontrados' : `Erro ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Dados BRUTOS recebidos da API:', data);
      if (!Array.isArray(data)) throw new Error('Formato de dados inválido');
      return data.filter((s) => s && typeof s.id === 'string' && typeof s.titulo === 'string' && typeof s.url === 'string');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (attempt < MAX_RETRIES && (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
        await sleep(RETRY_DELAY * 2 ** attempt);
        return fetchSlides(dayId, attempt + 1);
      }
      throw err;
    }
  }, []);

  const load = useCallback(async () => {
    if (!selectedDayId) {
      setSlides([]);
      setErrorState({ hasError: false, message: '', type: 'general' });
      return;
    }

    // Verificar se o dia selecionado é o dia atual
    if (!isCurrentDay(selectedDayId)) {
      setLoading(false);
      setSlides([]);
      setErrorState({
        hasError: true,
        message: 'Apresentações disponíveis apenas para o dia atual',
        type: 'no_content',
      });
      return;
    }

    setLoading(true);
    setErrorState({ hasError: false, message: '', type: 'general' });

    try {
      const res = await fetchSlides(selectedDayId);
      setSlides(res);
      if (res.length === 0) {
        setErrorState({
          hasError: true,
          message: 'Nenhuma apresentação disponível para este dia',
          type: 'api',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setSlides([]);
      const msg = err.message.includes('Failed to fetch') ? 'Erro de conexão. Verifique sua internet' : err.message;
      setErrorState({ hasError: true, message: msg, type: 'network' });
    } finally {
      setLoading(false);
    }
  }, [fetchSlides, selectedDayId]);

  useEffect(() => {
    load();
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  const retry = () => {
    // Só permite retry se for erro de rede e for o dia atual
    if (selectedDayId && isCurrentDay(selectedDayId)) {
      load();
    }
  };

  const clearError = () => setErrorState({ hasError: false, message: '', type: 'general' });

  return { slides, loading, errorState, retry, clearError };
}
