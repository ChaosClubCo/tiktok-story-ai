import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const CinematicHeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Film grain animation
    const drawFilmGrain = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 15;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = value;
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const animate = () => {
      drawFilmGrain();
      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", setCanvasSize);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Gradient Mesh */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, hsl(346 77% 49.8% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, hsl(263 70% 50.4% / 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, hsl(199 89% 48% / 0.08) 0%, transparent 60%),
            linear-gradient(135deg, hsl(240 10% 3.9%), hsl(240 8% 8%))
          `,
        }}
        animate={{
          backgroundPosition: [
            "20% 30%, 80% 70%, 50% 50%, 0% 0%",
            "30% 40%, 70% 60%, 60% 40%, 100% 100%",
            "20% 30%, 80% 70%, 50% 50%, 0% 0%",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Film Grain Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
      />

      {/* Floating Script Cards */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-card/5 backdrop-blur-sm border border-border/20 rounded-lg p-4 text-xs text-muted-foreground"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 30}%`,
              width: "120px",
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <div className="font-mono text-[8px] leading-relaxed">
              POV: You discover...
              <br />
              Episode {i + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cinematic Light Rays */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-0 top-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(346 77% 49.8% / 0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-0 top-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(263 70% 50.4% / 0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Spotlight Gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, transparent 0%, hsl(240 10% 3.9% / 0.6) 100%)",
        }}
      />
    </div>
  );
};
