import React, { useState } from 'react';
import {
  ASSET_PROVENANCE,
  GEOMETRY_ANALYSIS,
  BREAKDOWN_LIMITATION_STATEMENT,
  OBJECT_INFORMATION,
  COMPONENT_ASSEMBLIES
} from '../data/modelMetadata';

export default function InfoPanel({
  selectedAssemblyId,
  setSelectedAssemblyId,
  isOpen,
  setIsOpen
}) {
  const [activeTab, setActiveTab] = useState('object-info'); // 'object-info' | 'breakdown' | 'provenance' | 'shortcuts'

  const selectedAssembly = COMPONENT_ASSEMBLIES.find(a => a.id === selectedAssemblyId);

  return (
    <aside
      className={`info-panel ${isOpen ? 'open' : 'collapsed'}`}
      aria-label="Exhibit Curatorial and Technical Information"
    >
      {/* Panel Toggle Handle */}
      <button
        className="panel-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse exhibit information panel' : 'Expand exhibit information panel'}
      >
        <span className="toggle-icon">{isOpen ? '▶' : '◀'}</span>
        <span className="toggle-text">{isOpen ? 'Hide Panel' : 'Exhibit Details & Verification'}</span>
      </button>

      {isOpen && (
        <div className="panel-inner">
          {/* Header */}
          <div className="panel-header">
            <span className="panel-kicker">EXHIBIT CURATORIAL DOSSIER</span>
            <h1 className="panel-title">{OBJECT_INFORMATION.exhibitName}</h1>
            <p className="panel-classification">{OBJECT_INFORMATION.curatorialClassification}</p>
          </div>

          {/* Tab Navigation */}
          <nav className="panel-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'object-info'}
              className={`tab-btn ${activeTab === 'object-info' ? 'active' : ''}`}
              onClick={() => setActiveTab('object-info')}
            >
              📋 Object Info
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'breakdown'}
              className={`tab-btn ${activeTab === 'breakdown' ? 'active' : ''}`}
              onClick={() => setActiveTab('breakdown')}
            >
              ⚙️ Breakdown Limits
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'provenance'}
              className={`tab-btn ${activeTab === 'provenance' ? 'active' : ''}`}
              onClick={() => setActiveTab('provenance')}
            >
              🏛 Provenance & Sources
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'shortcuts'}
              className={`tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              ⌨️ Shortcuts
            </button>
          </nav>

          <div className="panel-content" tabIndex={0}>
            {/* Selected Component Inspector Card */}
            {selectedAssembly && (
              <div className="selected-component-card" role="region" aria-label="Selected Component Details">
                <div className="card-top">
                  <span className="badge badge-primary">{selectedAssembly.badge}</span>
                  <button
                    className="btn-close-sm"
                    onClick={() => setSelectedAssemblyId(null)}
                    aria-label="Close component selection"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="card-component-name">{selectedAssembly.name}</h3>
                <p className="card-component-desc">{selectedAssembly.description}</p>
                <div className="card-specs">
                  <div><strong>Visible Geometry:</strong> {selectedAssembly.visibleGeometry}</div>
                  <div><strong>Verification Status:</strong> <span className="text-warning">{selectedAssembly.verificationStatus}</span></div>
                </div>
              </div>
            )}

            {/* TAB 1: OBJECT INFO & NASA PLACEHOLDERS */}
            {activeTab === 'object-info' && (
              <section className="tab-pane" aria-label="Object Information">
                <div className="section-block">
                  <h3 className="section-heading">Verified Model Geometry</h3>
                  <div className="spec-grid">
                    {OBJECT_INFORMATION.verifiedFields.map((f, idx) => (
                      <div key={idx} className="spec-row verified">
                        <span className="spec-label">{f.label}:</span>
                        <span className="spec-value">{f.value}</span>
                        <span className="spec-status verified-badge">✓ Verified ({f.source})</span>
                      </div>
                    ))}
                    <div className="spec-row verified">
                      <span className="spec-label">Dimensions:</span>
                      <span className="spec-value">
                        Span: {GEOMETRY_ANALYSIS.dimensionsFormatted.width} × Height: {GEOMETRY_ANALYSIS.dimensionsFormatted.height}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="section-block">
                  <div className="section-title-with-badge">
                    <h3 className="section-heading">Mission History & Status</h3>
                    <span className="badge badge-unverified">NASA Citation Required</span>
                  </div>
                  <p className="section-note">
                    <strong>Notice:</strong> To maintain strict archival integrity, mission facts, coordinates, and operational records are not invented. The fields below require verification against official NASA primary mission documentation:
                  </p>

                  <div className="placeholders-list">
                    {OBJECT_INFORMATION.placeholderFields.map((field) => (
                      <div key={field.id} className="placeholder-card">
                        <div className="placeholder-header">
                          <span className="placeholder-label">{field.label}</span>
                          <span className="badge-pill-danger">{field.value}</span>
                        </div>
                        <div className="placeholder-body">
                          <div className="placeholder-candidates">
                            <span className="candidate-lead">Historical Candidates:</span> {field.candidateOptions}
                          </div>
                          <div className="placeholder-guide">
                            <strong>Verification Guide:</strong> {field.verificationGuide}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TAB 2: BREAKDOWN LIMITATIONS */}
            {activeTab === 'breakdown' && (
              <section className="tab-pane" aria-label="Mechanical Breakdown Limitations">
                <div className="alert-callout alert-warning">
                  <h3 className="callout-title">⚠️ {BREAKDOWN_LIMITATION_STATEMENT.title}</h3>
                  <p className="callout-subtitle">{BREAKDOWN_LIMITATION_STATEMENT.summary}</p>
                </div>

                <div className="limitations-body">
                  <h4>Curatorial Transparency Notice</h4>
                  <ul>
                    {BREAKDOWN_LIMITATION_STATEMENT.explanation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  <h4>Verified Visible Assemblies (7 Modules)</h4>
                  <p className="text-muted">
                    Click any assembly below to highlight it in the 3D viewport:
                  </p>
                  <div className="assemblies-interactive-list">
                    {COMPONENT_ASSEMBLIES.map((comp) => (
                      <button
                        key={comp.id}
                        className={`assembly-list-item ${selectedAssemblyId === comp.id ? 'active' : ''}`}
                        onClick={() => setSelectedAssemblyId(selectedAssemblyId === comp.id ? null : comp.id)}
                      >
                        <div className="item-title-row">
                          <span className="item-name">{comp.shortName}</span>
                          <span className="item-step-badge">Step {comp.step}</span>
                        </div>
                        <span className="item-desc">{comp.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TAB 3: PROVENANCE & NASA CITATION GUIDE */}
            {activeTab === 'provenance' && (
              <section className="tab-pane" aria-label="Provenance and Sources">
                <div className="section-block">
                  <h3 className="section-heading">3D Model Asset Attribution</h3>
                  <div className="provenance-grid">
                    <div className="prov-row">
                      <span className="prov-label">Supplied File:</span>
                      <span className="prov-value"><code>{ASSET_PROVENANCE.filename}</code></span>
                    </div>
                    <div className="prov-row">
                      <span className="prov-label">Asset Size:</span>
                      <span className="prov-value">{ASSET_PROVENANCE.filesizeFormatted}</span>
                    </div>
                    <div className="prov-row">
                      <span className="prov-label">SHA-256 Checksum:</span>
                      <span className="prov-value checksum-text">{ASSET_PROVENANCE.sha256}</span>
                    </div>
                    <div className="prov-row">
                      <span className="prov-label">Generator Signature:</span>
                      <span className="prov-value">{ASSET_PROVENANCE.generator}</span>
                    </div>
                    <div className="prov-row">
                      <span className="prov-label">Model Attribution:</span>
                      <span className="prov-value badge-pill-danger">{ASSET_PROVENANCE.attributionStatus}</span>
                    </div>
                    <div className="prov-note">
                      <strong>Preservation Record:</strong> {ASSET_PROVENANCE.attributionNote}
                    </div>
                  </div>
                </div>

                <div className="section-block">
                  <h3 className="section-heading">NASA Primary Source Citation Guide</h3>
                  <p className="text-muted">
                    To replace placeholder fields with verified mission records, consult these official NASA archives:
                  </p>
                  <div className="sources-list">
                    {OBJECT_INFORMATION.primarySourcesReference.map((src, idx) => (
                      <div key={idx} className="source-card">
                        <h4 className="source-title">{src.title}</h4>
                        <div className="source-meta">
                          <span>{src.publisher}</span>
                          <span className="badge badge-xs">{src.citationType}</span>
                        </div>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          Access NASA Primary Source ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TAB 4: KEYBOARD SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <section className="tab-pane" aria-label="Keyboard Shortcuts">
                <div className="section-block">
                  <h3 className="section-heading">Keyboard Navigation Controls</h3>
                  <p className="text-muted">
                    Full keyboard accessibility is supported for all exhibit operations:
                  </p>
                  <table className="shortcuts-table">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><kbd>Space</kbd></td>
                        <td>Play / Pause breakdown animation</td>
                      </tr>
                      <tr>
                        <td><kbd>[</kbd> / <kbd>]</kbd></td>
                        <td>Previous / Next breakdown step</td>
                      </tr>
                      <tr>
                        <td><kbd>R</kbd></td>
                        <td>Reset camera to default perspective</td>
                      </tr>
                      <tr>
                        <td><kbd>M</kbd></td>
                        <td>Toggle Exhibit Inspection / Breakdown Mode</td>
                      </tr>
                      <tr>
                        <td><kbd>A</kbd></td>
                        <td>Toggle camera auto-orbit</td>
                      </tr>
                      <tr>
                        <td><kbd>W</kbd></td>
                        <td>Toggle wireframe rendering</td>
                      </tr>
                      <tr>
                        <td><kbd>Escape</kbd></td>
                        <td>Deselect active component highlight</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
