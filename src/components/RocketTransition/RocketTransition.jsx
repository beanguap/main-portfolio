import React, { useState, useEffect } from 'react';
import RocketCanvas from './RocketCanvas';
import styles from './RocketTransition.module.scss';
import ErrorBoundary from './ErrorBoundary';

export default function RocketTransition({
  startTransition,
  onTransitionComplete,
}) {
  const [isLaunched, setIsLaunched] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasError, setCanvasError] = useState(false);

  useEffect(() => {
    if (startTransition) {
      setShowCanvas(true);
      // Use timeout to ensure canvas is mounted before launching
      const timer = setTimeout(() => {
        setIsLaunched(true);
      }, 100); // Small delay
      return () => clearTimeout(timer);
    } else {
      setIsLaunched(false);
      // Optionally hide canvas immediately or after fade
      // setShowCanvas(false);
    }
  }, [startTransition]);

  const handleCanvasError = () => {
    setCanvasError(true);
    console.error('RocketCanvas encountered an error.');
    // Potentially trigger transition complete here too if canvas fails
    // onTransitionComplete?.();
  };

  // If canvas has an error, maybe transition immediately or show fallback
  if (canvasError) {
    // Hide canvas and trigger completion maybe?
    // return null; // Or render fallback
  }

  // If not starting, don't render canvas (or handle fade out)
  if (!showCanvas && !startTransition) {
    return null;
  }

  return (
    <div
      className={`${styles.transitionContainer} ${
        isLaunched ? styles.launched : ''
      }`}
      style={{
        // Add potential transition styles here if needed
        opacity: showCanvas ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50, // Ensure it's above content but below navbar maybe
        pointerEvents: isLaunched ? 'auto' : 'none',
      }}
    >
      <ErrorBoundary fallback={<p>Rocket Loading Error...</p>}>
        <RocketCanvas
          isLaunched={isLaunched}
          onError={handleCanvasError}
          onTransitionComplete={onTransitionComplete} // Pass the callback down
        />
      </ErrorBoundary>
    </div>
  );
}
