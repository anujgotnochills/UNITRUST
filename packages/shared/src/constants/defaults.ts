declare var Buffer: any;
export const DEFAULT_INSTITUTE_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="60" fill="#E2E8F0"/>
  <path d="M60 30L30 50V90H50V70H70V90H90V50L60 30Z" fill="#94A3B8"/>
  <rect x="52" y="42" width="16" height="12" rx="2" fill="#CBD5E1"/>
</svg>`;

export const DEFAULT_USER_AVATAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="60" fill="#E2E8F0"/>
  <circle cx="60" cy="45" r="18" fill="#94A3B8"/>
  <path d="M30 95C30 78.43 43.43 65 60 65C76.57 65 90 78.43 90 95" fill="#94A3B8"/>
</svg>`;

export const DEFAULT_INSTITUTE_LOGO_DATA_URI = `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(DEFAULT_INSTITUTE_LOGO) : Buffer.from(DEFAULT_INSTITUTE_LOGO).toString('base64')}`;

export const DEFAULT_USER_AVATAR_DATA_URI = `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(DEFAULT_USER_AVATAR) : Buffer.from(DEFAULT_USER_AVATAR).toString('base64')}`;
