import React from 'react';
import {
  Battery,
  Camera,
  Cloud,
  FolderOpen,
  Heart,
  Image,
  Maximize2,
  MousePointer2,
  Search,
  Sparkle,
  Sun,
  Waves,
  Wifi,
} from 'lucide-react';

export function RetroStatusBar() {
  return (
    <div className="retro-status-bar" aria-hidden="true">
      <div className="status-left">
        <span className="status-carrier">CissPic Studio</span>
        <Wifi size={12} strokeWidth={2} />
        <span className="status-signal">
          <i /><i /><i /><i />
        </span>
      </div>
      <div className="status-center">
        <div className="status-search-pill">
          <Search size={10} />
          <span>diary.cisspic.app</span>
        </div>
      </div>
      <div className="status-right">
        <span className="status-battery-text">100%</span>
        <Battery size={13} strokeWidth={2} />
        <span className="status-time">12:00</span>
      </div>
    </div>
  );
}

export function DesktopDoodles() {
  return (
    <div className="desktop-doodles" aria-hidden="true">
      <svg viewBox="0 0 1440 1600" preserveAspectRatio="xMidYMin slice" fill="none">
        <g stroke="currentColor" strokeWidth="1.2" opacity="0.65">
          <circle cx="45" cy="180" r="14" />
          <circle cx="45" cy="180" r="9" />
          <circle cx="1380" cy="260" r="10" />
          <circle cx="1335" cy="110" r="22" />
          <circle cx="1360" cy="590" r="5" />
          <circle cx="75" cy="680" r="7" />
          <circle cx="65" cy="1220" r="18" />
          <circle cx="1180" cy="1200" r="10" />
          <circle cx="1270" cy="980" r="20" />
          
          <path d="m55 360 24-46 3 2-24 46Zm1240-150 34 10M1400 810l-20 32m-30-380 20-36M60 1040l35 18" />
          
          {/* Whimsical Sun doodle */}
          <g transform="translate(180, 110)">
            <circle cx="20" cy="20" r="10" />
            <path d="M20 5v4m0 22v4M5 20h4m22 0h4m-19-11l3 3m14 14l3 3m-20 0l3-3m14-14l3-3" />
          </g>

          {/* Cloud with raindrops doodle */}
          <g transform="translate(1240, 140)">
            <path d="M10 24a10 10 0 0 1 18-4 12 12 0 0 1 20 4 7 7 0 0 1-1 14H10a8 8 0 0 1 0-14z" />
            <path d="M16 42l-2 5m14-5l-2 5m14-5l-2 5" strokeDasharray="1 3" />
          </g>

          {/* Fine outline Butterfly doodle */}
          <g transform="translate(50, 480)">
            <path d="M15 15c-6-10-14-6-13 4 1 8 13 8 13 8s12 0 13-8c1-10-7-14-13-4z" />
            <path d="M15 27c-4 5-10 6-9 11 1 4 8 2 9-5 1 7 8 9 9 5 1-5-5-6-9-11z" />
            <path d="M13 13c-2-4-5-6-8-6m12 6c2-4 5-6 8-6" />
          </g>

          <path d="M1170 140q7-22 14 0 22 7 0 14-7 22-14 0-22-7 0-14ZM90 910q7-22 14 0 22 7 0 14-7 22-14 0-22-7 0-14ZM1320 1080q8-24 16 0 24 8 0 16-8 24-16 0-24-8 0-16Z" />
        </g>

        <g fill="#729AB9" stroke="currentColor" strokeWidth="1" opacity="0.5">
          <circle cx="105" cy="280" r="8" />
          <circle cx="1395" cy="720" r="14" />
          <circle cx="50" cy="930" r="5" />
          <circle cx="1210" cy="85" r="6" />
          <circle cx="1340" cy="1350" r="8" />
        </g>
      </svg>
    </div>
  );
}

