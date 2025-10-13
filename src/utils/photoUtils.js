import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8
};

export async function compressAndProcessPhoto(file) {
  try {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }

    let compressedFile = file;

    if (file.size > 1024 * 1024) {
      compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    }

    const preview = await createImagePreview(compressedFile);

    const processedFile = new File(
      [compressedFile],
      `photo_${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    );

    return {
      file: processedFile,
      preview,
      originalSize: file.size,
      compressedSize: processedFile.size,
      compressionRatio: file.size > 0 ? (1 - processedFile.size / file.size) * 100 : 0
    };
  } catch (error) {
    console.error('Photo compression error:', error);
    throw new Error('Failed to process photo. Please try again.');
  }
}

function createImagePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to create preview'));
    reader.readAsDataURL(file);
  });
}

export function createThumbnail(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = calculateThumbnailSize(
        img.width,
        img.height,
        maxSize
      );

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function calculateThumbnailSize(originalWidth, originalHeight, maxSize) {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio)
    };
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize
    };
  }
}

export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please select a JPEG, PNG, or WebP image.');
  }

  if (file.size > maxSize) {
    throw new Error('File is too large. Please select an image smaller than 10MB.');
  }

  return true;
}

export function getExifData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const dataView = new DataView(arrayBuffer);

      try {
        const exifData = {
          timestamp: new Date().toISOString(),
          fileSize: file.size,
          fileName: file.name
        };

        if (dataView.getUint16(0) === 0xFFD8) {
          exifData.format = 'JPEG';
        }

        resolve(exifData);
      } catch (error) {
        resolve({
          timestamp: new Date().toISOString(),
          fileSize: file.size,
          fileName: file.name
        });
      }
    };

    reader.readAsArrayBuffer(file.slice(0, 1024));
  });
}