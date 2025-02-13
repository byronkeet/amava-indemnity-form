import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSign: (signature: string) => void;
  clearText: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSign, clearText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size based on its display size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Set initial canvas styles
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setLastX(coords.x);
    setLastY(coords.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setLastX(coords.x);
    setLastY(coords.y);
    setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (hasSignature) {
      const canvas = canvasRef.current;
      if (canvas) {
        const signature = canvas.toDataURL();
        if (signature !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NgAAIAAAUAAR4f7BQAAAAASUVORK5CYII=') {
          onSign(signature);
        }
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onSign('');
    }
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          height={200}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={() => setIsDrawing(false)}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      <div>
        <button
          onClick={clearSignature}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 
                   hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm sm:text-base"
        >
          {clearText}
        </button>
      </div>
    </div>
  );
};