import React from 'react';
import { SCROLL_CHAPTERS } from './ScrollStages';

export default function ScrollProgressHUD({
  scrollProgress,
  activeChapterIndex,
  onJumpToChapter
}) {
  return (
    <nav className="scroll-progress-hud" aria-label="Deconstruction Timeline Navigation">
      <div className="hud-line-track">
        <div
          className="hud-line-fill"
          style={{ height: `${Math.round((scrollProgress || 0) * 100)}%` }}
        />
      </div>

      <div className="hud-steps-list">
        {SCROLL_CHAPTERS.map((chap, idx) => (
          <button
            key={chap.id}
            className={`hud-step-btn ${activeChapterIndex === idx ? 'active' : ''}`}
            onClick={() => onJumpToChapter(idx)}
            title={`Jump to ${chap.tag}`}
            aria-label={`Jump to stage ${chap.index}: ${chap.title}`}
          >
            <span className="hud-step-bullet" />
            <span className="hud-step-index">{chap.index}</span>
            <span className="hud-step-name">{chap.tag.split('—')[1]?.trim()}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