export function DiaryIntro({ editing }) {
  return (
    <section className="diary-intro">
      <div className="diary-masthead">
        <p className="eyebrow">A CISSPIC ORIGINAL / AESTHETIC SELF PHOTO STUDIO</p>
        
        <div className="editorial-title-stack">
          <div className="serif-hero-display" aria-hidden="true">
            {editing ? <>PHOTO <em>DIARY</em></> : <>SNAP <em>DAYS</em></>}
          </div>
          <h1 className="hero-contract-heading">
            {editing ? 'Make the moment yours.' : 'Aesthetic 4-Cut Photo Studio'}
          </h1>
        </div>

        <span className="masthead-rule" />
      </div>

      <div className="diary-intro-note">
        <span className="intro-number">VOL. 01 — YOUR EVERYDAY ARCHIVE</span>
        <p>
          {editing
            ? 'Your poses. Your colors. Your little keepsake.'
            : 'Ordinary days, favorite faces. A little memory, made right here.'}
        </p>
        <span className="handwritten">stay a little. strike a pose.</span>
      </div>

      <div className="intro-desktop-detail" aria-hidden="true">
        <Cloud size={38} strokeWidth={1} />
        <div className="mini-loading"><span /></div>
        <span className="mini-prog-label">making memories.exe</span>
        <MousePointer2 size={22} strokeWidth={1.2} />
      </div>
    </section>
  );
}

function PhotoArt({ photo, filterId, mirrored, variant }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{
          filter: filterId ? `url(#${filterId})` : undefined,
          transform: mirrored ? 'scaleX(-1)' : undefined,
        }}
      />
    );
  }
  return (
    <div className={`diary-placeholder ${variant || ''}`}>
      <Sun size={28} strokeWidth={0.8} />
      <span>
        your next<br /><em>favorite memory.</em>
      </span>
      <Waves size={55} strokeWidth={0.7} />
    </div>
  );
}

export function ThemePaletteDock({
  currentTheme = 'sky',
  onSelectTheme,
  customColor = '#BFD7E8',
  onCustomColorChange,
  className = 'mini-desktop-dock'
}) {
  const colorInputRef = React.useRef(null);

  const themeOptions = [
    { id: 'sky', label: 'Sky Blue (Classic)', cls: 'dock-finder' },
    { id: 'ocean', label: 'Deep Ocean Blue', cls: 'dock-safari' },
    { id: 'sage', label: 'Matcha / Sage Green', cls: 'dock-messages' },
    { id: 'slate', label: 'Vintage Slate Gray', cls: 'dock-camera' },
    { id: 'custom', label: 'Custom Color Wheel (Click to pick color)', cls: 'dock-photos', isCustom: true },
    { id: 'cream', label: 'Aged Linen / Warm Cream', cls: 'dock-trash' },
  ];

  return (
    <div className={className} role="radiogroup" aria-label="Background Color Palette">
      {themeOptions.map(t => {
        const isActive = currentTheme === t.id;
        if (t.isCustom) {
          return (
            <button
              key={t.id}
              type="button"
              className={`dock-item ${t.cls} ${isActive ? 'active' : ''}`}
              title={`${t.label}${isActive ? ' (Active)' : ''}`}
              aria-label={t.label}
              aria-checked={isActive}
              role="radio"
              onClick={() => {
                onSelectTheme?.('custom');
                colorInputRef.current?.click();
              }}
            >
              <input
                ref={colorInputRef}
                type="color"
                className="dock-color-input"
                aria-label="Custom color picker"
                value={customColor || '#BFD7E8'}
                onClick={e => e.stopPropagation()}
                onChange={e => {
                  onSelectTheme?.('custom');
                  onCustomColorChange?.(e.target.value);
                }}
              />
            </button>
          );
        }
        return (
          <button
            key={t.id}
            type="button"
            className={`dock-item ${t.cls} ${isActive ? 'active' : ''}`}
            title={`${t.label}${isActive ? ' (Active)' : ''}`}
            aria-label={t.label}
            aria-checked={isActive}
            role="radio"
            onClick={() => onSelectTheme?.(t.id)}
          />
        );
      })}
    </div>
  );
}

