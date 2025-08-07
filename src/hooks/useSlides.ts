/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { DiaSemanaId, Slide, ErrorState } from '../types';

const API_URL = 'https://webhook.brxlabs.com.br/webhook/slides/loterica';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const DIAS_DA_SEMANA_MAP: DiaSemanaId[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

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

  // Shuffle Fisher–Yates (mutates o array dado)
  const shuffle = (array: Slide[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

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
      if (!Array.isArray(data)) throw new Error('Formato de dados inválido');

      // aqui filtramos e validamos o formato
      return data.filter((s) => s && typeof s.id === 'string' && typeof s.titulo === 'string' && typeof s.url === 'string').map((s) => s as Slide);
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

    const hojeIndex = new Date().getDay();
    const diaAtualId = DIAS_DA_SEMANA_MAP[hojeIndex];

    if (selectedDayId !== diaAtualId) {
      setSlides([]);
      setErrorState({
        hasError: true,
        message: 'As apresentações para este dia não estão disponíveis hoje.',
        type: 'api',
      });
      return;
    }

    setLoading(true);
    setErrorState({ hasError: false, message: '', type: 'general' });

    try {
      const res = await fetchSlides(selectedDayId);

      // aqui embaralha antes de setar
      shuffle(res);

      setSlides(res);

      if (res.length === 0) {
        setErrorState({
          hasError: true,
          message: 'Nenhuma apresentação disponível para este dia',
          type: 'api',
        });
      }
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
    if (selectedDayId) {
      load();
    }
  };

  const clearError = () => setErrorState({ hasError: false, message: '', type: 'general' });

  return { slides, loading, errorState, retry, clearError };
}
