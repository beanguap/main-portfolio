import React, { lazy, Suspense, useEffect, useState } from 'react'; // Import lazy, Suspense
import ErrorBoundary from './ErrorBoundary';
import styles from './RocketTransition.module.scss';

// Lazy load the canvas component
// Patch: Preload Draco/HDR before resolving Suspense
const RocketCanvas = lazy(() =>
  import('./RocketCanvas').then(mod =>
    new Promise(res => {
      mod.preload?.().finally(() => res(mod));
    })
  )
);

export default function RocketTransition({
  startTransition,
  onTransitionComplete,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (startTransition) {
      setIsVisible(true);
    }
    // Optionally hide after transition completes and panel is shown,
    // depending on desired behavior (e.g., keep canvas mounted but hidden)
  }, [startTransition]);

  // Handle errors from the lazy-loaded component or canvas itself
  const handleCanvasError = (error) => {
    console.error("RocketCanvas failed to load or render:", error);
    // Optionally show a fallback UI here instead of just console logging
  };

  // Render null if not visible to avoid mounting the canvas prematurely
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`${styles.rocketTransitionContainer} ${
        startTransition ? styles.visible : ''
      }`}
      aria-hidden={!startTransition} // Hide from screen readers when inactive
    >
      <ErrorBoundary fallback={<div className={styles.errorFallback}>Rocket failed to launch!</div>}>
        <Suspense fallback={<div className={styles.loadingFallback}>Loading Rocket...</div>}>
          <RocketCanvas
            isLaunched={startTransition}
            onError={handleCanvasError}
            onTransitionComplete={onTransitionComplete}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
