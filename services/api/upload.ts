import client from './client';

export const uploadSingleFile = (file: any) => {
  const formData = new FormData();
  // For React Native, file should be an object with uri, name, type
  formData.append('file', file);

  console.log("photo::",JSON.stringify(formData))
  return client.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Get a signed READ URL for a file path.
 * @param {string} path - e.g. "images/abc.webp"
 * @returns {Promise<{url, expiresIn}>}
 */
export const getSignedReadUrl = async (path:string) => {
  console.log("path::",path)
  try {
    const res = await client.post(`/upload/signed-read?path=${path}`, {
    });

    return res.data?.data || res.data;
  } catch (error:any) {
    console.error("getSignedReadUrl error:", error);
    throw error.response?.data || { error: "Failed to get signed URL" };
  }
};

/**
 * Extract path from a full GCS URL.
 * "https://storage.googleapis.com/coolie_bucket/images/abc.webp"
 *   → "images/abc.webp"
 */
export const extractPathFromUrl = (url:string) => {
  if (!url) return null;
  try {
    const marker = "/coolie_bucket/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      return url.slice(idx + marker.length).split("?")[0];
    }
    // Fallback: strip bucket
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
    if (match) return match[1].split("?")[0];
  } catch {
    return null;
  }
  return null;
};
