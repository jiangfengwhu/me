import * as THREE from 'three';

/** A closed, non-intersecting route through every contribution cell + a return lane. */
export function contributionRoute(weeks = 53) {
  const route = [];
  for (let y = 0; y < 8; y++) {
    for (let step = 0; step < weeks - 1; step++) {
      route.push([y % 2 ? weeks - 1 - step : 1 + step, y]);
    }
  }
  for (let y = 7; y >= 0; y--) route.push([0, y]);
  // Begin at the current end of the calendar, where recent contributions live.
  const start = route.findIndex(([x, y]) => x === weeks - 1 && y === 0);
  return [...route.slice(start), ...route.slice(0, start)];
}

export function createContributionSnake(activity, { onFrame, onState } = {}) {
  const canvas = document.createElement('canvas');
  const weeks = activity.weeks || 53;
  const pitch = 18, cell = 14, marginX = 36, marginY = 25;
  canvas.width = weeks * pitch + marginX * 2;
  canvas.height = 8 * pitch + marginY + 12;
  const ctx = canvas.getContext('2d');
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.generateMipmaps = false;
  map.minFilter = THREE.LinearFilter;
  const route = contributionRoute(weeks);
  const palette = ['#18241e', '#0e4429', '#006d32', '#26a641', '#39d353'];
  const monthMarks = [];
  const first = new Date(activity.startDate + 'T00:00:00Z');
  let lastMonth = -1;
  for (let x = 0; x < weeks; x++) {
    const date = new Date(first.getTime() + x * 7 * 86400000);
    if (date.getUTCMonth() !== lastMonth) {
      lastMonth = date.getUTCMonth();
      if (x < weeks - 2) monthMarks.push([x, date.toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toUpperCase()]);
    }
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, timer = null, step = 0;
  const eaten = new Set();
  const square = (x, y, color, grow = 0) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(marginX + x * pitch - grow, marginY + y * pitch - grow, cell + grow * 2, cell + grow * 2, 3);
    ctx.fill();
  };
  function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < weeks; x++) for (let y = 0; y < 7; y++) {
      const index = x * 7 + y;
      const level = Number(activity.levels[index]) || 0;
      square(x, y, palette[eaten.has(index) ? 0 : level]);
    }
    ctx.font = '10px monospace';
    ctx.fillStyle = '#91a698';
    for (const [y, label] of [[1, 'MON'], [3, 'WED'], [5, 'FRI']]) ctx.fillText(label, 0, marginY + y * pitch + 11);
    for (const [x, label] of monthMarks) ctx.fillText(label, marginX + x * pitch, 12);
    for (let i = 11; i >= 0; i--) {
      const [x, y] = route[(step - i + route.length) % route.length];
      square(x, y, i === 0 ? '#b5f7ca' : '#4ade80', 1.6);
    }
    const [x, y] = route[step];
    const prev = route[(step - 1 + route.length) % route.length];
    const dx = Math.sign(x - prev[0]), dy = Math.sign(y - prev[1]);
    ctx.fillStyle = '#0b2015';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(marginX + x * pitch + cell / 2 + dx * 3 + (dy ? side * 3 : 0),
        marginY + y * pitch + cell / 2 + dy * 3 + (dx ? side * 3 : 0), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    map.needsUpdate = true;
    onState?.(active && !reduced.matches ? 'playing' : 'paused', step);
  }
  function tick() {
    timer = null;
    if (!active || reduced.matches || document.hidden) return;
    step = (step + 1) % route.length;
    if (step === 0) eaten.clear();
    const [x, y] = route[step];
    if (y < 7) eaten.add(x * 7 + y);
    paint();
    onFrame?.();
    timer = setTimeout(tick, 100);
  }
  function setActive(value) {
    active = Boolean(value) && !document.hidden;
    clearTimeout(timer);
    timer = null;
    onState?.(active && !reduced.matches ? 'playing' : 'paused', step);
    if (active && !reduced.matches) timer = setTimeout(tick, 100);
  }
  reduced.addEventListener('change', () => setActive(active));
  paint();
  return { map, canvas, setActive };
}
