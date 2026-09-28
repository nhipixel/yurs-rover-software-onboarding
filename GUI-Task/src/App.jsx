import { useState } from 'react';
import URDFViewer from './URDFViewer.jsx';

export default function App() {
  // This working example shows the React pattern needed for the rest of the task:
  // state stores a value, and the input updates that state when it changes.
  const [brightness, setBrightness] = useState(1);

  return (
    <main className="app" aria-label="Interactive Rover 3D model">
      <section className="viewer">
        {/* TODO: Replace the fixed zoom value with your own React state. */}
        <URDFViewer brightness={brightness} zoom={0.5} />
      </section>

      <section className="controls" aria-labelledby="controls-heading">
        <h1 id="controls-heading">Rover viewer controls</h1>

        <label htmlFor="brightness">
          Brightness: <output>{brightness}</output>
        </label>
        <input
          id="brightness"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={brightness}
          onChange={(event) => setBrightness(Number(event.target.value))}
        />

        {/* TODO: Add the Zoom control and profile buttons below. */}
      </section>
    </main>
  );
}
