import { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import RocketCanvas from './RocketCanvas';
import styles from './RocketTransition.module.scss';

export default function RocketTransition({
  startTransition,
  onTransitionComplete,
}) {
  const [isLaunched, setIsLaunched] = useState(false);

  // Handle the rocket launch when startTransition prop changes
  useEffect(() => {
    if (startTransition && !isLaunched) {
      setIsLaunched(true);
    }

    // Reset if transition is turned off
    if (!startTransition && isLaunched) {
      setIsLaunched(false);
    }
  }, [startTransition, isLaunched]);

  const handleCanvasError = () => {
    setTimeout(() => {
      onTransitionComplete(); // Still trigger transition completion on error
    }, 500);
  };

  return (
    <div
      className={`${styles.rocketTransitionWrapper} ${
        startTransition ? styles.launched : ''
      }`}
      aria-hidden={!startTransition}
    >
      <ErrorBoundary
        fallback={<div className={styles.fallbackText}>Loading Experience...</div>}
      >
        <RocketCanvas
          isLaunched={isLaunched}
          onError={handleCanvasError}
          onTransitionComplete={onTransitionComplete} // Pass the callback down
        />
      </ErrorBoundary>
    </div>
  );
}
