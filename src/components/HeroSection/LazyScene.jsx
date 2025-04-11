import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

// Lazy load the HeroScene component
const HeroScene = React.lazy(() => import('./HeroScene'));

// Loading placeholder that matches the hero section's style
const LoadingFallback = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7))'
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: '#538CFF',
        filter: 'blur(20px)'
      }}
    />
  </motion.div>
);

export function LazyScene() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HeroScene />
    </Suspense>
  );
}