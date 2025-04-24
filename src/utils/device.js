// Basic mobile detection (User Agent sniffing is not foolproof)
const checkIsMobile = () => {
  if (typeof window === 'undefined') return false; // Guard for SSR
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  // Checks for common mobile patterns
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

// Specific device checks (even less reliable, use with caution)
const checkIsIPhone12Pro = () => {
  if (typeof window === 'undefined') return false;
  // Example check - dimensions might vary with zoom, etc.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  // iPhone 12 Pro dimensions (approximate)
  return isIOS && screenWidth === 390 && screenHeight === 844 && window.devicePixelRatio === 3;
};

// Check for hover capability
const checkCanHover = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(hover: hover)').matches;
}

// Export a single object
export const device = {
  isMobile: checkIsMobile(),
  isIPhone12Pro: checkIsIPhone12Pro(),
  canHover: checkCanHover(),
  // Add other checks as needed, e.g., isTablet
};

// Keep individual exports for compatibility if needed, but prefer the object
export const isMobile = device.isMobile;
export const isIPhone12Pro = device.isIPhone12Pro;
export const canHover = device.canHover;
