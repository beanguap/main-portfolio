import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RocketCanvas from './RocketCanvas';
import ExperiencePanel from './ExperiencePanel';
import styles from './RocketTransition.module.scss';

export default function RocketTransition({ startTransition: shouldStart, onTransitionComplete }) {
  const [launched, setLaunched] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const transitionTimeoutRef = useRef(null);

  const cleanupTimeouts = () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  const handleTransitionError = () => {
    cleanupTimeouts();
    // Signal completion even on error to show the next section
    onTransitionComplete?.(); 
    setShowRocket(false);
  };

  const startInternalTransition = () => {
    if (showRocket || launched) return;

    setShowRocket(true);
    
    transitionTimeoutRef.current = setTimeout(() => {
      setLaunched(true);
      
      // Transition visual duration
      transitionTimeoutRef.current = setTimeout(() => {
        // Signal that the visual transition is done
        onTransitionComplete?.();
        
        // Hide rocket visual after signaling
        transitionTimeoutRef.current = setTimeout(() => {
          setShowRocket(false);
        }, 500); 
      }, 5000); // Visual duration
    }, 100);
  };

  useEffect(() => {
    if (shouldStart) {
      startInternalTransition();
    } else {
      // Reset states if the trigger leaves
      cleanupTimeouts();
      setShowRocket(false);
      setLaunched(false);
      // No need to reset transitionComplete state here
    }

    return () => {
      cleanupTimeouts();
    };
  }, [shouldStart, onTransitionComplete]);

  return (
    <AnimatePresence mode="wait">
      {showRocket && (
        <motion.div
          key="rocket-transition"
          className={`${styles.rocketTransitionWrapper} ${launched ? styles.launched : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RocketCanvas 
            isLaunched={launched}
            onError={handleTransitionError}
          />
          <div className={styles.smoke} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}