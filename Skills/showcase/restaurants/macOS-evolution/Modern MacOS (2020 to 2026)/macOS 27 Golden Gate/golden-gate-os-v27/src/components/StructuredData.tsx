import { useEffect, useRef } from 'react';

interface StructuredDataProps {
  id: string;
  data: Record<string, unknown>;
}

export function StructuredData({ id, data }: StructuredDataProps) {
  const serialized = JSON.stringify(data);
  const prevRef = useRef('');

  useEffect(() => {
    if (prevRef.current === serialized) return;
    prevRef.current = serialized;

    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [id, serialized]);

  return null;
}
