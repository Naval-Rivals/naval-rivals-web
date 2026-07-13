import { useState, useEffect } from "react";
import { useLottie } from "lottie-react";
import shotAnimation from "../../assets/animations/shot.json";

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

  const { View } = useLottie({
    animationData: shotAnimation,
    loop: false,
    autoplay: true,
    onComplete: () => {
      setVisible(false);
      onComplete?.();
    },
  });

  // Fallback timeout to ensure onComplete fires even if lottie glitches
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
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
