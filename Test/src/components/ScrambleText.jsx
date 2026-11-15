import React, { useEffect, useState, useRef } from 'react';

const GLYPHS = '0123456789ABCDEF_+-*/=<>[]{}~#$';

export default function ScrambleText({
  text,
  className = '',
  triggerKey = null,
  duration = 600,
  as: Component = 'span'
}) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef(null);

  useEffect(() => {
    let startTime = null;
    const length = text.length;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const revealedCount = Math.floor(progress * length);

      let result = '';
      for (let i = 0; i < length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < revealedCount) {
          result += text[i];
        } else {
          result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, triggerKey, duration]);

  return <Component className={className}>{displayText}</Component>;
}
