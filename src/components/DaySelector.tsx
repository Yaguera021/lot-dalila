import type { DiaSemana } from '../types';
import { Folder } from 'lucide-react';

interface Props {
  onSelect: (dia: DiaSemana) => void;
}

const diasSemana: DiaSemana[] = [
  { id: 'segunda', nome: 'Segunda-feira', cor: 'bg-blue-500' },
  { id: 'terca', nome: 'Terça-feira', cor: 'bg-green-500' },
  { id: 'quarta', nome: 'Quarta-feira', cor: 'bg-yellow-500' },
  { id: 'quinta', nome: 'Quinta-feira', cor: 'bg-purple-500' },
  { id: 'sexta', nome: 'Sexta-feira', cor: 'bg-red-500' },
  { id: 'sabado', nome: 'Sábado', cor: 'bg-indigo-500' },
];

export default function DaySelector({ onSelect }: Props) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
      {diasSemana.map((dia) => (
        <div key={dia.id} onClick={() => onSelect(dia)} className={`${dia.cor} rounded-xl p-6 cursor-pointer hover:scale-105 transition shadow-lg flex flex-col items-center`}>
          <Folder size={72} className='text-white mb-4' />
          <span className='text-white text-lg font-semibold'>{dia.nome}</span>
        </div>
      ))}
    </div>
  );
}
