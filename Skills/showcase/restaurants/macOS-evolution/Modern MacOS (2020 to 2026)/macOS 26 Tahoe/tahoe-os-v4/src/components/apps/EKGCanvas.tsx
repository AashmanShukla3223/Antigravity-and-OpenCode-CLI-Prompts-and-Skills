import React, { useRef, useEffect } from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';

export const EKGCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const telemetry = useTelemetry();
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const lastDrawRef = useRef<number>(0);
  const xOffsetRef = useRef<number>(0);

  useEffect(() => {
    lastDrawRef.current = performance.now();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const time = performance.now();
      const delta = time - lastDrawRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Map telemetry to EKG values
      const skipBeat = telemetry.isStuttering;
      const frequency = 0.05 + (telemetry.cpuPressure * 0.1); // Wave frequency
      const amplitudeMultiplier = skipBeat ? 0 : 1 + (telemetry.heapUsage / (telemetry.heapLimit || 1)) * 2;

      // Update xOffset based on delta and fps (simulate pulse movement)
      const speed = skipBeat ? 0.5 : 2; // slow down if stuttering
      xOffsetRef.current += speed * (delta / 16.6); // normalized to 60fps base speed

      // Generate a new point
      const x = width; // Start from right side
      // EKG formula
      const t = xOffsetRef.current * frequency;
      const baseY = height / 2;
      
      // Simple EKG shape simulation
      let yOffset = 0;
      const period = t % 10;
      if (!skipBeat) {
        if (period > 1 && period < 1.5) yOffset = -10 * amplitudeMultiplier; // P wave
        else if (period > 2 && period < 2.5) yOffset = 5 * amplitudeMultiplier; // Q dip
        else if (period >= 2.5 && period < 3) yOffset = -40 * amplitudeMultiplier; // R spike
        else if (period >= 3 && period < 3.5) yOffset = 15 * amplitudeMultiplier; // S dip
        else if (period > 5 && period < 6) yOffset = -15 * amplitudeMultiplier; // T wave
      }

      const y = baseY + yOffset;

      // Add to path
      pathRef.current.push({ x: x + xOffsetRef.current, y });

      // Keep only points that fit in width
      pathRef.current = pathRef.current.filter(p => (p.x - xOffsetRef.current) > 0);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw Grid
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i = 0; i < width; i+=20) {
        ctx.moveTo(i, 0); ctx.lineTo(i, height);
      }
      for(let i = 0; i < height; i+=20) {
        ctx.moveTo(0, i); ctx.lineTo(width, i);
      }
      ctx.stroke();

      // Draw Path
      ctx.beginPath();
      ctx.strokeStyle = skipBeat ? 'red' : '#00ff00';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (pathRef.current.length > 0) {
        ctx.moveTo(pathRef.current[0].x - xOffsetRef.current, pathRef.current[0].y);
        for (let i = 1; i < pathRef.current.length; i++) {
          ctx.lineTo(pathRef.current[i].x - xOffsetRef.current, pathRef.current[i].y);
        }
      }
      ctx.stroke();

      lastDrawRef.current = time;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [telemetry]);

  return (
    <div className="w-full h-full relative bg-black rounded-md overflow-hidden border border-gray-700/50 flex flex-col">
      <div className="absolute top-2 left-2 text-[10px] font-mono text-green-500 z-10 opacity-70">
        FPS: {telemetry.fps} | HEAP: {telemetry.heapUsage}MB | DELTA: {Math.round(telemetry.frameDelta)}ms
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={400}
        height={100}
        style={{ display: 'block' }}
      />
    </div>
  );
};
