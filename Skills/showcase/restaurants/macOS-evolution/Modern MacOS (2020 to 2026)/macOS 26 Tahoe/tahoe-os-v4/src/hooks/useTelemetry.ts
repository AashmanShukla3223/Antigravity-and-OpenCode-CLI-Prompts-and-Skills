import { useState, useEffect, useRef } from 'react';

export interface TelemetryData {
  fps: number;
  frameDelta: number;
  heapUsage: number; // in MB
  heapLimit: number; // in MB
  cpuPressure: number; // 0 to 1
  isStuttering: boolean;
}

export const useTelemetry = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    fps: 60,
    frameDelta: 16.6,
    heapUsage: 0,
    heapLimit: 0,
    cpuPressure: 0,
    isStuttering: false,
  });

  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let isActive = true;

    const tick = (time: number) => {
      if (!isActive) return;

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      frameCountRef.current++;

      if (time - lastFpsTimeRef.current >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / (time - lastFpsTimeRef.current));
        
        let heapUse = 0;
        let heapLim = 1;
        if ((performance as any).memory) {
          heapUse = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
          heapLim = Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024);
        }

        // Calculate a mock CPU pressure based on frame delta volatility and heap
        // If fps drops below 30, pressure is high.
        const pressure = Math.min(1, Math.max(0, (60 - currentFps) / 60 + (heapUse / heapLim) * 0.5));
        const stuttering = delta > 50; // Frame took longer than 50ms

        setTelemetry({
          fps: currentFps,
          frameDelta: delta,
          heapUsage: heapUse,
          heapLimit: heapLim,
          cpuPressure: pressure,
          isStuttering: stuttering,
        });

        frameCountRef.current = 0;
        lastFpsTimeRef.current = time;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      isActive = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return telemetry;
};
