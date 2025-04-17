export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function isIPhone12Pro() {
  const iOS = /iPhone/.test(navigator.userAgent);
  return iOS && (window.screen.width === 390 || window.screen.height === 390);
}
