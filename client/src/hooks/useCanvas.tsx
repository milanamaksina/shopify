import { useEffect, useRef } from "react";

const useCanvas = (img: string): React.RefObject<HTMLCanvasElement> => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();

    const loadImage = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.drawImage(image, 0, 0);
        }
      }
    };

    image.addEventListener("load", loadImage);

    image.src = img;

    return () => {
      image.removeEventListener("load", loadImage);
    };
  }, [img]);

  return canvasRef;
};

export default useCanvas;
