/**
 * Calculates responsive height for map components
 * @param baseHeight - Base height for desktop
 * @param minHeight - Minimum height for mobile
 * @param maxHeight - Maximum height for mobile
 * @returns Calculated height based on screen size
 */
// export function calculateResponsiveHeight(
//   baseHeight: number,
//   minHeight: number = 220,
//   maxHeight: number = 320
// ): number {
//   if (typeof window === 'undefined') return baseHeight;

//   if (window.innerWidth <= 768) {
//     return Math.min(Math.max(minHeight, Math.round(window.innerHeight * 0.48)), maxHeight);
//   }

//   return baseHeight;
// }

/**
 * Checks if the current viewport is mobile
 * @returns True if viewport width is mobile-sized
 */
// export function isMobile(): boolean {
//   if (typeof window === 'undefined') return false;
//   return window.innerWidth <= 768;
// }

