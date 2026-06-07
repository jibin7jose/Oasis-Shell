import React, { useRef, useEffect } from 'react';
import { useSystemStore } from '../../lib/systemStore';

export const NeuralMesh: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get live CPU usage to drive the animation speed
  const telemetry = useSystemStore(state => state.hardwareTelemetry);
  const cpuUsage = telemetry ? telemetry.cpu_usage : 10;
  
  // Calculate speed multiplier based on CPU (base speed + up to 5x faster on high load)
  const speedMultiplier = 1 + (cpuUsage / 100) * 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseColor: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5 + 0.5;
        // Mostly blue/indigo, some bright accents
        const colors = ['#6366f1', '#4f46e5', '#818cf8', '#38bdf8', '#a78bfa'];
        this.baseColor = colors[Math.floor(Math.random() * colors.length)];
      }

      update(currentSpeedMultiplier: number) {
        this.x += this.vx * currentSpeedMultiplier;
        this.y += this.vy * currentSpeedMultiplier;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Opacity fades as distance increases
            const opacity = 1 - distance / 120;
            // Shift line color slightly towards red if speed/CPU is high
            const r = Math.min(255, 99 + (speedMultiplier * 20));
            const g = 102;
            const b = 241;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle) => {
        particle.update(speedMultiplier);
        particle.draw(ctx);
      });
      
      drawLines();
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{ opacity: 0.6 }}
    />
  );
};
