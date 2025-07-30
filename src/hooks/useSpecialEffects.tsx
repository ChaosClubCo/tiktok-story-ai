import { useEffect, useCallback } from 'react';

interface SpecialEffect {
  type: 'confetti' | 'sparkle' | 'glow' | 'shake' | 'bounce' | 'pulse';
  element?: HTMLElement;
  duration?: number;
}

export const useSpecialEffects = () => {
  const createConfetti = useCallback(() => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 9999;
        pointer-events: none;
        border-radius: 50%;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }, []);

  const createSparkle = useCallback((x: number, y: number) => {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨'; // Use textContent instead of innerHTML to prevent XSS
    sparkle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      z-index: 9999;
      pointer-events: none;
      animation: sparkle-animation 1s ease-out forwards;
      font-size: 20px;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 1000);
  }, []);

  const addGlowEffect = useCallback((element: HTMLElement, duration = 2000) => {
    element.style.animation = `glow-effect ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }, []);

  const addShakeEffect = useCallback((element: HTMLElement, duration = 500) => {
    element.style.animation = `shake-effect ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }, []);

  const addBounceEffect = useCallback((element: HTMLElement, duration = 600) => {
    element.style.animation = `bounce-effect ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }, []);

  const addPulseEffect = useCallback((element: HTMLElement, duration = 1000) => {
    element.style.animation = `pulse-effect ${duration}ms ease-in-out infinite`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration * 3);
  }, []);

  const triggerRandomEffect = useCallback(() => {
    const effects = ['confetti', 'sparkle', 'glow', 'shake', 'bounce', 'pulse'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    
    switch (randomEffect) {
      case 'confetti':
        createConfetti();
        break;
      case 'sparkle':
        // Create sparkles at random positions
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createSparkle(
              Math.random() * window.innerWidth,
              Math.random() * window.innerHeight
            );
          }, i * 200);
        }
        break;
      case 'glow':
      case 'shake':
      case 'bounce':
      case 'pulse': {
        // Apply to random interactive elements
        const interactiveElements = document.querySelectorAll('button, [role="button"], .card');
        if (interactiveElements.length > 0) {
          const randomElement = interactiveElements[Math.floor(Math.random() * interactiveElements.length)] as HTMLElement;
          if (randomEffect === 'glow') addGlowEffect(randomElement);
          else if (randomEffect === 'shake') addShakeEffect(randomElement);
          else if (randomEffect === 'bounce') addBounceEffect(randomElement);
          else if (randomEffect === 'pulse') addPulseEffect(randomElement);
        }
        break;
      }
    }
  }, [createConfetti, createSparkle, addGlowEffect, addShakeEffect, addBounceEffect, addPulseEffect]);

  useEffect(() => {
    // Add CSS animations to the document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      
      @keyframes sparkle-animation {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
      }
      
      @keyframes glow-effect {
        0%, 100% { box-shadow: 0 0 5px rgba(var(--primary), 0.3); }
        50% { box-shadow: 0 0 20px rgba(var(--primary), 0.8), 0 0 30px rgba(var(--primary), 0.4); }
      }
      
      @keyframes shake-effect {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes bounce-effect {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse-effect {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Set up random effects
    const intervals: NodeJS.Timeout[] = [];
    
    // Random effects every 15-45 seconds
    const scheduleRandomEffect = () => {
      const delay = 15000 + Math.random() * 30000; // 15-45 seconds
      const timeout = setTimeout(() => {
        triggerRandomEffect();
        scheduleRandomEffect(); // Schedule the next one
      }, delay);
      intervals.push(timeout);
    };
    
    // Start the first random effect
    scheduleRandomEffect();
    
    // Add sparkles on clicks occasionally
    const handleClick = (e: MouseEvent) => {
      if (Math.random() < 0.1) { // 10% chance
        createSparkle(e.clientX, e.clientY);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      intervals.forEach(clearTimeout);
      document.removeEventListener('click', handleClick);
    };
  }, [triggerRandomEffect, createSparkle]);

  return {
    createConfetti,
    createSparkle,
    addGlowEffect,
    addShakeEffect,
    addBounceEffect,
    addPulseEffect,
    triggerRandomEffect,
  };
};