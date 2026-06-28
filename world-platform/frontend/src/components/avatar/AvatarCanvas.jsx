import { useEffect, useRef } from 'react';

const SKIN_TONES = { light: '#fde8d0', medium: '#d4a574', tan: '#c68642', dark: '#6b3f1e' };
const HAIR_COLORS = { black: '#1a1a1a', brown: '#6b3f1e', blonde: '#f5d35e', red: '#c0392b', white: '#f0f0f0', pink: '#f06292', blue: '#1976d2' };

export default function AvatarCanvas({ config = {}, size = 96, animated = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const S = size / 32; // scale factor (design at 32x32)

    ctx.clearRect(0, 0, size, size);

    const skin = SKIN_TONES[config.skinTone] || SKIN_TONES.medium;
    const hair = HAIR_COLORS[config.hairColor] || HAIR_COLORS.black;
    const topColor = config.clothing?.topColor || '#6366f1';
    const bottomColor = config.clothing?.bottomColor || '#1e3a5f';
    const shoeColor = config.clothing?.shoesColor || '#fff';

    const px = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * S, y * S, w * S, h * S);
    };

    // Shoes
    px(11, 28, 4, 3, shoeColor);
    px(17, 28, 4, 3, shoeColor);

    // Legs
    px(11, 22, 4, 6, bottomColor);
    px(17, 22, 4, 6, bottomColor);

    // Body / top
    px(9, 14, 14, 8, topColor);
    // Arms
    px(6, 14, 3, 7, topColor);
    px(23, 14, 3, 7, topColor);
    // Hands
    px(6, 21, 3, 2, skin);
    px(23, 21, 3, 2, skin);

    // Neck
    px(14, 12, 4, 2, skin);
    // Head
    px(10, 4, 12, 10, skin);

    // Eyes
    const eyeColor = config.facialFeatures?.eyesColor || 'brown';
    const eyeColors = { brown: '#6b3f1e', blue: '#1976d2', green: '#2e7d32', black: '#111', purple: '#7b1fa2' };
    px(12, 8, 2, 2, eyeColors[eyeColor] || '#1a1a1a');
    px(18, 8, 2, 2, eyeColors[eyeColor] || '#1a1a1a');
    // Eye whites
    px(11, 8, 1, 2, '#fff');
    px(17, 8, 1, 2, '#fff');

    // Mouth
    const mouth = config.facialFeatures?.mouth || 'smile';
    if (mouth === 'smile') { px(13, 12, 6, 1, '#c0392b'); px(12, 11, 1, 1, '#c0392b'); px(19, 11, 1, 1, '#c0392b'); }
    else if (mouth === 'neutral') { px(13, 12, 6, 1, '#999'); }
    else { px(13, 10, 6, 2, '#c0392b'); }

    // Hair
    const style = config.hairStyle || 'short';
    if (style === 'short') {
      px(10, 2, 12, 4, hair); px(8, 4, 2, 3, hair); px(22, 4, 2, 3, hair);
    } else if (style === 'long') {
      px(10, 2, 12, 4, hair); px(8, 4, 2, 3, hair); px(22, 4, 2, 3, hair);
      px(8, 7, 2, 8, hair); px(22, 7, 2, 8, hair);
    } else if (style === 'curly') {
      px(9, 2, 14, 5, hair); px(7, 4, 2, 4, hair); px(23, 4, 2, 4, hair);
      px(8, 8, 2, 2, hair); px(22, 8, 2, 2, hair);
    } else if (style === 'spiky') {
      px(10, 0, 2, 4, hair); px(13, 0, 2, 4, hair); px(16, 0, 2, 4, hair); px(19, 0, 2, 4, hair);
      px(10, 2, 12, 3, hair); px(8, 3, 2, 3, hair); px(22, 3, 2, 3, hair);
    } else {
      px(10, 2, 12, 4, hair); px(8, 4, 2, 3, hair); px(22, 4, 2, 3, hair);
    }

    // Hat
    const hat = config.accessories?.hat;
    if (hat === 'cap') {
      px(8, 1, 16, 3, '#e53e3e'); px(7, 4, 3, 1, '#e53e3e');
    } else if (hat === 'crown') {
      px(9, 0, 2, 3, '#f5d35e'); px(13, 0, 2, 4, '#f5d35e'); px(17, 0, 2, 3, '#f5d35e'); px(9, 2, 12, 2, '#f5d35e');
    } else if (hat === 'beanie') {
      px(10, 0, 12, 4, '#3949ab'); px(8, 3, 2, 3, '#3949ab');
    }

    // Glasses
    const glasses = config.accessories?.glasses;
    if (glasses === 'sunglasses') {
      px(11, 8, 4, 2, '#555'); px(17, 8, 4, 2, '#555'); px(15, 9, 2, 1, '#333');
    } else if (glasses === 'frames') {
      ctx.strokeStyle = '#333'; ctx.lineWidth = S;
      ctx.strokeRect(11 * S, 7 * S, 4 * S, 3 * S);
      ctx.strokeRect(17 * S, 7 * S, 4 * S, 3 * S);
      px(15, 8, 2, 1, '#333');
    }

    // Backpack
    if (config.accessories?.backpack === 'yes') {
      px(5, 15, 3, 6, '#8d6e63'); px(5, 14, 3, 1, '#5d4037');
    }
  }, [config, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  );
}
