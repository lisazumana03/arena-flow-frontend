// Logo helpers shared by Teams and Tournaments. Both backend entities store logos as a
// raw byte[] (Jackson base64-encodes/decodes byte[] <-> JSON string automatically), so
// everything here works in plain base64 strings with no data: prefix — that prefix gets
// added only when rendering (see LogoBadge) and stripped before sending to the API.

export const LOGO_SIZE = 1000;

function base64FromDataUrl(dataUrl) {
  return dataUrl.split(',')[1];
}

// Resize/crop an uploaded image file to a square LOGO_SIZE x LOGO_SIZE canvas (center-crop
// to cover, matching how a badge/crest is typically displayed) and return it as a plain
// base64 PNG string.
export function fileToSquareLogoBase64(file, size = LOGO_SIZE) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      img.onerror = () => reject(new Error('Could not decode the selected file as an image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(base64FromDataUrl(canvas.toDataURL('image/png')));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Generate a simple crest client-side: a shape, two colours, and up to 3 initials.
// Returns a plain base64 PNG string at LOGO_SIZE x LOGO_SIZE.
export function generateCrestBase64({ shape = 'shield', bgColor = '#146c34', fgColor = '#f5f7f2', initials = 'FC' }, size = LOGO_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  const pad = size * 0.06;
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = fgColor;
  ctx.lineWidth = size * 0.02;

  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(size / 2, size / 2, size / 2 - pad, 0, Math.PI * 2);
  } else if (shape === 'hexagon') {
    const r = size / 2 - pad;
    const cx = size / 2;
    const cy = size / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    // shield
    const w = size - pad * 2;
    const x0 = pad, y0 = pad;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + w, y0);
    ctx.lineTo(x0 + w, y0 + w * 0.55);
    ctx.quadraticCurveTo(x0 + w, y0 + w * 0.95, x0 + w / 2, y0 + w * 1.15);
    ctx.quadraticCurveTo(x0, y0 + w * 0.95, x0, y0 + w * 0.55);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = fgColor;
  ctx.font = `bold ${size * 0.34}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials.slice(0, 3).toUpperCase(), size / 2, size * 0.54);

  return base64FromDataUrl(canvas.toDataURL('image/png'));
}

export function logoSrc(base64) {
  return base64 ? `data:image/png;base64,${base64}` : null;
}

// Suggest initials from a name, e.g. "Cape Town City FC" -> "CTC"
export function suggestInitials(name) {
  if (!name) return 'FC';
  const words = name.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const letters = words.map((w) => w[0]).join('');
  return (letters || name.slice(0, 2)).slice(0, 3).toUpperCase();
}
