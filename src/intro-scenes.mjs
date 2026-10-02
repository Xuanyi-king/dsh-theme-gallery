// Small, deterministic vector scenes. No media downloads or per-frame JS.
const circle = (r, className, extra = {}) => ['circle', { cx: 180, cy: 180, r, className, ...extra }];
const path = (d, className, extra = {}) => ['path', { d, pathLength: 100, className, ...extra }];
const petals = (count, radius) => Array.from({ length: count }, (_, i) => path(
  `M180 210 C${180 - radius} 155 ${180 - radius} 80 180 46 C${180 + radius} 80 ${180 + radius} 155 180 210Z`,
  'intro-petal', { transform: `rotate(${i * 360 / count} 180 180)` },
));
const rays = () => Array.from({ length: 8 }, (_, i) => {
  const a = i * Math.PI / 4;
  return ['line', { x1: 180 + Math.cos(a) * 101, y1: 180 + Math.sin(a) * 101,
    x2: 180 + Math.cos(a) * 125, y2: 180 + Math.sin(a) * 125, className: 'intro-sun-ray' }];
});
const INTRO_VECTORS = Object.freeze({
  ultraman: [
    circle(143, 'intro-orbit', { strokeDasharray: '2 15' }),
    circle(118, 'intro-orbit-inner', { strokeDasharray: '86 40' }),
    ['ellipse', { cx: 180, cy: 180, rx: 161, ry: 70, transform: 'rotate(-28 180 180)', className: 'intro-orbit-ellipse' }],
    path('M180 98L193 163L258 180L193 196L180 263L164 196L98 180L164 163Z', 'intro-core'),
    circle(18, 'intro-core-light'),
  ],
  'perfect-world': [
    circle(145, 'intro-rune-outer'), circle(126, 'intro-rune-inner', { strokeDasharray: '70 12 2 12' }),
    ...Array.from({ length: 8 }, (_, i) => path('M168 40L180 27L192 40M180 28V59', 'intro-rune-mark', { transform: `rotate(${i * 45} 180 180)` })),
    path('M180 98L204 155L260 180L204 204L180 262L156 204L98 180L156 156Z', 'intro-emperor-star'),
    circle(71, 'intro-rune-core'),
  ],
  'flame-emperor': [
    ...petals(8, 39),
    path('M180 112C206 148 173 158 192 184C201 166 208 153 204 140C248 193 222 247 180 247C135 247 120 199 152 164C152 190 173 183 165 163C154 142 181 129 180 112Z', 'intro-flame-core'),
    circle(137, 'intro-lotus-orbit', { strokeDasharray: '2 19' }),
  ],
  'great-sage': [
    path('M99 272L261 88', 'intro-staff'),
    path('M94 259L113 276M246 84L266 104', 'intro-staff-bands'),
    path('M85 287L274 74', 'intro-staff-trail'),
    path('M36 213C48 181 80 183 92 199C99 162 145 165 157 188C193 169 222 189 219 208H36', 'intro-cloud-outline'),
    path('M163 278C168 260 191 255 203 267C213 236 249 243 255 261C280 247 309 260 313 278H163', 'intro-cloud-outline'),
  ],
  nezha: [
    circle(144, 'intro-fire-wheel', { strokeDasharray: '30 10 2 10' }),
    circle(126, 'intro-fire-wheel-inner'),
    ...petals(6, 30),
    path('M-35 244C89 157 119 305 214 225S337 71 413 127', 'intro-red-ribbon'),
  ],
  'whale-prince': [
    circle(145, 'intro-tide-ring'), circle(123, 'intro-tide-ring-inner', { strokeDasharray: '12 12' }),
    path('M28 218C66 174 93 250 131 208S196 246 235 207S292 241 334 202', 'intro-wave'),
    path('M32 247C78 203 103 278 144 237S211 272 253 234S299 263 329 231', 'intro-wave intro-wave-second'),
    path('M180 216C176 163 123 111 75 122C90 163 137 179 180 183C224 179 270 163 285 122C237 110 184 163 180 216Z', 'intro-whale-tail'),
  ],
  'jianlai-aliang': [
    path('M103 274L255 83L275 60L265 92L113 283Z', 'intro-sword-blade'),
    path('M92 255L128 284M95 282L81 301', 'intro-sword-hilt'),
    path('M47 298L307 32', 'intro-sword-glint'),
    ['circle', { cx: 60, cy: 102, r: 24, className: 'intro-lamp-ring' }],
    path('M45 84H75V120H45ZM51 77H69M60 61V76', 'intro-lamp'),
  ],
  'sunny-watch': [
    circle(74, 'intro-sun'), ...rays(),
    path('M28 295V256H60V231H88V276H113V247H140V300H168V262H195V232H220V272H247V223H279V257H306V286H332', 'intro-city-line'),
    path('M30 310H330', 'intro-city-horizon'),
  ],
  'young-goku': [
    path('M48 211C48 184 71 163 101 171C105 143 142 127 164 153C179 125 224 127 235 165C269 151 306 174 306 205C306 232 276 248 242 245H94C66 245 48 232 48 211Z', 'intro-nimbus'),
    path('M105 196C121 171 153 176 153 197C153 215 127 220 122 202M208 196C222 174 249 180 247 200', 'intro-nimbus-curl'),
    path('M12 265C119 308 267 258 344 191', 'intro-cloud-trail'),
    path('M40 284C138 318 271 280 328 230', 'intro-cloud-trail-second'),
  ],
});

function introSymbol(React, slug, className) {
  if (!Object.hasOwn(INTRO_VECTORS, slug)) return null;
  const h = React.createElement;
  return h('svg', { className, viewBox: '0 0 360 360', 'aria-hidden': true, focusable: false },
    ...INTRO_VECTORS[slug].map(([tag, props], key) => h(tag, { ...props, key })),
  );
}

export function createIntroEmblem(React, slug) {
  return introSymbol(React, slug, 'dsh-intro-emblem');
}

export function createIntroArtwork(React, slug) {
  if (!Object.hasOwn(INTRO_VECTORS, slug)) return null;
  const h = React.createElement;
  const moteCount = { 'flame-emperor': 12, nezha: 8, 'whale-prince': 9, 'young-goku': 6 }[slug] ?? 0;
  return h('div', { className: 'dsh-intro-artwork', 'data-intro-artwork': slug, 'aria-hidden': true },
    h('div', { className: 'dsh-intro-glow' }),
    introSymbol(React, slug, 'dsh-intro-stage'),
    ['ultraman', 'whale-prince', 'sunny-watch'].includes(slug) ? h('div', { className: 'dsh-intro-rays' }) : null,
    ['great-sage', 'young-goku'].includes(slug) ? h('div', { className: 'dsh-intro-clouds' }) : null,
    slug === 'jianlai-aliang' ? h('div', { className: 'dsh-intro-rain' }) : null,
    ...Array.from({ length: moteCount }, (_, i) => h('i', { key: i, className: 'dsh-intro-mote', style: {
      '--mote-x': `${12 + i * 7}%`, '--mote-y': `${16 + (i * 13) % 45}%`,
      '--mote-delay': `${i * 90}ms`, '--mote-size': `${2 + i % 3}px`,
    } })),
  );
}
