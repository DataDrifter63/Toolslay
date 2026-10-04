// Uploads an image file straight from the browser to Cloudinary, using an
// UNSIGNED upload preset — no API secret is ever needed (or exposed) on the
// client. This is only wired into the admin blog editor (already behind
// AdminGuard), so it's safe to call directly from a form.
//
// Setup (one-time, in the Cloudinary dashboard):
//   Settings → Upload → Upload presets → Add upload preset
//     - Signing Mode: "Unsigned"
//     - Folder: blog (optional, keeps uploads organized)
//   Then set these two env vars (both are PUBLIC — fine to expose):
//     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
//     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset-name

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single image file to Cloudinary.
 * @param {File} file
 * @returns {Promise<{ url: string, width: number, height: number }>}
 */
export async function uploadImageToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary isn't configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "blog");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Image upload to Cloudinary failed.");
  }

  return { url: data.secure_url, width: data.width, height: data.height };
}
