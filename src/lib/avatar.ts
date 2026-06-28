const DEFAULT_AVATAR_BG = "#d6001c";
const DEFAULT_AVATAR_FG = "#ffffff";

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "IB";
}

export function createAvatarDataUrl(name: string) {
  const initials = getInitials(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${name}">
      <rect width="96" height="96" rx="48" fill="${DEFAULT_AVATAR_BG}" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${DEFAULT_AVATAR_FG}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getSafeAvatarSrc(src: string | null | undefined, name: string) {
  return src?.trim() ? src : createAvatarDataUrl(name);
}