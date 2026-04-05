const STORAGE_KEY = 'admin_trait_photos';

// The 3 photo categories tracked per pig in admin/helper mode
export const PHOTO_FIELDS = [
  { key: 'ear', icon: '👂', label: 'Ohren', hint: 'Fotografiere die Ohren (Form, Haltung, Ohrmarke/Loch).' },
  { key: 'tail', icon: '〰️', label: 'Schwanz', hint: 'Fotografiere den Schwanz (Länge, Haare, Form).' },
  { key: 'custom', icon: '📸', label: 'Besonderes Merkmal', hint: 'Ein weiteres auffälliges Merkmal (z.B. Flecken, Buckel, Borsten, Haut).' }
];

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function entryKey(pigName, fieldKey) {
  return `${pigName}__${fieldKey}`;
}

/**
 * Get a photo entry: { url, description } or null
 */
export function getTraitPhoto(pigName, fieldKey) {
  const data = loadData();
  const entry = data[entryKey(pigName, fieldKey)];
  if (!entry) return null;
  // Backwards compat: old entries were plain strings (url only)
  if (typeof entry === 'string') return { url: entry, description: '' };
  return entry;
}

/**
 * Save a photo entry with optional description
 */
export function setTraitPhoto(pigName, fieldKey, url, description = '') {
  const data = loadData();
  data[entryKey(pigName, fieldKey)] = { url, description };
  saveData(data);
}

/**
 * Update just the description of an existing entry
 */
export function setTraitDescription(pigName, fieldKey, description) {
  const data = loadData();
  const key = entryKey(pigName, fieldKey);
  const existing = data[key];
  if (existing && typeof existing === 'object') {
    existing.description = description;
  } else if (existing) {
    data[key] = { url: existing, description };
  }
  saveData(data);
}

export function removeTraitPhoto(pigName, fieldKey) {
  const data = loadData();
  delete data[entryKey(pigName, fieldKey)];
  saveData(data);
}

export function getAllPhotos() {
  return loadData();
}

export function exportPhotosJSON() {
  return JSON.stringify(loadData(), null, 2);
}

export function importPhotosJSON(json) {
  try {
    const parsed = JSON.parse(json);
    saveData(parsed);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resize an image file to max width, return base64 JPEG.
 */
export function resizeImageFile(file, maxWidth = 400, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
