import { logoSrc } from '../utils/logo';

// Small round/square logo thumbnail with a graceful fallback when no logo is set.
export default function LogoBadge({ base64, alt, size = 32, shape = 'circle', fallback = '⚽' }) {
  const src = logoSrc(base64);
  const style = {
    width: size,
    height: size,
    objectFit: 'cover',
    borderRadius: shape === 'circle' ? '50%' : 8,
    border: '1px solid rgba(0,0,0,0.08)',
    flexShrink: 0,
  };

  if (!src) {
    return (
      <span
        className="d-inline-flex align-items-center justify-content-center bg-light text-muted"
        style={{ ...style, fontSize: size * 0.55 }}
        aria-hidden="true"
      >
        {fallback}
      </span>
    );
  }

  return <img src={src} alt={alt || 'Logo'} style={style} />;
}
