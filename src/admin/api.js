export async function api(method, url, body) {
  const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body && JSON.stringify(body) });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (res.status === 401 && !url.endsWith('/login')) dispatchEvent(new Event('admin:signedout'));
  if (!res.ok) throw Object.assign(new Error(data?.error || 'Couldn’t save. Check your connection and try again.'), { errors: data?.errors });
  return data;
}

export const toast = (text, tone = 'ok') => dispatchEvent(new CustomEvent('admin:toast', { detail: { text, tone } }));

// Phone photos are often 4000px+ and several MB; the site never shows them wider than ~2400px.
async function shrink(file, max = 2400) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file; // HEIC etc. go up as-is; Cloudinary converts them
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 2e6) return file;
    const canvas = Object.assign(document.createElement('canvas'), { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) });
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp', 0.86));
    return blob && blob.size < file.size ? blob : file;
  } catch { return file; }
}

// Uploads one image straight to Cloudinary with a server-made signature. Resolves to its https URL.
export async function uploadImage(file, sig, onProgress) {
  if (file.size > 20e6) throw new Error(`${file.name} is larger than 20 MB. Choose a smaller photo.`);
  const body = new FormData();
  body.append('file', await shrink(file));
  for (const k of ['timestamp', 'signature', 'folder']) body.append(k, sig[k]);
  body.append('api_key', sig.apiKey);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); // fetch can't report upload progress
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      const r = JSON.parse(xhr.responseText || '{}');
      if (xhr.status < 300) return resolve(r.secure_url);
      reject(new Error(xhr.status === 401
        ? 'Cloudinary rejected the upload settings. Check CLOUDINARY_URL on the server.'
        : `${file.name}: ${(r.error?.message || 'upload failed').replace(/\.$/, '')}.`));
    };
    xhr.onerror = () => reject(new Error(`${file.name} didn’t upload. Check your connection and try again.`));
    xhr.send(body);
  });
}
