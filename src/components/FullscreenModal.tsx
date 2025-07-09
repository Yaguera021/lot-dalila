import { useEffect } from 'react';
import MediaViewer from './MediaViewer';
import type { Slide } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause, AlertCircle, X } from 'lucide-react';

interface Props {
  slides: Slide[];
  current: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onClose: () => void;
}

export default function FullscreenModal({ slides, current, isPlaying, onPrev, onNext, onTogglePlay, onClose }: Props) {
  const slide = slides[current];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50' onClick={onClose}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className='absolute top-4 right-4 z-20 p-2 bg-gray-800 bg-opacity-50 hover:bg-gray-700 rounded-full text-white transition-colors'
        aria-label='Fechar tela cheia'
      >
        <X size={28} />
      </button>

      <div className='relative w-full h-full' onClick={(e) => e.stopPropagation()}>
        {slide ? (
          <MediaViewer slide={slide} />
        ) : (
          <div className='flex items-center justify-center h-full'>
            <AlertCircle size={48} className='text-red-400' />
          </div>
        )}

        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-4'>
          <button onClick={onPrev} className='p-2 bg-gray-800 bg-opacity-50 hover:bg-gray-700 rounded-full text-white transition-colors'>
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className='p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors'
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button onClick={onNext} className='p-2 bg-gray-800 bg-opacity-50 hover:bg-gray-700 rounded-full text-white transition-colors'>
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
