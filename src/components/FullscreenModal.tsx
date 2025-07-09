// src/components/FullscreenModal.tsx
import type { Slide } from '../types';
import { ChevronLeft, ChevronRight, Play, Pause, AlertCircle } from 'lucide-react';
import MediaViewer from './MediaViewer';

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

  return (
    <div className='fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50' onClick={onClose}>
      <div className='relative w-full h-full' onClick={(e) => e.stopPropagation()}>
        {slide ? (
          <MediaViewer slide={slide} />
        ) : (
          <div className='flex items-center justify-center h-full'>
            <AlertCircle size={48} className='text-red-400' />
          </div>
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
