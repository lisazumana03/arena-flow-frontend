import { useState } from 'react';
import CountrySelect from '../components/CountrySelect';

// Standalone demo of the CountrySelect combobox. The same component is now used inline
// wherever a country/nationality is picked — Player nationality, Owner nationality — so
// this page mostly exists as a quick way to try it in isolation.
export default function CountrySelector() {
  const [value, setValue] = useState('');

  return (
    <div className="container py-4" style={{ maxWidth: 400 }}>
      <h1 className="h4 mb-3">Country picker</h1>
      <label className="form-label" htmlFor="country-demo">Country</label>
      <CountrySelect id="country-demo" value={value} onChange={setValue} />
      {value && <p className="text-muted small mt-2">Selected: {value}</p>}
    </div>
  );
}
