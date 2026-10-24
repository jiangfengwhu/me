const BASE = [10, 14, 24];

function themeChannels(book) {
  const explicitBackground = book.palette.detailBg;
  const hex = (explicitBackground || book.palette.accentHex || book.palette.foilColor || '#f59e0b').replace('#', '');
  const full = hex.length === 3 ? [...hex].map(char => char + char).join('') : hex;
  if (explicitBackground) return BASE.map((_, index) => parseInt(full.slice(index * 2, index * 2 + 2), 16));
  return BASE.map((base, index) => Math.round(base * 0.88 + parseInt(full.slice(index * 2, index * 2 + 2), 16) * 0.12));
}

/** One sRGB colour shared by the CSS panel and the transparent WebGL stage. */
export function workBackgroundAt(books, progress) {
  const position = Math.max(0, Math.min(books.length - 1, progress));
  const index = Math.floor(position);
  const from = themeChannels(books[index]);
  const to = themeChannels(books[Math.min(index + 1, books.length - 1)]);
  const fraction = position - index;
  return '#' + from.map((value, channel) => Math.round(value + (to[channel] - value) * fraction).toString(16).padStart(2, '0')).join('');
}
