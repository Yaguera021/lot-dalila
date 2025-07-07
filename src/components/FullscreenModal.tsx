// src/components/FullscreenModal.tsx
import { useEffect, useRef } from 'react';
import type { Slide } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause, AlertCircle } from 'lucide-react';

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
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timer.current = window.setInterval(onNext, 15000);
    } else if (timer.current) {
      window.clearInterval(timer.current);
    }
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [isPlaying, onNext]);

  const slide = slides[current];

  return (
    <div className='fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50' onClick={onClose}>
      <div className='relative w-full h-full flex items-center justify-center' style={{ maxWidth: '90%', maxHeight: '90%' }} onClick={(e) => e.stopPropagation()}>
        {slide ? (
          <iframe src={slide.url} title={slide.titulo} className='w-full h-full max-w-full max-h-full' style={{ border: 'none', overflow: 'hidden' }} />
        ) : (
          <AlertCircle size={48} className='text-red-400' />
        )}

        <div className='absolute bottom-6 flex items-center space-x-4'>
          <button onClick={onPrev} className='p-2 bg-gray-800 hover:bg-gray-700 rounded-full'>
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
          <button onClick={onNext} className='p-2 bg-gray-800 hover:bg-gray-700 rounded-full'>
            <ChevronRight className='text-white' />
          </button>
        </div>
      </div>
    </div>
  );
}
