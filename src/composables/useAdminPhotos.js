const STORAGE_KEY = 'admin_trait_photos';

function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

function photoKey(pigName, traitKey) {
  return `${pigName}__${traitKey}`;
}

export function getTraitPhoto(pigName, traitKey) {
  const photos = loadPhotos();
  return photos[photoKey(pigName, traitKey)] || null;
}

export function setTraitPhoto(pigName, traitKey, urlOrData) {
  const photos = loadPhotos();
  photos[photoKey(pigName, traitKey)] = urlOrData;
  savePhotos(photos);
}

export function removeTraitPhoto(pigName, traitKey) {
  const photos = loadPhotos();
  delete photos[photoKey(pigName, traitKey)];
  savePhotos(photos);
}

export function getAllPhotos() {
  return loadPhotos();
}

export function exportPhotosJSON() {
  return JSON.stringify(loadPhotos(), null, 2);
}

export function importPhotosJSON(json) {
  try {
    const data = JSON.parse(json);
    savePhotos(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resize an image file to max 400px wide, return base64 JPEG.
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
