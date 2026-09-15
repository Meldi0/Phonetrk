# Photo slot layout

`src/lib/imageFrames.js` lists the artwork. `src/lib/imageFrameSlots.json` describes every aperture in the **original asset's pixels**. Preview, download, gallery and print use `templateRenderer.js`; output scaling happens once at the canvas root.

Store the original JPEG bytes in `src/assets/frames/*.jpg` and register each image using a static `new URL('../assets/frames/example.jpg', import.meta.url).href`. Vite emits fingerprinted images under `/assets/`, the route already served by Flask and the static host. Do not point to `/frames/`: Vite serves that public folder during development, but the application server does not. Both thumbnails and the compositor read the same `src`. Build with `npm run build` before running the production-server regression.

Each image frame specifies its actual `frameW` / `frameH` and an ordered `slots` array. Every slot has:

- `x`, `y`, `width`, `height`: unrotated crop box, measured around the slot center.
- `rotation`: radians, clockwise positive. Used for rectangle slots without explicit corners.
- `corners`: top-left, top-right, bottom-right, bottom-left in artwork coordinates. These take precedence over the rectangle's rotation; **do not rotate them twice**. They also describe perspective in photographed artwork.
- `crop`: `fit: "cover"` and `position: { x, y }` in the range 0–1. The image is cropped proportionally, then mapped to the opening. `y: 0.4` retains slightly more headroom; this is not face detection.
- `borderRadius`: radius in logical pixels for rectangle slots without an explicit polygon.
- `zIndex`: photo layer order. Photo indices remain tied to array order when layers are sorted.
- `mask.polygon`: the visible aperture, in artwork coordinates. Trace around any decoration crossing the edge. `mask.exclude` contains interior foreground silhouettes that must remain visible. These form an even-odd clipping path.

To add an image frame, register its asset and metadata, measure its native size, then trace each opening. Start with a four-corner polygon; add vertices only for shaped edges or overlapping decorations. Do not infer openings from black/white pixels at runtime: JPEG artwork can contain those colors outside its slots. Do not reuse a generic grid for a fixed artwork. Recalibrate if the asset changes size or geometry. Photo count is derived from the slot array.

The frame artwork is retained as a matte outside the photo apertures, including foreground decorations. `photoSlots.js` crops each original processed image once and applies rotation / perspective beneath that matte. There is no intermediate photo resize and no full-resolution overlay bitmap. The renderer rejects changed asset dimensions rather than silently shifting the layout.

The two historically misnamed IDs are retained for saved favorites: `frame-snoopy-spiderman-2cut` now correctly has two slots; `frame-film-strip-stars-2cut` is displayed as **Film Strip Stars 6-Cut** and has all six openings.

Run `npm test` and `npx playwright test tests/e2e/frame_placement.spec.js tests/e2e/image_frames.spec.js tests/e2e/frame_export_ui.spec.js`. The browser checks actual pixels in apertures and protected artwork, native dimensions, preview/HD alignment, cancelled render jobs, download/gallery/print and mobile sizing. UI capture uses a synthetic MediaStream so this suite does not depend on a physical camera. Visual proofs are written to `artifacts/frame-alignment/`.
