import React from 'react';
import { BREAKDOWN_STEPS, COMPONENT_ASSEMBLIES } from '../data/modelMetadata';

export default function ControlsOverlay({
  mode,
  setMode,
  breakdownProgress,
  setBreakdownProgress,
  isPlaying,
  setIsPlaying,
  currentStep,
  setCurrentStep,
  selectedAssemblyId,
  setSelectedAssemblyId,
  showLabels,
  setShowLabels,
  wireframe,
  setWireframe,
  autoRotate,
  setAutoRotate,
  onResetCamera,
  onSetCameraPreset,
  onRestoreAssembly,
  prefersReducedMotion,
  onSimulateError
}) {
  const isBreakdown = mode === 'breakdown';

  const handleStepChange = (targetStep) => {
    const clamped = Math.max(0, Math.min(BREAKDOWN_STEPS.length - 1, targetStep));
    setCurrentStep(clamped);
    const stepObj = BREAKDOWN_STEPS[clamped];
    if (stepObj) {
      setBreakdownProgress(stepObj.progress);
    }
  };

  const handleScrubberChange = (e) => {
    const val = parseFloat(e.target.value);
    setBreakdownProgress(val);
    // Find closest step
    let closest = 0;
    let minDiff = 1.0;
    BREAKDOWN_STEPS.forEach((s, idx) => {
      const diff = Math.abs(s.progress - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    });
    setCurrentStep(closest);
  };

  return (
    <div className="controls-overlay" role="region" aria-label="3D Exhibit Controls">
      {/* Top Bar: Mode switcher and quick camera actions */}
      <div className="top-control-bar">
        <div className="mode-segmented-control" role="tablist" aria-label="Inspection Modes">
          <button
            role="tab"
            aria-selected={!isBreakdown}
            className={`mode-btn ${!isBreakdown ? 'active' : ''}`}
            onClick={() => {
              setMode('standard');
              setIsPlaying(false);
            }}
          >
            <span className="mode-icon">🛰️</span> Standard Inspection
          </button>
          <button
            role="tab"
            aria-selected={isBreakdown}
            className={`mode-btn ${isBreakdown ? 'active' : ''}`}
            onClick={() => setMode('breakdown')}
          >
            <span className="mode-icon">⚙️</span> Mechanical Breakdown
          </button>
        </div>

        <div className="quick-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onResetCamera}
            title="Reset view to default 45° perspective (Key: R)"
            aria-label="Reset camera view"
          >
            ↺ Reset Camera
          </button>

          <button
            className={`btn btn-secondary btn-sm ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle continuous rotation (Key: A)"
            aria-label="Toggle auto rotate"
            aria-pressed={autoRotate}
          >
            {autoRotate ? '⏸ Stop Orbit' : '▶ Auto Orbit'}
          </button>

          <button
            className={`btn btn-secondary btn-sm ${wireframe ? 'active' : ''}`}
            onClick={() => setWireframe(!wireframe)}
            title="Toggle polygonal mesh wireframe"
            aria-label="Toggle wireframe mode"
            aria-pressed={wireframe}
          >
            🕸 Wireframe
          </button>
        </div>
      </div>

      {/* Reduced motion badge notice */}
      {prefersReducedMotion && (
        <div className="motion-notice" role="status">
          <span className="motion-icon">♿</span>
          <span>Prefers-Reduced-Motion active: Animations snap instantaneously, auto-rotation paused.</span>
        </div>
      )}

      {/* Bottom Center Bar: Mechanical Breakdown Scrubber & Controls */}
      {isBreakdown && (
        <div className="breakdown-panel" role="region" aria-label="Mechanical Breakdown Controller">
          <div className="breakdown-header">
            <div className="breakdown-title-row">
              <span className="badge badge-accent">ILLUSTRATIVE BREAKDOWN</span>
              <span className="step-label">
                Step {currentStep}: {BREAKDOWN_STEPS[currentStep]?.label} ({Math.round(breakdownProgress * 100)}%)
              </span>
            </div>
            <p className="step-desc">
              {BREAKDOWN_STEPS[currentStep]?.description}
            </p>
          </div>

          {/* Scrubber Range Input */}
          <div className="scrubber-row">
            <label htmlFor="breakdown-scrubber" className="visually-hidden">
              Breakdown Exploded View Scrubber
            </label>
            <span className="scrubber-edge-label">Assembled (0%)</span>
            <input
              id="breakdown-scrubber"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={breakdownProgress}
              onChange={handleScrubberChange}
              className="scrubber-slider"
              aria-valuenow={Math.round(breakdownProgress * 100)}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuetext={`${Math.round(breakdownProgress * 100)} percent exploded`}
            />
            <span className="scrubber-edge-label">Exploded (100%)</span>
          </div>

          {/* Stepper & Playback Toolbar */}
          <div className="breakdown-toolbar">
            <div className="step-controls">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStepChange(currentStep - 1)}
                disabled={currentStep === 0}
                aria-label="Previous breakdown step (Key: [)"
                title="Previous step (Key: [)"
              >
                ◀ Prev Step
              </button>

              <button
                className={`btn btn-primary btn-sm ${isPlaying ? 'playing' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause breakdown animation' : 'Play breakdown animation'}
                title="Play/Pause continuous breakdown animation (Key: Space)"
              >
                {isPlaying ? '⏸ Pause' : '▶ Animate'}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={currentStep === BREAKDOWN_STEPS.length - 1}
                aria-label="Next breakdown step (Key: ])"
                title="Next step (Key: ])"
              >
                Next Step ▶
              </button>
            </div>

            <div className="restore-controls">
              <button
                className="btn btn-restore btn-sm"
                onClick={onRestoreAssembly}
                aria-label="Restore and reassemble spacecraft parts"
                title="Restore all parts to original assembled configuration"
              >
                🛡 Reassemble Spacecraft
              </button>

              <label className="checkbox-label" title="Toggle visible 3D labels on assemblies">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                Component Labels
              </label>
            </div>
          </div>

          {/* Assembly selector pills */}
          <div className="assembly-pills" role="radiogroup" aria-label="Select Assembly Highlight">
            <span className="pills-label">Inspect Part:</span>
            {COMPONENT_ASSEMBLIES.map((comp) => (
              <button
                key={comp.id}
                role="radio"
                aria-checked={selectedAssemblyId === comp.id}
                className={`pill-btn ${selectedAssemblyId === comp.id ? 'active' : ''}`}
                onClick={() => setSelectedAssemblyId(selectedAssemblyId === comp.id ? null : comp.id)}
              >
                {comp.shortName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Viewpoint Presets on Bottom Left */}
      <div className="camera-presets-dock" aria-label="Camera Angle Presets">
        <span className="dock-title">Camera Angles:</span>
        <div className="preset-buttons">
          <button className="btn btn-xs" onClick={() => onSetCameraPreset('perspective')}>Perspective</button>
          <button className="btn btn-xs" onClick={() => onSetCameraPreset('front')}>Front View</button>
          <button className="btn btn-xs" onClick={() => onSetCameraPreset('top')}>Top View</button>
          <button className="btn btn-xs" onClick={() => onSetCameraPreset('gear')}>Landing Gear</button>
          <button className="btn btn-xs" onClick={() => onSetCameraPreset('cabin')}>Ascent Cabin</button>
        </div>
      </div>

      {/* Verification & Error Test Trigger */}
      <div className="dev-test-dock">
        <button
          className="btn btn-xs btn-outline-danger"
          onClick={onSimulateError}
          title="Verify prototype error screen handling"
        >
          🧪 Test Error State
        </button>
      </div>
    </div>
  );
}
