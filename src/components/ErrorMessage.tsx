import type { ErrorState } from '../types';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  error: ErrorState;
  onRetry?: () => void;
  canRetry?: boolean;
}

export default function ErrorMessage({ error, onRetry, canRetry }: Props) {
  return (
    <div className='bg-red-900 border border-red-600 rounded-lg p-4 mb-4'>
      <div className='flex items-center gap-3'>
        <AlertCircle size={20} className='text-red-400' />
        <div className='flex-1'>
          <p className='text-red-100 font-medium'>Erro</p>
          <p className='text-red-200 text-sm'>{error.message}</p>
        </div>
        {canRetry && onRetry && (
          <button onClick={onRetry} className='flex items-center gap-2 px-3 py-1 bg-red-700 hover:bg-red-600 text-red-100 rounded text-sm'>
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
