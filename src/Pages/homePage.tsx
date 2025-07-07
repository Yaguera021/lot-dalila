import { useState, useEffect, useRef } from 'react';
import { Calendar, Folder, ChevronLeft, Play, Pause, ChevronRight, X } from 'lucide-react';

type DiaSemanaId = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado';

interface Slide {
  id: string;
  titulo: string;
  url: string;
  thumbnail: string;
}

interface DiaSemana {
  id: DiaSemanaId;
  nome: string;
  cor: string;
}

const diasSemana: DiaSemana[] = [
  { id: 'segunda', nome: 'Segunda-feira', cor: 'bg-blue-500' },
  { id: 'terca', nome: 'Terça-feira', cor: 'bg-green-500' },
  { id: 'quarta', nome: 'Quarta-feira', cor: 'bg-yellow-500' },
  { id: 'quinta', nome: 'Quinta-feira', cor: 'bg-purple-500' },
  { id: 'sexta', nome: 'Sexta-feira', cor: 'bg-red-500' },
  { id: 'sabado', nome: 'Sábado', cor: 'bg-indigo-500' },
];

export default function WeeklySlides() {
  const [selectedDay, setSelectedDay] = useState<DiaSemana | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const API_URL = 'https://webhook.brxlabs.com.br/webhook/slides/loterica';

  const fetchSlides = async (dayId: DiaSemanaId): Promise<Slide[]> => {
    const res = await fetch(`${API_URL}?day=${encodeURIComponent(dayId)}`);
    if (!res.ok) throw new Error('Falha ao carregar slides');
    return res.json();
  };

  const diaSemanaMap: DiaSemanaId[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

  const handleDayClick = async (day: DiaSemana) => {
    setSelectedDay(day);
    setCurrentSlide(0);
    setIsPlaying(true);

    const hojeIndex = new Date().getDay();
    const hojeId = hojeIndex === 0 ? undefined : diaSemanaMap[hojeIndex - 1];

    if (day.id === hojeId) {
      setLoading(true);
      try {
        const data = await fetchSlides(day.id);
        setSlides(data);
      } catch (err) {
        console.error(err);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSlides([]);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const togglePlay = () => {
    setIsPlaying((play) => !play);
  };

  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  // Timer para slides automáticos
  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      timerRef.current = setInterval(nextSlide, 15000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides, isPlaying, currentSlide]);

  // Limpeza do timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Função para formatar URL do slide
  const formatSlideUrl = (url: string, isFullscreen: boolean = false) => {
    let formattedUrl = url;

    // Adicionar parâmetros para melhorar a exibição
    if (formattedUrl.includes('docs.google.com')) {
      // Para Google Slides
      if (!formattedUrl.includes('rm=minimal')) {
        formattedUrl += (formattedUrl.includes('?') ? '&' : '?') + 'rm=minimal';
      }
      if (isFullscreen && !formattedUrl.includes('embedded=true')) {
        formattedUrl += '&embedded=true';
      }
    }

    return formattedUrl;
  };

  // Tela cheia
  if (isFullscreen && selectedDay && slides.length > 0) {
    const slide = slides[currentSlide];
    return (
      <div className='fixed inset-0 bg-black flex items-center justify-center z-50'>
        <div className='w-full h-full relative'>
          <iframe
            src={formatSlideUrl(slide.url, true)}
            title={slide.titulo}
            className='w-full h-full border-0'
            style={{
              border: 'none',
              outline: 'none',
              overflow: 'hidden',
            }}
            frameBorder='0'
            scrolling='no'
            allowFullScreen
          />
        </div>

        {/* Botão de fechar */}
        <button onClick={toggleFullscreen} className='absolute top-4 right-4 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity z-10'>
          <X size={24} />
        </button>

        {/* Controles de navegação */}
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 z-10'>
          <button onClick={prevSlide} className='p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity'>
            <ChevronLeft size={20} />
          </button>

          <button onClick={togglePlay} className='p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors'>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button onClick={nextSlide} className='p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-opacity'>
            <ChevronRight size={20} />
          </button>

          {/* Indicador de slide atual */}
          <div className='ml-4 px-3 py-2 bg-black bg-opacity-50 text-white rounded-full text-sm'>
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>
    );
  }

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
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12'>
            {diasSemana.map((dia) => (
              <div
                key={dia.id}
                onClick={() => handleDayClick(dia)}
                className={`${dia.cor} rounded-xl p-6 sm:p-8 cursor-pointer transform hover:scale-105 transition duration-300 shadow-lg flex flex-col items-center justify-center`}
              >
                <Folder size={72} className='mb-4 text-white' />
                <h3 className='text-lg sm:text-xl font-semibold text-white text-center'>{dia.nome}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-gray-800 rounded-xl p-4 sm:p-8'>
            <div className='flex flex-col sm:flex-row items-center justify-between mb-6'>
              <h2 className='flex items-center gap-2 text-xl sm:text-2xl font-bold'>
                <span className={`w-4 h-4 rounded-full ${selectedDay.cor}`} />
                {selectedDay.nome}
              </h2>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setSlides([]);
                  setIsPlaying(false);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
                className='px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm sm:text-base'
              >
                Voltar
              </button>
            </div>

            {loading ? (
              <div className='text-center py-8'>
                <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-4'></div>
                <p className='text-gray-400'>Carregando slides...</p>
              </div>
            ) : slides.length > 0 ? (
              <>
                <div className='bg-gray-900 rounded-lg p-4 sm:p-6 relative mb-6'>
                  <h3 className='text-base sm:text-lg font-semibold mb-3'>Apresentação Atual</h3>

                  {/* Container do iframe com aspect ratio fixo */}
                  <div className='w-full bg-white rounded-lg overflow-hidden' style={{ aspectRatio: '16/9' }}>
                    <iframe
                      src={formatSlideUrl(slides[currentSlide]?.url)}
                      title={slides[currentSlide]?.titulo}
                      className='w-full h-full border-0'
                      style={{
                        border: 'none',
                        outline: 'none',
                        overflow: 'hidden',
                      }}
                      frameBorder='0'
                      scrolling='no'
                      allowFullScreen
                    />
                  </div>

                  {/* Controles */}
                  <div className='flex items-center justify-center space-x-4 mt-4'>
                    <button onClick={prevSlide} className='p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors'>
                      <ChevronLeft size={20} className='text-white' />
                    </button>

                    <button onClick={togglePlay} className='p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors'>
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button onClick={nextSlide} className='p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors'>
                      <ChevronRight size={20} className='text-white' />
                    </button>

                    <button onClick={toggleFullscreen} className='ml-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors'>
                      Tela Cheia
                    </button>

                    {/* Indicador de slide */}
                    <div className='ml-4 px-3 py-1 bg-gray-700 rounded-full text-sm'>
                      {currentSlide + 1} / {slides.length}
                    </div>
                  </div>
                </div>

                {/* Lista de slides */}
                <div className='bg-gray-900 rounded-lg p-4 sm:p-6'>
                  <h3 className='text-base sm:text-lg font-semibold mb-3'>Todas as Apresentações</h3>
                  <div className='space-y-2 max-h-72 sm:max-h-96 overflow-y-auto'>
                    {slides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        onClick={() => setCurrentSlide(idx)}
                        className={`${
                          idx === currentSlide ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                        } flex items-center gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors`}
                      >
                        <div className='w-12 sm:w-14 h-8 sm:h-10 bg-gray-600 rounded overflow-hidden flex-shrink-0'>
                          {slide.thumbnail ? (
                            <img
                              src={slide.thumbnail}
                              alt={slide.titulo}
                              className='w-full h-full object-cover'
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className='w-full h-full bg-gray-600 flex items-center justify-center text-xs text-gray-400' style={{ display: slide.thumbnail ? 'none' : 'flex' }}>
                            Slide
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm sm:text-base font-medium truncate'>{slide.titulo}</p>
                          <p className='text-xs sm:text-sm text-gray-400'>Slide {idx + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className='text-center py-8'>
                <Folder size={48} className='mx-auto text-gray-500 mb-3' />
                <p className='text-gray-400'>Nenhuma apresentação disponível para este dia.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
