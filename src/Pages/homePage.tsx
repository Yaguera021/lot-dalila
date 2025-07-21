import { useState, useCallback, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import type { DiaSemana } from '../types';
import DaySelector from '../components/DaySelector';
import ErrorMessage from '../components/ErrorMessage';
import useSlides from '../hooks/useSlides';
import SlideList from '../components/SlideList';
import SlideViewer from '../components/SlideViewer';

const toggleNativeFullscreen = async (element: HTMLElement | null) => {
  if (!element) return;

  const isFullscreen = !!document.fullscreenElement;

  if (isFullscreen) {
    await document.exitFullscreen();
  } else {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (
      (
        element as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
          msRequestFullscreen?: () => Promise<void> | void;
        }
      ).webkitRequestFullscreen
    ) {
      await (
        element as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
        }
      ).webkitRequestFullscreen!();
    } else if (
      (
        element as HTMLElement & {
          msRequestFullscreen?: () => Promise<void> | void;
        }
      ).msRequestFullscreen
    ) {
      await (
        element as HTMLElement & {
          msRequestFullscreen?: () => Promise<void> | void;
        }
      ).msRequestFullscreen!();
    }
  }
};

export default function WeeklySlides() {
  const [selectedDay, setSelectedDay] = useState<DiaSemana | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slideContainerRef = useRef<HTMLDivElement>(null);

  const { slides, loading, errorState, retry, clearError } = useSlides(selectedDay?.id || null);

  const handleDayClick = useCallback(
    (day: DiaSemana) => {
      clearError();
      setSelectedDay(day);
      setCurrentSlide(0);
      setIsPlaying(true);
    },
    [clearError],
  );

  const nextSlide = useCallback(() => setCurrentSlide((i) => (i < slides.length - 1 ? i + 1 : 0)), [slides.length]);
  const prevSlide = useCallback(() => setCurrentSlide((i) => (i > 0 ? i - 1 : slides.length - 1)), [slides.length]);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const handleFullscreen = () => {
    toggleNativeFullscreen(slideContainerRef.current);
  };

  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      timer.current = window.setInterval(nextSlide, 15000);
    } else if (timer.current) {
      window.clearInterval(timer.current);
    }
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [isPlaying, slides, nextSlide]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-8'>
      <div className='max-w-6xl mx-auto'>
        <header className='text-center mb-8 sm:mb-12'>
          <h1 className='flex flex-col sm:flex-row items-center justify-center text-2xl sm:text-3xl font-bold gap-2 sm:gap-3 mb-4'>
            <Calendar className='text-blue-400' size={40} />
            Loterica Dalila Slides da Semana
          </h1>
          <p className='text-gray-300 text-sm sm:text-lg'>Selecione um dia para ver a apresentação</p>
        </header>

        {!selectedDay ? (
          <DaySelector onSelect={handleDayClick} />
        ) : (
          <>
            <SlideViewer
              ref={slideContainerRef}
              day={selectedDay}
              slides={slides}
              current={currentSlide}
              loading={loading}
              error={errorState}
              onPrev={prevSlide}
              onNext={nextSlide}
              onTogglePlay={togglePlay}
              isPlaying={isPlaying}
              onFullscreen={handleFullscreen}
              onBack={() => {
                setSelectedDay(null);
                setCurrentSlide(0);
                setIsPlaying(true);
              }}
            />

            {errorState.hasError && <ErrorMessage error={errorState} onRetry={retry} canRetry={errorState.type === 'network'} />}

            <SlideList slides={slides} current={currentSlide} onSelect={setCurrentSlide} />
          </>
        )}
      </div>
    </div>
  );
}
