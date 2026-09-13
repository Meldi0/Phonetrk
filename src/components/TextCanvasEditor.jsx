import React, { useEffect, useRef, useState } from 'react';
import {
  Copy,
  RotateCw,
  Trash2,
  Highlighter,
} from 'lucide-react';

export const NON_FORMAL_FONTS = [
  { id: 'Caveat', name: 'Handwriting', family: '"Caveat", cursive', preview: 'Aesthetic' },
  { id: 'Permanent Marker', name: 'Cool Marker', family: '"Permanent Marker", cursive', preview: 'Marker' },
  { id: 'Pacifico', name: 'Bouncy Script', family: '"Pacifico", cursive', preview: 'Sweet' },
  { id: 'Fredoka', name: 'Playful Cute', family: '"Fredoka", sans-serif', preview: 'Cute' },
  { id: 'VT323', name: 'Retro Pixel', family: '"VT323", monospace', preview: '8-BIT' },
  { id: 'Shantell Sans', name: 'Doodle Comic', family: '"Shantell Sans", cursive', preview: 'Doodle' },
  { id: 'Courier Prime', name: 'Typewriter', family: '"Courier Prime", monospace', preview: 'Typewriter' },
];

export function TextCanvasEditor({
  userTexts = [],
  onChange,
  onCommit,
  selectedId,
  onSelect,
  containerRef,
}) {
  const [activeDrag, setActiveDrag] = useState(null);
  const localContainerRef = useRef(null);

  const stage = containerRef?.current || localContainerRef.current;

  // Deselect when clicking outside texts
  function handleBackgroundClick(e) {
    if (e.target.classList.contains('text-canvas-overlay')) {
      onSelect(null);
    }
  }

  const maxZ = userTexts.reduce((max, t) => Math.max(max, t.zIndex || 1), 1);

  function notifyCommit(updated) {
    onChange?.(updated);
    onCommit?.(updated);
  }

  function handleDuplicate(item) {
    const newItem = {
      ...item,
      id: 'txt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      x: Math.min(0.90, (item.x ?? 0.5) + 0.04),
      y: Math.min(0.90, (item.y ?? 0.8) + 0.04),
      zIndex: maxZ + 1,
    };
    const next = [...userTexts, newItem];
    notifyCommit(next);
    onSelect(newItem.id);
  }

  function handleToggleBg(item) {
    const next = userTexts.map(t =>
      t.id === item.id ? { ...t, hasBg: !t.hasBg } : t
    );
    notifyCommit(next);
  }

  function handleDelete(item) {
    const next = userTexts.filter(t => t.id !== item.id);
    notifyCommit(next);
    if (selectedId === item.id) onSelect(null);
  }

  // Pointer interaction: MOVE
  function handlePointerDownMove(e, item) {
    e.stopPropagation();
    onSelect(item.id);

    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialItemX = item.x ?? 0.5;
    const initialItemY = item.y ?? 0.85;

    setActiveDrag({
      type: 'move',
      id: item.id,
      startX,
      startY,
      initialItemX,
      initialItemY,
      rectW: rect.width,
      rectH: rect.height,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  // Pointer interaction: RESIZE / SCALE
  function handlePointerDownResize(e, item) {
    e.stopPropagation();
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    const cx = rect.left + (item.x ?? 0.5) * rect.width;
    const cy = rect.top + (item.y ?? 0.85) * rect.height;
    const initialDist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const initialScale = item.scale || 1.0;

    setActiveDrag({
      type: 'resize',
      id: item.id,
      cx,
      cy,
      initialDist: Math.max(10, initialDist),
      initialScale,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  // Pointer interaction: ROTATE
  function handlePointerDownRotate(e, item) {
    e.stopPropagation();
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    const cx = rect.left + (item.x ?? 0.5) * rect.width;
    const cy = rect.top + (item.y ?? 0.85) * rect.height;

    setActiveDrag({
      type: 'rotate',
      id: item.id,
      cx,
      cy,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!activeDrag) return;

    if (activeDrag.type === 'move') {
      const dx = (e.clientX - activeDrag.startX) / activeDrag.rectW;
      const dy = (e.clientY - activeDrag.startY) / activeDrag.rectH;
      const newX = Math.max(0.05, Math.min(0.95, activeDrag.initialItemX + dx));
      const newY = Math.max(0.05, Math.min(0.95, activeDrag.initialItemY + dy));

      onChange(
        userTexts.map(t =>
          t.id === activeDrag.id ? { ...t, x: newX, y: newY } : t
        )
      );
    } else if (activeDrag.type === 'resize') {
      const currentDist = Math.hypot(e.clientX - activeDrag.cx, e.clientY - activeDrag.cy);
      const factor = currentDist / activeDrag.initialDist;
      const newScale = Math.max(0.4, Math.min(3.0, activeDrag.initialScale * factor));

      onChange(
        userTexts.map(t =>
          t.id === activeDrag.id ? { ...t, scale: Number(newScale.toFixed(2)) } : t
        )
      );
    } else if (activeDrag.type === 'rotate') {
      const dx = e.clientX - activeDrag.cx;
      const dy = e.clientY - activeDrag.cy;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      // Snapping to common angles
      const snaps = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const snap of snaps) {
        if (Math.abs(angle - snap) < 4) {
          angle = snap % 360;
          break;
        }
      }

      onChange(
        userTexts.map(t =>
          t.id === activeDrag.id ? { ...t, rotation: Math.round(angle) } : t
        )
      );
    }
  }

  function handlePointerUp(e) {
    if (activeDrag) {
      try {
        e.currentTarget?.releasePointerCapture?.(e.pointerId);
      } catch {}
      setActiveDrag(null);
      onCommit?.(userTexts);
    }
  }

  return (
    <div
      ref={localContainerRef}
      className="text-canvas-overlay"
      onClick={handleBackgroundClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {userTexts.map(item => {
        if (!item.text || !item.text.trim()) return null;
        const isSelected = selectedId === item.id;
        const leftPct = (item.x ?? 0.5) * 100;
        const topPct = (item.y ?? 0.85) * 100;
        const rot = item.rotation || 0;
        const scale = item.scale || 1.0;
        const fontObj = NON_FORMAL_FONTS.find(f => f.id === item.font) || NON_FORMAL_FONTS[0];

        return (
          <div
            key={item.id}
            className={`placed-text-wrapper ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
              zIndex: item.zIndex || 2,
            }}
            onPointerDown={e => handlePointerDownMove(e, item)}
          >
            <div
              className={`placed-text-content ${item.hasBg ? 'has-bg' : ''}`}
              style={{
                fontFamily: fontObj.family,
                color: item.color || '#FFFFFF',
                backgroundColor: item.hasBg ? (item.bgColor || 'rgba(18, 20, 24, 0.85)') : 'transparent',
                fontSize: `${item.fontSize || 24}px`,
              }}
            >
              {item.text}
            </div>

            {/* Selection Bounding Box & Handles */}
            {isSelected && (
              <div className="text-transform-box">
                {/* 4 Corner Resize Handles */}
                <span
                  className="text-handle handle-nw"
                  aria-label="Resize text"
                  onPointerDown={e => handlePointerDownResize(e, item)}
                />
                <span
                  className="text-handle handle-ne"
                  aria-label="Resize text"
                  onPointerDown={e => handlePointerDownResize(e, item)}
                />
                <span
                  className="text-handle handle-se"
                  aria-label="Resize text"
                  onPointerDown={e => handlePointerDownResize(e, item)}
                />
                <span
                  className="text-handle handle-sw"
                  aria-label="Resize text"
                  onPointerDown={e => handlePointerDownResize(e, item)}
                />

                {/* Top Rotation Stem and Handle */}
                <div className="text-rot-line" />
                <button
                  type="button"
                  className="text-handle handle-rotate"
                  aria-label="Rotate text"
                  onPointerDown={e => handlePointerDownRotate(e, item)}
                >
                  <RotateCw size={11} />
                </button>

                {/* Floating Quick Action Toolbar */}
                <div className="text-toolbar" onPointerDown={e => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Toggle background badge"
                    aria-label="Toggle background badge"
                    className={item.hasBg ? 'active' : ''}
                    onClick={() => handleToggleBg(item)}
                  >
                    <Highlighter size={13} />
                  </button>
                  <button
                    type="button"
                    title="Duplicate text"
                    aria-label="Duplicate text"
                    onClick={() => handleDuplicate(item)}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    title="Delete text"
                    aria-label="Delete text"
                    className="btn-danger"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
