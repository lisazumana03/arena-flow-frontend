import { useState } from 'react';
import { fileToSquareLogoBase64, generateCrestBase64, logoSrc, suggestInitials, LOGO_SIZE } from '../utils/logo';
import LogoBadge from './LogoBadge';

const SHAPES = [
  { value: 'shield', label: 'Shield' },
  { value: 'circle', label: 'Circle' },
  { value: 'hexagon', label: 'Hexagon' },
];

// Lets the user either upload their own image (auto center-cropped/resized to 1000x1000)
// or design a simple crest in-app (shape + colours + initials). Either way, `onChange`
// receives a plain base64 PNG string ready to send straight to the backend.
export default function LogoPicker({ value, onChange, suggestedName }) {
  const [mode, setMode] = useState('upload');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [crest, setCrest] = useState({
    shape: 'shield',
    bgColor: '#146c34',
    fgColor: '#f5f7f2',
    initials: suggestInitials(suggestedName),
  });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const base64 = await fileToSquareLogoBase64(file);
      onChange(base64);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const applyCrest = (next = crest) => {
    onChange(generateCrestBase64(next));
  };

  const updateCrest = (patch) => {
    const next = { ...crest, ...patch };
    setCrest(next);
    applyCrest(next);
  };

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-3">
        <LogoBadge base64={value} size={72} shape="circle" />
        <div>
          <div className="btn-group btn-group-sm" role="group">
            <button type="button" className={`btn ${mode === 'upload' ? 'btn-pitch' : 'btn-outline-pitch'}`} onClick={() => setMode('upload')}>
              Upload image
            </button>
            <button type="button" className={`btn ${mode === 'generate' ? 'btn-pitch' : 'btn-outline-pitch'}`} onClick={() => { setMode('generate'); applyCrest(); }}>
              Create your own
            </button>
          </div>
          {value && (
            <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => onChange(null)}>
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger py-1 px-2 small">{error}</div>}

      {mode === 'upload' && (
        <div>
          <input type="file" accept="image/*" className="form-control form-control-sm" onChange={handleFile} disabled={busy} />
          <div className="form-text">Any image works — it's automatically center-cropped and resized to {LOGO_SIZE}×{LOGO_SIZE}.</div>
        </div>
      )}

      {mode === 'generate' && (
        <div className="row g-2 align-items-end">
          <div className="col-sm-3">
            <label className="form-label small">Shape</label>
            <select className="form-select form-select-sm" value={crest.shape} onChange={(e) => updateCrest({ shape: e.target.value })}>
              {SHAPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="col-sm-3">
            <label className="form-label small">Initials</label>
            <input
              className="form-control form-control-sm"
              maxLength={3}
              value={crest.initials}
              onChange={(e) => updateCrest({ initials: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="col-sm-3">
            <label className="form-label small">Background</label>
            <input type="color" className="form-control form-control-sm form-control-color w-100" value={crest.bgColor} onChange={(e) => updateCrest({ bgColor: e.target.value })} />
          </div>
          <div className="col-sm-3">
            <label className="form-label small">Emblem colour</label>
            <input type="color" className="form-control form-control-sm form-control-color w-100" value={crest.fgColor} onChange={(e) => updateCrest({ fgColor: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}
