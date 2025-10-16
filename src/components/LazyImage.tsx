import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function LazyImage({ src, alt, className, width, height }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={className} style={{ width, height }}>
      {isLoading && <Skeleton className="w-full h-full" />}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onLoad={handleLoad}
        loading="lazy"
        width={width}
        height={height}
      />
    </div>
  );
}
