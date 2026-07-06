import { useState, useEffect } from "react";
import { useLottie } from "lottie-react";
import explosionAnimation from "../../assets/animations/explosion.json";

/**
 * ExplosionEffect - Animação Lottie de explosão posicionada sobre um navio afundado.
 *
 * Props:
 * - x: posição left em px (relativa ao grid de células)
 * - y: posição top em px (relativa ao grid de células)
 * - width: largura da área do navio
 * - height: altura da área do navio
 * - onComplete: callback quando a animação terminar
 */
function ExplosionEffect({ x = 0, y = 0, width = 100, height = 100, onComplete }) {
  const [visible, setVisible] = useState(true);

  const { View } = useLottie({
    animationData: explosionAnimation,
    loop: false,
    autoplay: true,
    onComplete: () => {
      setVisible(false);
      onComplete?.();
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  // Make the explosion a bit bigger than the ship for visual impact
  const padding = 20;
  const explosionSize = Math.max(width, height) + padding * 2;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${x + width / 2 - explosionSize / 2}px`,
        top: `${y + height / 2 - explosionSize / 2}px`,
        width: `${explosionSize}px`,
        height: `${explosionSize}px`,
      }}
    >
      {View}
    </div>
  );
}

export default ExplosionEffect;
