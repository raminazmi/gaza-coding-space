import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

export function useDominantColorBackground(imageUrl: string | undefined, fallbackGradient = "linear-gradient(to right, #1e4f94, #00f2ff)") {
  const [background, setBackground] = useState<string>(fallbackGradient);

  useEffect(() => {
    if (!imageUrl || imageUrl === 'public/assets/images.jpeg') {
      setBackground(fallbackGradient);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const fac = new FastAverageColor();
        const color = fac.getColor(img).value;
        setBackground(
          `linear-gradient(90deg, rgba(${color[0]},${color[1]},${color[2]},0.95) 60%, rgba(255,255,255,0.7) 100%)`
        );
      } catch (err) {
        setBackground(fallbackGradient);
      }
    };
    img.onerror = () => setBackground(fallbackGradient);
  }, [imageUrl, fallbackGradient]);

  return background;
}