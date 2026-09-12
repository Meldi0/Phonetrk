import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  FlipHorizontal,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { STICKER_LIBRARY } from '../lib/stickers.js';

export function StickerCanvasEditor({
  userStickers = [],
  onChange,
  onCommit,
  selectedId,
  onSelect,
  containerRef,
}) {
  const [activeDrag, setActiveDrag] = useState(null);
  const localContainerRef = useRef(null);

  const stage = containerRef?.current || localContainerRef.current;

  // Deselect when clicking outside stickers
  function handleBackgroundClick(e) {
    if (e.target.classList.contains('sticker-canvas-overlay')) {
      onSelect(null);
    }
  }

  // Find max z-index
  const maxZ = userStickers.reduce((max, s) => Math.max(max, s.zIndex || 1), 1);
  const minZ = userStickers.reduce((min, s) => Math.min(min, s.zIndex || 1), 1);

  function notifyCommit(updated) {
    onChange?.(updated);
    onCommit?.(updated);
  }

  // Sticker actions
  function handleDuplicate(stk) {
    const newStk = {
      ...stk,
      instanceId: 'stk_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      x: Math.min(0.92, stk.x + 0.04),
      y: Math.min(0.92, stk.y + 0.04),
      zIndex: maxZ + 1,
    };
    const next = [...userStickers, newStk];
    notifyCommit(next);
    onSelect(newStk.instanceId);
  }

  function handleFlip(stk) {
    const next = userStickers.map(s =>
      s.instanceId === stk.instanceId ? { ...s, flipX: !s.flipX } : s
    );
    notifyCommit(next);
  }

  function handleBringForward(stk) {
    const next = userStickers.map(s =>
      s.instanceId === stk.instanceId ? { ...s, zIndex: (s.zIndex || 1) + 1 } : s
    );
    notifyCommit(next);
  }

  function handleSendBackward(stk) {
    const next = userStickers.map(s =>
      s.instanceId === stk.instanceId ? { ...s, zIndex: Math.max(0, (s.zIndex || 1) - 1) } : s
    );
    notifyCommit(next);
  }

  function handleDelete(stk) {
    const next = userStickers.filter(s => s.instanceId !== stk.instanceId);
    notifyCommit(next);
    if (selectedId === stk.instanceId) onSelect(null);
  }

  // Pointer interaction: MOVE
  function handlePointerDownMove(e, stk) {
    e.stopPropagation();
    onSelect(stk.instanceId);

    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialStkX = stk.x;
    const initialStkY = stk.y;

    setActiveDrag({
      type: 'move',
      instanceId: stk.instanceId,
      startX,
      startY,
      initialStkX,
      initialStkY,
      rectW: rect.width,
      rectH: rect.height,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  // Pointer interaction: RESIZE
  function handlePointerDownResize(e, stk, handleCorner) {
    e.stopPropagation();
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    // Center of the sticker in pixels
    const cx = rect.left + stk.x * rect.width;
    const cy = rect.top + stk.y * rect.height;
    const initialDist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const initialScale = stk.scale || 0.18;

    setActiveDrag({
      type: 'resize',
      instanceId: stk.instanceId,
      cx,
      cy,
      initialDist: Math.max(10, initialDist),
      initialScale,
    });

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  // Pointer interaction: ROTATE
  function handlePointerDownRotate(e, stk) {
    e.stopPropagation();
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    const cx = rect.left + stk.x * rect.width;
    const cy = rect.top + stk.y * rect.height;

    setActiveDrag({
      type: 'rotate',
      instanceId: stk.instanceId,
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
      const newX = Math.max(0.02, Math.min(0.98, activeDrag.initialStkX + dx));
      const newY = Math.max(0.02, Math.min(0.98, activeDrag.initialStkY + dy));

      onChange(
        userStickers.map(s =>
          s.instanceId === activeDrag.instanceId ? { ...s, x: newX, y: newY } : s
        )
      );
    } else if (activeDrag.type === 'resize') {
      const currentDist = Math.hypot(e.clientX - activeDrag.cx, e.clientY - activeDrag.cy);
      const factor = currentDist / activeDrag.initialDist;
      const newScale = Math.max(0.06, Math.min(0.65, activeDrag.initialScale * factor));

      onChange(
        userStickers.map(s =>
          s.instanceId === activeDrag.instanceId ? { ...s, scale: newScale } : s
        )
      );
    } else if (activeDrag.type === 'rotate') {
      const dx = e.clientX - activeDrag.cx;
      const dy = e.clientY - activeDrag.cy;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (angle < 0) angle += 360;

      // Optional snap to 0, 45, 90, 180 within 4 degrees
      const snaps = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const snap of snaps) {
        if (Math.abs(angle - snap) < 4) {
          angle = snap % 360;
          break;
        }
      }

      onChange(
        userStickers.map(s =>
          s.instanceId === activeDrag.instanceId ? { ...s, rotation: Math.round(angle) } : s
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
      onCommit?.(userStickers);
    }
  }

  return (
    <div
      ref={localContainerRef}
      className="sticker-canvas-overlay"
      onClick={handleBackgroundClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {userStickers.map(stk => {
        const isSelected = selectedId === stk.instanceId;
        const asset = STICKER_LIBRARY.find(
          s => s.id === (stk.stickerId || stk.id || stk.type)
        );
        if (!asset) return null;

        const leftPct = stk.x * 100;
        const topPct = stk.y * 100;
        const widthPct = (stk.scale || asset.defaultScale || 0.18) * 100;
        const rot = stk.rotation || 0;
        const flip = stk.flipX ? -1 : 1;

        return (
          <div
            key={stk.instanceId}
            className={`placed-sticker-wrapper ${isSelected ? 'selected' : ''}`}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              transform: `translate(-50%, -50%) rotate(${rot}deg) scaleX(${flip})`,
              zIndex: stk.zIndex || 1,
            }}
            onPointerDown={e => handlePointerDownMove(e, stk)}
          >
            <img
              src={asset.src}
              alt={asset.name}
              className="placed-sticker-img"
              draggable={false}
            />

            {/* Selection Bounding Box & Handles (Visible ONLY in Editor) */}
            {isSelected && (
              <div
                className="sticker-transform-box"
                style={{ transform: `scaleX(${flip})` }} // Counter-flip handles so they stay normal
              >
                {/* 4 Corner Resize Handles */}
                <span
                  className="sticker-handle handle-nw"
                  aria-label="Resize sticker"
                  onPointerDown={e => handlePointerDownResize(e, stk, 'nw')}
                />
                <span
                  className="sticker-handle handle-ne"
                  aria-label="Resize sticker"
                  onPointerDown={e => handlePointerDownResize(e, stk, 'ne')}
                />
                <span
                  className="sticker-handle handle-se"
                  aria-label="Resize sticker"
                  onPointerDown={e => handlePointerDownResize(e, stk, 'se')}
                />
                <span
                  className="sticker-handle handle-sw"
                  aria-label="Resize sticker"
                  onPointerDown={e => handlePointerDownResize(e, stk, 'sw')}
                />

                {/* Top Rotation Stem and Handle */}
                <div className="sticker-rot-line" />
                <button
                  type="button"
                  className="sticker-handle handle-rotate"
                  aria-label="Rotate sticker"
                  onPointerDown={e => handlePointerDownRotate(e, stk)}
                >
                  <RotateCw size={11} />
                </button>

                {/* Floating Quick Action Toolbar */}
                <div className="sticker-toolbar" onPointerDown={e => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Duplicate sticker"
                    aria-label="Duplicate sticker"
                    onClick={() => handleDuplicate(stk)}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    title="Flip horizontal"
                    aria-label="Flip horizontal"
                    onClick={() => handleFlip(stk)}
                  >
                    <FlipHorizontal size={13} />
                  </button>
                  <button
                    type="button"
                    title="Bring forward"
                    aria-label="Bring forward"
                    onClick={() => handleBringForward(stk)}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    title="Send backward"
                    aria-label="Send backward"
                    onClick={() => handleSendBackward(stk)}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    title="Delete sticker"
                    aria-label="Delete sticker"
                    onClick={() => handleDelete(stk)}
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
