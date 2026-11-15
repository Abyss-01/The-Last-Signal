import React from 'react';

export default function HoverCard({ hoveredComponent, mousePos }) {
  if (!hoveredComponent || !mousePos) return null;

  // Offset tooltip slightly from cursor so it doesn't block the click
  const posX = Math.min(window.innerWidth - 320, mousePos.clientX + 16);
  const posY = Math.min(window.innerHeight - 200, mousePos.clientY + 16);

  return (
    <div
      className="igloo-hover-card"
      style={{
        transform: `translate3d(${posX}px, ${posY}px, 0)`
      }}
      role="tooltip"
      aria-live="polite"
    >
      <div className="hover-card-header">
        <span className="hover-card-badge">{hoveredComponent.badge}</span>
        <span className="hover-card-step">STEP {hoveredComponent.step}</span>
      </div>

      <h4 className="hover-card-title">{hoveredComponent.name}</h4>
      <p className="hover-card-desc">{hoveredComponent.description}</p>

      <div className="hover-card-footer">
        <span className="hover-card-geo-label">Visible Structure:</span>
        <span className="hover-card-geo-value">{hoveredComponent.visibleGeometry}</span>
      </div>
    </div>
  );
}