export function DiaryCollage({
  photos = [],
  filterId,
  mirrored,
  theme = 'sky',
  onSelectTheme,
  customColor = '#BFD7E8',
  onCustomColorChange,
}) {
  const photoList = Array.isArray(photos) ? photos : [];

  return (
    <aside className="diary-collage" aria-label="Session photo collage">
      <div className="collage-label">
        <span>MEMORY FILES</span>
        <FolderOpen size={15} strokeWidth={1.3} />
      </div>

      {/* 1. Circular Crop Photo with Planetary Orbit Doodle */}
      <div className="collage-orbit">
        <div className="circle-photo">
          <PhotoArt
            photo={photoList[photoList.length - 1] || photoList[0]}
            filterId={filterId}
            mirrored={mirrored}
          />
        </div>
        <span className="circle-caption">a moment, in a circle.</span>
        <svg className="orbit-doodle" viewBox="0 0 55 55" fill="none" aria-hidden="true">
          <ellipse cx="28" cy="28" rx="11" ry="17" transform="rotate(-30 28 28)" stroke="currentColor" />
          <ellipse cx="28" cy="28" rx="25" ry="5" transform="rotate(-30 28 28)" stroke="currentColor" />
        </svg>
      </div>

      {/* 2. Speech Bubble Labels (Direct Reference Match) */}
      <div className="speech-bubbles-stack" aria-hidden="true">
        <div className="speech-bubble">i want you</div>
        <div className="speech-bubble accent">i love you</div>
        <div className="speech-bubble">i need you</div>
      </div>

      {/* 3. Editorial Manifesto Quote */}
      <div className="collage-manifesto">
        little<br />
        <em>things,</em><br />
        big feelings.
      </div>

      {/* 4. Tilted "Note to Self" Post-it */}
      <div className="collage-note">
        <span>NOTE TO SELF</span>
        <p>Be here.<br />Be you.<br />Keep this one.</p>
        <Heart size={20} strokeWidth={1} />
      </div>

      {/* 5. Tilted Polaroid Snapshot with Translucent Washi Tape */}
      <div className="collage-polaroid">
        <span className="polaroid-tape" />
        <div className="polaroid-photo">
          <PhotoArt
            photo={photoList[1] || photoList[0]}
            filterId={filterId}
            mirrored={mirrored}
            variant="paper"
          />
        </div>
        <p>
          {photoList.length
            ? `photo ${String(Math.min(2, photoList.length)).padStart(2, '0')} / made by you`
            : 'room for a good day.'}
        </p>
        <span className="vertical-caption">PERSONAL / PHOTO / DIARY</span>
      </div>

      {/* 6. Mini Desktop Window ("another little view") */}
      <div className="mini-contact-window">
        <div>
          <Image size={11} />
          <span>another little view</span>
          <Maximize2 size={10} />
        </div>
        <div className="mini-contact-photo">
          <PhotoArt
            photo={photoList[2] || photoList[0]}
            filterId={filterId}
            mirrored={mirrored}
          />
        </div>
      </div>

      {/* 7. Mini Keyboard Widget (from Reference Image) */}
      <div className="mini-keyboard-widget" aria-hidden="true">
        <div className="keyboard-row">
          {['q','w','e','r','t','y','u','i','o','p'].map(k => <span key={k}>{k}</span>)}
        </div>
        <div className="keyboard-row">
          {['a','s','d','f','g','h','j','k','l'].map(k => <span key={k}>{k}</span>)}
        </div>
        <div className="keyboard-row">
          {['z','x','c','v','b','n','m'].map(k => <span key={k}>{k}</span>)}
        </div>
        <div className="keyboard-bottom">
          <span className="key-space">space</span>
        </div>
      </div>

      {/* 8. Mini Desktop Dock Bar (Interactive Theme Palette) */}
      <ThemePaletteDock
        currentTheme={theme}
        onSelectTheme={onSelectTheme}
        customColor={customColor}
        onCustomColorChange={onCustomColorChange}
      />

      {/* 9. Self Photo Studio Stamp */}
      <div className="diary-stamp">
        <Sparkle size={20} strokeWidth={1} />
        <span>
          SELF PHOTO CLUB<br />OPEN EVERY DAY
        </span>
        <Camera size={18} strokeWidth={1} />
      </div>
    </aside>
  );
}
