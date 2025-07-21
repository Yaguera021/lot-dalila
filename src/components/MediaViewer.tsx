import type { Slide } from '../types';

const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
  try {
    const urlObject = new URL(url);

    const pathname = urlObject.pathname;

    const extension = pathname.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return 'image';
    }
    if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
      return 'video';
    }

    return 'unknown';
  } catch (error) {
    console.error('URL inválida:', url, error);
    return 'unknown';
  }
};
interface Props {
  slide: Slide | undefined;
}

export default function MediaViewer({ slide }: Props) {
  if (!slide) {
    return 'Não há slides disponíveis.';
  }

  const mediaType = getMediaType(slide.url);

  const commonStyles = 'w-full h-full object-cover fullscreen-media';

  switch (mediaType) {
    case 'image':
      return <img key={slide.id} src={slide.url} alt={slide.titulo} className={commonStyles} />;

    case 'video':
      return <video key={slide.id} src={slide.url} autoPlay muted loop playsInline className={commonStyles} />;

    default:
      return <p>Formato de mídia não suportado.</p>;
  }
}
