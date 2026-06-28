const SKIN_TONES = { light: '#fde8d0', medium: '#d4a574', tan: '#c68642', dark: '#6b3f1e' };
const HAIR_COLORS = { black: '#1a1a1a', brown: '#6b3f1e', blonde: '#f5d35e', red: '#c0392b', white: '#f0f0f0', pink: '#f06292', blue: '#1976d2' };

export const renderAvatarToCanvas = (canvas, config, direction = 'down') => {
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 32, 32);

  const skin = SKIN_TONES[config.skinTone] || SKIN_TONES.medium;
  const hair = HAIR_COLORS[config.hairColor] || HAIR_COLORS.black;
  const topColor = config.clothing?.topColor || '#6366f1';
  const bottomColor = config.clothing?.bottomColor || '#1e3a5f';

  const px = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

  const mirrorX = (x, w) => 31 - x - w;
  const drawRect = (x, y, w, h, color) => {
    if (direction === 'right') {
      px(mirrorX(x, w), y, w, h, color);
    } else {
      px(x, y, w, h, color);
    }
  };

  const headX = direction === 'right' ? 11 : 5;
  const bodyX = direction === 'right' ? 13 : 3;
  const armLeftX = direction === 'right' ? 20 : 0;
  const armRightX = direction === 'right' ? 0 : 17;
  const legLeftX = direction === 'right' ? 13 : 5;
  const legRightX = direction === 'right' ? 19 : 11;
  const feetLeftX = direction === 'right' ? 13 : 5;
  const feetRightX = direction === 'right' ? 19 : 11;

  if (direction === 'up') {
    // Back view: head + hair dominate, body is simpler.
    px(5, 5, 12, 9, topColor);
    px(0, 14, 3, 7, topColor); px(17, 14, 3, 7, topColor);
    px(5, 22, 4, 6, bottomColor); px(11, 22, 4, 6, bottomColor);
    px(5, 28, 4, 4, '#888'); px(11, 28, 4, 4, '#888');
    px(5, 1, 12, 6, hair); px(3, 4, 2, 3, hair); px(17, 4, 2, 3, hair);
    return;
  }

  if (direction === 'down') {
    px(5, 28, 4, 4, '#888'); px(11, 28, 4, 4, '#888'); // feet
    px(5, 22, 4, 6, bottomColor); px(11, 22, 4, 6, bottomColor); // legs
    px(3, 14, 14, 8, topColor); // body
    px(0, 14, 3, 7, topColor); px(17, 14, 3, 7, topColor); // arms
    px(6, 12, 4, 2, skin); // neck
    px(5, 4, 12, 10, skin); // head
    px(7, 8, 2, 2, '#111'); px(13, 8, 2, 2, '#111'); // eyes
    px(7, 12, 8, 1, '#c0392b'); // mouth
    px(5, 2, 12, 4, hair); px(3, 4, 2, 3, hair); px(17, 4, 2, 3, hair); // hair
  } else {
    // Side view: make the avatar visibly face left/right.
    drawRect(bodyX, 14, 12, 8, topColor);
    drawRect(armLeftX, 14, 4, 7, topColor);
    drawRect(armRightX, 14, 4, 7, topColor);
    drawRect(legLeftX, 22, 4, 6, bottomColor);
    drawRect(legRightX, 22, 4, 6, bottomColor);
    drawRect(feetLeftX, 28, 4, 4, '#888');
    drawRect(feetRightX, 28, 4, 4, '#888');
    drawRect(headX, 4, 10, 10, skin);
    drawRect(direction === 'right' ? 15 : 7, 8, 2, 2, '#111');
    drawRect(direction === 'right' ? 13 : 9, 12, 6, 1, '#c0392b');
    drawRect(direction === 'right' ? 10 : 5, 2, 12, 4, hair);
    drawRect(direction === 'right' ? 9 : 3, 4, 2, 3, hair);
    drawRect(direction === 'right' ? 21 : 17, 4, 2, 3, hair);
  }

  if (config.accessories?.hat === 'cap') { px(direction === 'right' ? 3 : 3, 1, 16, 3, '#e53e3e'); }
  if (config.accessories?.hat === 'crown') {
    px(5, 0, 2, 3, '#f5d35e'); px(9, 0, 2, 4, '#f5d35e'); px(13, 0, 2, 3, '#f5d35e'); px(5, 2, 10, 2, '#f5d35e');
  }
};
