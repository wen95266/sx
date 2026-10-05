/**
 * Haptic Vibration Feedback for Mobile Touch Interactions
 */

export type HapticType =
  | 'click'     // Lightweight tap
  | 'select'    // Card select/deselect
  | 'move'      // Move cards to dun
  | 'deal'      // Deal cards
  | 'warning'   // Foul/error warning
  | 'gunshot'   // 🔫 Gunshot double vibration
  | 'slam'      // 👑 Grand slam fanfare vibration
  | 'success';  // Successful transfer/action

export function triggerHaptic(type: HapticType): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'click':
        navigator.vibrate(10);
        break;
      case 'select':
        navigator.vibrate(18);
        break;
      case 'move':
        navigator.vibrate([15, 30, 20]);
        break;
      case 'deal':
        navigator.vibrate([10, 20, 10]);
        break;
      case 'warning':
        navigator.vibrate([60, 40, 60]);
        break;
      case 'gunshot':
        navigator.vibrate([100, 50, 120]);
        break;
      case 'slam':
        navigator.vibrate([100, 40, 100, 40, 250]);
        break;
      case 'success':
        navigator.vibrate([30, 50, 60]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Vibration may be blocked by browser policy without active user gesture
  }
}
