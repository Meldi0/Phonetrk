import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useStrip } from '../../../src/hooks/useStrip.js';
import { IMAGE_FRAMES } from '../../../src/lib/imageFrames.js';

// Filled by the browser tests; no camera, location, backend or network fixture data.
window.mountStripFixture = function (photos) {
  function Fixture() {
    const [style, setStyle] = useState({ template: 'frame-kiki-moon-2cut' });
    const strip = useStrip(photos, 'natural', null, null, style, false, 1789315200000);
    window.fixture = { strip, choose: template => setStyle({ template }) };
    return <><select aria-label="Frame" value={style.template} onChange={e => setStyle({ template: e.target.value })}>
      {IMAGE_FRAMES.filter(f => f.slots.length === photos.length).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
    </select><output data-ready={strip.ready}>{strip.error || style.template}</output>
    {strip.result && <img style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block' }} src={strip.result.url} alt="Frame preview" />}</>;
  }
  createRoot(document.getElementById('root')).render(<Fixture />);
};
