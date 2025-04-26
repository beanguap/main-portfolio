import {
    AnimatePresence,
    motion,
    useInView,
} from 'framer-motion';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'; // Import lazy, Suspense
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import styles from './HeroSection.module.scss';

// Import assets directly
import decorativeImage46 from '@assets/46.png';
import abstractImage from '@assets/image-from-rawpixel-id-6171907-png.png';
import keyboardImage from '@assets/NOBACKGROUNDJMFKEYBOARD .png';

// Lazy load the 3D scene
const HeroScene3D = lazy(() =>
  import('@components/HeroSection/HeroScene3D').then(module => ({ default: module.HeroScene3D }))
);

// Section transition variants - new for magnetic detaching effect
const sectionVariants = {
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
      ease: [0.25, 0.1, 0.25, 1.0], // Smooth entrance
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { 
      duration: 0.4,
      ease: [0.36, 0, 0.66, -0.56], // Elastic/magnetic-like exit
      when: "afterChildren" 
    }
  }
};

// Animation variants for staggered animations
const nameVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: custom * 0.2, // stagger effect
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  }),
};

// Card-like animation for the buttons
const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 1 + custom * 0.2,
      ease: [0, 0.55, 0.45, 1],
    },
  }),
  hover: {
    y: -5,
    boxShadow: '0 10px 20px rgba(83, 140, 255, 0.3)',
    transition: { duration: 0.3 },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// Social icon animation
const iconVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (custom) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 1.3 + custom * 0.1,
    },
  }),
  hover: {
    scale: 1.15,
    color: '#538CFF',
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

// Subtle floating animation for the keyboard
const keyboardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5,
      ease: [0, 0.55, 0.45, 1],
    },
  },
  float: {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
};

// Subtle fade-in for text
const textVariants = {
  hidden: { opacity: 0 },
  visible: (custom) => ({
    opacity: 1,
    transition: {
      duration: 0.8,
      delay: 1.8 + custom * 0.2,
    },
  }),
};

// Skills list animation with staggered display
const skillsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 2.2,
    },
  },
};

const skillItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const HeroSection = ({ isActive, scrollToProjects }) => {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const sectionRef = useRef(null);
  const isHeroSceneInView = useInView(sectionRef, { once: false, amount: 0.1 });

  // Start animations when section comes into view
  useEffect(() => {
    if (isHeroSceneInView) {
      // Removed controls usage
    }
  }, [isHeroSceneInView]);

  const handleInfoButtonClick = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.section
          className={styles.hero}
          ref={sectionRef}
          variants={sectionVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          id="home"
          style={{ position: 'relative' }}
        >
          {/* Conditionally render 3D Scene Background with Suspense */}
          <div
            className={styles.heroBackground}
            style={{ pointerEvents: 'auto' }}
          >
            <Suspense fallback={<div className={styles.sceneFallback}>Loading 3D Scene...</div>}>
              {(isActive || isHeroSceneInView) && <HeroScene3D />}
            </Suspense>
          </div>

          {/* Animated Name */}
          <div className={styles.heroName}>
            <motion.span
              className={styles.firstName}
              variants={nameVariants}
              custom={0}
            >
              JERIEL
            </motion.span>
            <motion.span
              className={styles.middleName}
              variants={nameVariants}
              custom={1}
            >
              MARTINEZ
            </motion.span>
            <motion.span
              className={styles.lastName}
              variants={nameVariants}
              custom={2}
            >
              FLORES
            </motion.span>
          </div>

          {/* Top-right decorative image */}
          <motion.img
            src={abstractImage} // Use imported variable
            alt="Abstract geometric blue and white pattern"
            className={styles.topRightImage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{
              duration: 1.2,
              delay: 1,
              ease: [0.25, 0.25, 0, 1],
            }}
          />

          {/* Social Media Links */}
          <div className={styles.socialLinks}>
            <motion.a
              href="https://twitter.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter profile"
              variants={iconVariants}
              custom={0}
              whileHover="hover"
              whileTap="tap"
            >
              <FaXTwitter />
            </motion.a>
            <motion.a
              href="https://github.com/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              variants={iconVariants}
              custom={1}
              whileHover="hover"
              whileTap="tap"
            >
              <FaGithub />
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              variants={iconVariants}
              custom={2}
              whileHover="hover"
              whileTap="tap"
            >
              <FaLinkedin />
            </motion.a>
          </div>

          {/* CTA Buttons */}
          <div className={styles.ctaButtonsLeft} style={{ position: 'relative' }}>
            <motion.button
              className={styles.sayHelloBtn}
              variants={buttonVariants}
              custom={0}
              whileHover="hover"
              whileTap="tap"
            >
              SAY HELLO
            </motion.button>
            <motion.button
              className={styles.downloadCvBtn}
              variants={buttonVariants}
              custom={1}
              whileHover="hover"
              whileTap="tap"
            >
              DOWNLOAD CV
            </motion.button>
            <motion.button
              className={styles.scrollToProjectsBtn}
              variants={buttonVariants}
              custom={2}
              whileHover="hover"
              whileTap="tap"
              onClick={scrollToProjects}
              style={{ marginLeft: '1rem' }}
            >
              VIEW PROJECTS
            </motion.button>
          </div>

          {/* Decorative Image */}
          <motion.img
            src={decorativeImage46} // Use imported variable
            alt="Decorative graphic"
            className={styles.decorativeImage46}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />

          {/* Footer Text Block */}
          <motion.div
            className={styles.footerTextBlock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          >
            <p>Full Stack</p>
            <p>Solutions for a</p>
            <p>Digital World</p>
            <p className={styles.yearText}>2025</p>
          </motion.div>

          {/* Info Button */}
          <motion.button
            className={styles.infoButton}
            aria-label="More Information"
            onClick={handleInfoButtonClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 10,
              delay: 2.5,
            }}
            whileHover={{
              scale: 1.1,
              backgroundColor: '#666',
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            +
          </motion.button>

          {/* Info Panel with AnimatePresence for smooth mounting/unmounting */}
          <AnimatePresence>
            {isInfoVisible && (
              <motion.div
                className={styles.infoPanel}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <p>Made with React, SCSS, and ❤️</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skills List with staggered animation */}
          <motion.div className={styles.skillsList} variants={skillsVariants}>
            {[
              'FULL STACK',
              'DEVELOPER',
              'SOFTWARE',
              'ENGINEER',
              'ANIMATION',
              'UI',
              'UX',
              'AI',
            ].map((skill, index) => (
              <motion.span key={index} variants={skillItemVariants}>
                {skill}
              </motion.span>
            ))}
          </motion.div>

          {/* Main Content with Keyboard */}
          <div className={styles.heroContent} style={{ position: 'relative' }}>
            <motion.div
              className={styles.heroImage}
              variants={keyboardVariants}
              animate="float"
              style={{ position: 'relative' }}
            >
              <motion.img
                src={keyboardImage} // Use imported variable
                alt="JMF Keyboard"
                className={styles.keyboard}
                variants={keyboardVariants}
              />

              {/* Text near keyboard */}
              <motion.div
                className={styles.keyboardInfoText}
                variants={textVariants}
                custom={0}
              >
                <p>From Concept to Code – I Make It Happen /</p>
                <p>Design, Develop, Deploy – The Future Is Built Here</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default HeroSection;
