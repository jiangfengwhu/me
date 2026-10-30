# Product films

Local HTML / GSAP / Three.js compositions imported from the original film workspace.

- `bead-film`: 16-second portrait film for 豆物.
- `city-dazi-film`: 22-second portrait film for 城市搭子.
- `yixu-outfits-film`: final 28-second landscape film for 衣序, featuring six outfits.
- `fx-film`: existing 16-second landscape VFX showreel, reused from
  `C:/Users/shado/工作/html视频特效/promo`; its Animee source frames and score are retained.
- `creator-film`: 24-second landscape film, four screenshots → 35 note cards → 3D director.
- `little-traveler-film`: original 32-second landscape film for 星星上的小旅人, with actual paper folding and interactive mechanisms.
- `clack-launch-film`: original 30-second landscape film for CLACK, with actual keys, typebars, Chinese input and paper feed.

The last two works replace Agent 学习工坊 and 面试题库. Their original standalone
applications are also included at `/apps/little-traveler/` and `/apps/clack/`.
To refresh their original applications, artwork and films:

```powershell
node scripts/import-handmade-works.mjs 'C:\Users\shado\工作\html视频特效'
```

The shared player resolves each composition's own timeline ID and waits for its
product scene to be ready before revealing the first frame. Former agent/interview
film files remain as inactive source archives; they are no longer mapped to works.

The three new films are editable huashu-motion compositions with local fonts, GSAP,
composition variables, scene labels, original ABC scores and generated WAV audio.
Their treatments are beside `index.html`. Authoring source:
`scripts/author-portfolio-films.mjs` (regenerates composition sources and posters).
After a timing or score change regenerate the corresponding soundtrack with
`npx huashu-motion sound public/films/<name>`.
No MP4 export or visual/automated QA was performed, as requested.

Visible films play automatically. Click the picture or press Space / Enter to pause
or resume. Leaving the picture, closing the detail view or hiding the browser tab
pauses playback and keeps its position. Re-entering resumes playback.
On first load the poster stays above the transparent player until the child signals
that fonts, images and its first composition frame are ready. The bead composition
also waits for the WebGL worker's first rendered frame. Poster and player then
crossfade once; all compositions prime and start at time zero, without a preview seek.
There are no playback controls or overlays. The picture uses an independent clock
if media autoplay is blocked; sound is enabled after user interaction when permitted.

The gallery lazily loads visible films and plays only the most visible one. All playback
assets and font/library licenses are local. `player.js` and `player.css` are the
shared playback adapter; the original scene sources retain their own visual content.

The four newly integrated compositions also load `composition-runtime.js` after
`vendor/om.js`. It supplies typed declaration defaults, CSS custom properties and
`data-var-text` bindings outside the huashu-motion studio while preserving studio
overrides. A studio-only `OM.vars()` otherwise returns no standalone defaults,
leaving colours unset and FX's `endHold`/timeline duration invalid.

To refresh imported compositions from their original workspace:

```powershell
node scripts/import-promos.mjs 'C:\Users\shado\工作\html视频特效'
```

Film-to-work mapping and concise product descriptions are in `src/data/portfolioConfig.js`.
The book and detail panel each use half the screen. Portrait films and their descriptions
have equal height; landscape films appear above the description. Scrollbars are hidden
while scrolling stays available. Escape returns to the shelf. Hover and transition
sounds use the local Web Audio synthesizer after the first interaction.

## Transition performance

New film players initialize after the 450 ms book reveal; an existing player resumes
immediately. The bead film keeps its HTML/GSAP choreography on the page, while a
WebGL worker initializes and draws the 3D beads off the page thread when supported.
Older browsers use a compatible renderer. Frames are coalesced so a slow worker
never accumulates stale animation requests, and the 30 fps film keeps audio timing.
Its drawing buffer follows displayed size and static bead matrices are cached.

Edit the bead scene in `src/films/` and run `npm run build:film` to rebuild the three
runtime assets. `npm run dev` and `npm run build` rebuild them automatically. After
re-importing original film assets, rebuild the optimized bead scene as well.
The original film workspace is left intact.

## Idle and scrolling behavior

Sound is enabled by default. If the browser permits autoplay, hover and transition
sounds are ready on arrival; otherwise the first ordinary click or key press
automatically resumes the suspended context. The small switch can mute sound.
The homepage opens without a film player, and muting suspends audio until explicitly
enabled again.

The main 3D scene submits no frames once interaction has settled. Pointer input,
scrolling, transitions, resize and asynchronously loaded textures wake a bounded
render burst. Hidden documents cancel the scheduled work. Inactive scene groups
are hidden, shadows are cached, and the GPU preference is low power.

Wheel input is accumulated and eased rather than applied as discrete jumps.
Shelf focus accepts subpixel deltas; detail progress starts at the exact scroll
position so the first wheel event has no fixed offset jump. Scrolling settles and
stops its animation loop when input stops.

Detail navigation keeps a shelf entry behind the work entry. Browser Back, Escape
and returning upward from the first detail all lead to Act II, including when a
work URL is opened directly. Scrolling between works replaces only the work entry.
