import { useState, useEffect, useRef } from "react";
import { useLottie } from "lottie-react";
import shotAnimation from "../../assets/animations/shot.json";
import shotAudio from "../../assets/audio/shoot.mp3";

/**
 * ShotEffect - Animação Lottie de tiro posicionada sobre uma célula do tabuleiro.
 *
 * Props:
 * - x: posição left em px (relativa ao grid de células)
 * - y: posição top em px (relativa ao grid de células)
 * - onComplete: callback quando a animação terminar
 */
function ShotEffect({ x = 0, y = 0, onComplete }) {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef(null);

  const { View } = useLottie({
    animationData: shotAnimation,
    loop: false,
    autoplay: true,
    onComplete: () => {
      setVisible(false);
      onComplete?.();
    },
  });

  // Play audio using native Audio API (immediate, no loading delay)
  useEffect(() => {
    const audio = new Audio(shotAudio);
    audio.volume = 0.3;
    audio.play().catch(() => {});
    audioRef.current = audio;

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1200);
    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  if (!visible) return null;

  const size = 50;
  const cellSize = 33;
  const offset = (size - cellSize) / 2;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{
        left: `${x - offset}px`,
        top: `${y - offset}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {View}
    </div>
  );
}

export default ShotEffect;
