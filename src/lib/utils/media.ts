/**
 * Utility functions for handling media URLs.
 * This ensures seamless transitioning between local storage and a Cloud CDN.
 */

export function getMediaUrl(path?: string | null, dynamicCdnUrl?: string | null): string {
  if (!path) return "";
  
  // If the path is already a full URL or a mock_id, return it as is
  if (path === "mock_id" || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Use the dynamic CDN URL from the database, or fallback to the environment variable
  const cdnUrl = dynamicCdnUrl || process.env.NEXT_PUBLIC_CDN_URL;
  
  if (cdnUrl) {
    // Ensure the CDN URL doesn't end with a slash, and the path starts with a slash
    const cleanCdn = cdnUrl.endsWith("/") ? cdnUrl.slice(0, -1) : cdnUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanCdn}${cleanPath}`;
  }

  // Fallback to local relative path
  return path;
}
