import type { Slide } from '../types';
import { AlertCircle } from 'lucide-react';

interface Props {
  slides: Slide[];
  current: number;
  onSelect: (idx: number) => void;
}

export default function SlideList({ slides, current, onSelect }: Props) {
  return (
    <div className='bg-gray-900 rounded-lg p-4'>
      <h3 className='text-lg font-semibold mb-3'>Todas as Apresentações</h3>
      <div className='space-y-2 max-h-72 overflow-y-auto'>
        {slides.map((s, i) => (
          <div key={s.id} onClick={() => onSelect(i)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${i === current ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            <div className='w-12 h-8 bg-gray-600 rounded overflow-hidden flex-shrink-0'>
              {s.thumbnail ? (
                <img src={s.thumbnail} alt={s.titulo} className='w-full h-full object-cover' />
              ) : (
                <div className='flex items-center justify-center h-full text-xs text-gray-400'>
                  <AlertCircle size={16} />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='truncate'>{s.titulo}</p>
              <p className='text-xs text-gray-400'>Slide {i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
