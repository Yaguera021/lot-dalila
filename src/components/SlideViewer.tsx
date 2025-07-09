import type { DiaSemana, Slide, ErrorState } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause, AlertCircle, Maximize2 } from 'lucide-react';
import MediaViewer from './MediaViewer';

interface Props {
  day: DiaSemana;
  slides: Slide[];
  current: number;
  loading: boolean;
  error: ErrorState;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  isPlaying: boolean;
  onFullscreen: () => void;
  onBack: () => void;
}

export default function SlideViewer({ day, slides, current, loading, error, onPrev, onNext, onTogglePlay, isPlaying, onFullscreen, onBack }: Props) {
  const slide = slides[current];
  const hasError = error.hasError;

  return (
    <div className='bg-gray-900 rounded-lg p-4 mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='flex items-center gap-2 text-xl font-bold'>
          <span className={`w-4 h-4 rounded-full ${day.cor}`} />
          {day.nome}
        </h2>
        <button onClick={onBack} className='px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm'>
          <ChevronLeft className='inline-block mr-1 text-white' size={16} />
          Voltar
        </button>
      </div>

      <div className='w-full bg-black rounded-lg overflow-hidden' style={{ aspectRatio: '16/9' }}>
        {loading ? (
          <div className='flex items-center justify-center h-full'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400' />
          </div>
        ) : hasError || !slide ? (
          <div className='flex items-center justify-center h-full bg-gray-800'>
            <AlertCircle size={32} className='text-red-400' />
          </div>
        ) : (
          <MediaViewer slide={slide} />
        )}
      </div>

      <div className='flex items-center justify-center space-x-4 mt-4'>
        <button onClick={onPrev} className='p-2 bg-gray-700 hover:bg-gray-600 rounded-full'>
          <ChevronLeft className='text-white' />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className='p-3 bg-blue-600 hover:bg-blue-500 rounded-full'
        >
          {isPlaying ? <Pause className='text-white' /> : <Play className='text-white' />}
        </button>

        <button onClick={onNext} className='p-2 bg-gray-700 hover:bg-gray-600 rounded-full'>
          <ChevronRight className='text-white' />
        </button>

        <button onClick={onFullscreen} className='p-2 bg-gray-700 hover:bg-gray-600 rounded-full'>
          <Maximize2 className='text-white' />
        </button>
      </div>
    </div>
  );
}
