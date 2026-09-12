# SnapBooth React — K-Style Self Photo Studio

## Run

Requires Node.js 20.19+ or 22.12+ and a modern browser.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173 and allow camera access. For a phone, serve the app over **HTTPS**; a plain HTTP LAN address cannot access the camera. `localhost` is allowed for desktop development.

```sh
npm run build
npm run preview
```

The complete static build is in `dist/snapbooth/`. Serve this directory using any static HTTPS host. The app needs no photo, geolocation, account, or printing backend.

The repository also contains a separate legacy Flask application. Its existing routes, tracker code, database, and deployment configuration are not used by this React app. The Vite entry point is `index.html`; starting Flask alone will not run the React version.

## Initial audit

The three supplied React files (`src/App.jsx`, `src/SnapBooth.jsx`, `components/SnapBooth.jsx`) were byte-identical 767-line copies. The complete React implementation was read before editing.

| Area | Existing behavior | Updated behavior |
| --- | --- | --- |
| Camera | Unsplash image posing as a live preview | Real `getUserMedia`, explicit loading/error states and retry |
| Switch | Replaced a photo with another random URL | Cycles detected cameras, requests facing mode, stops previous stream |
| Capture | Selected random URLs | Center-cropped video frame → high-quality JPEG original → processed Canvas |
| Countdown | Nested intervals/timeouts without unmount cancellation | Abortable sequence, 3 counts × 800 ms, 140 ms flash, 550 ms pose preview |
| Retake | Missing | Replace a single pose, preserve all other originals |
| Filters | Five CSS presets, large hue shifts | Eight measured RGB presets shared by live SVG filter and Canvas processing |
| Frames | Small set, dark-mode-dependent printed colors | Four categories, fixed print colors, three layouts, optional stickers |
| Stamps | Fixed location/time, grouped timestamp | Editable location label, real session time, separate location/date/time/brand toggles |
| Download/share | Success alerts without exported files | High-resolution composite PNG, individual PNGs, Web Share with download fallback |
| Gallery | Three fabricated strips | Explicitly saved user results, full PNG blobs in IndexedDB, session fallback |
| Print/account | Inactive controls or fake success | Honest local-space dialog and frontend print planner with browser printing |
| Layout | Duplicate controls and classes without React CSS/build setup | Scoped application palette, responsive layouts, mobile navigation, reduced motion |
| Accessibility | Unlabelled icons/swatches, direct DOM dismissal | Labels, keyboard focus, native modal focus trapping, live statuses |

Existing product branding, Studio/Edit/Gallery navigation, theme, filters, automatic four-pose concept, frames, stickers, stamps, text, export, and print concept are retained. The duplicated imports now re-export the canonical application.

## Source layout

```text
index.html
package.json
vite.config.js
src/
  main.jsx
  App.jsx
  SnapBooth.jsx                 # compatibility export
  snapbooth.css
  components/
    StudioCamera.jsx
    Controls.jsx               # presets, swatches, adjustments, customizer
    Gallery.jsx
    Modal.jsx
  hooks/
    useCamera.js
    useCapture.js
    useStrip.js
  lib/
    presets.js
    photos.js
    gallery.js
components/
  SnapBooth.jsx                 # compatibility export
tests/
  snapbooth.test.mjs
  e2e/studio.spec.js
```

## Behavior and implementation

- Default camera is front-facing where supported. A single-camera device has a disabled switch control. Streams stop on camera changes, navigation away from Studio, tab backgrounding, and unmount. Returning from a background tab requires `Open camera`.
- Front preview is mirrored for posing; saved photos preserve the camera's original orientation so writing is readable. All captures use a centered 4:3 crop, matching the video viewport. Rotation is handled through the video element's current intrinsic dimensions.
- Single shot makes a one-photo strip. An automatic session captures exactly four frames. Retaking changes only the selected frame. Starting over asks before replacing existing editor photos; cancellation retains photos already taken.
- Effects are non-destructive during the session. Original frames remain available for filter changes. A shared RGB matrix controls both preview and exported pixels without relying on `CanvasRenderingContext2D.filter`. Soft Glow subtly raises light and softens contrast; no face geometry manipulation is used.
- Original capture resolution uses the available camera crop, capped at 1600 × 1200. Vertical export with four poses is 1120 × 3487 pixels. Low-resolution hardware cannot gain detail through export upscaling.
- The displayed result is the actual exported PNG, including frame, header, message, optional footer sticker, location, session date/time, and brand stamp. Frame and text changes reuse processed photos. Results cannot be downloaded while being regenerated.
- `Simpan Strip Foto` downloads the PNG and saves a gallery copy. `More ways to keep it` offers gallery-only save and separate downloads for each pose, avoiding browsers' multi-download restrictions.
- Full gallery PNGs use IndexedDB rather than a small localStorage string quota. Storage failures retain the result for this session and explain how to keep a download. Deletion requires confirmation. Clearing site data removes local gallery content. There is no cross-device sync.
- Location is an editable **label**, never a hidden location lookup. Camera audio is disabled. This React app sends no photos to the legacy Flask endpoints.
- Print Order is explicitly a frontend planner. Copies are reflected in the print document; paper preference is guidance for the user's printer. The app does not accept payments or claim an order was sent.
- CSS uses optional Google Fonts with local system-font fallbacks. No photo or filter thumbnails are fetched from third-party image services; preset illustrations are inline SVG until a session photo is available.

## Verification

```sh
npm test
npm run test:e2e
npm run build
```

End-to-end tests use installed Chrome with a **synthetic camera MediaStream**, so they exercise the actual video/Canvas/export pipeline without opening a person's camera. If Chrome is not installed, install Chrome or adjust `channel` in `playwright.config.js`. Camera-error tests inject specific `DOMException` failures.

The suite covers automatic capture, countdown, distinct frames, individual retake, filters/adjustments, frame/sticker/text/stamps, PNG dimensions and download, single-shot layout changes, share fallback, print-planner copies, IndexedDB reload persistence, delete confirmation, camera error states, cancellation/stream cleanup, dark mode, modal keyboard dismissal, and overflow at 320/390/768/1024/1440 px.

Actual hardware permission prompts, iOS/Android camera switching and orientation, native file sharing, and physical printer output still need checks on the target devices; desktop synthetic-camera testing cannot certify those hardware behaviors.
