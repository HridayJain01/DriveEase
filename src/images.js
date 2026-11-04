// Photo addresses at the size a screen needs.
export function img(url, w) {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) return `${url}?w=${w}&q=60&auto=format&fit=crop`;
  if (url.includes('res.cloudinary.com')) return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${w}/`);
  return url;
}
export const srcSet = (url, widths = [400, 640, 960, 1280]) => widths.map((w) => `${img(url, w)} ${w}w`).join(', ');
export const heroSrcSet = (url) => srcSet(url, [700, 1000, 1400]);
