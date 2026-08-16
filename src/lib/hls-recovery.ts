export const HLS_RECOVERY_LIMIT = 3;

export type HlsRecoveryAction = 'restart-load' | 'recover-media';

/**
 * Tracks consecutive fatal HLS errors for one player instance. A buffered
 * fragment proves playback made progress, so callers should reset then.
 */
export function createHlsRecoveryController(limit = HLS_RECOVERY_LIMIT) {
  let networkAttempts = 0;
  let mediaAttempts = 0;

  return {
    next(errorType: string): HlsRecoveryAction | null {
      if (errorType === 'networkError') {
        if (networkAttempts >= limit) return null;
        networkAttempts += 1;
        return 'restart-load';
      }

      if (errorType === 'mediaError') {
        if (mediaAttempts >= limit) return null;
        mediaAttempts += 1;
        return 'recover-media';
      }

      return null;
    },

    resetOnProgress() {
      networkAttempts = 0;
      mediaAttempts = 0;
    },
  };
}
