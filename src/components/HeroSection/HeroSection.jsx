import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6';
import { gsap } from 'gsap';
import { HeroScene } from './HeroScene';
import styles from './HeroSection.module.scss';

// Mobile detection utility
const isMobile = () => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const HeroSection = () => {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const isMobileDevice = isMobile();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    if (!isMobileDevice) {
      // Desktop animations
      const names = nameRef.current.children;
      gsap.fromTo(names, 
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 1,
          ease: "power3.out"
        }
      );

      // Custom cursor only for desktop
      const cursor = document.createElement('div');
      cursor.className = styles.customCursor;
      document.body.appendChild(cursor);

      const moveCursor = (e) => {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1
        });
      };

      const expandCursor = () => cursor.classList.add(styles.cursorExpanded);
      const shrinkCursor = () => cursor.classList.remove(styles.cursorExpanded);

      document.addEventListener('mousemove', moveCursor);
      document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', expandCursor);
        el.addEventListener('mouseleave', shrinkCursor);
      });

      return () => {
        document.removeEventListener('mousemove', moveCursor);
        document.querySelectorAll('a, button').forEach(el => {
          el.removeEventListener('mouseenter', expandCursor);
          el.removeEventListener('mouseleave', shrinkCursor);
        });
        document.body.removeChild(cursor);
      };
    } else {
      // Mobile animations
      const names = nameRef.current.children;
      gsap.fromTo(names, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        }
      );
    }
  }, [isMobileDevice]);

  // Touch event handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientY;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      // Scroll to projects section on swipe up
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setTouchStart(null);
  };

  return (
    <motion.section 
      ref={sectionRef}
      className={styles.hero}
      style={{ y, opacity }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* 3D Scene Background */}
      <div className={styles.heroBackground}>
        <HeroScene />
      </div>

      {/* Hero Content */}
      <motion.div 
        ref={nameRef}
        className={styles.heroName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.span
          className={`${styles.firstName} hero-element`}
          whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
        >
          JERIEL
        </motion.span>
        <motion.span
          className={`${styles.middleName} hero-element`}
          whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
        >
          MARTINEZ
        </motion.span>
        <motion.span
          className={`${styles.lastName} hero-element`}
          whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
        >
          FLORES
        </motion.span>
      </motion.div>

      {/* Social Links */}
      <motion.div 
        className={styles.socialLinks}
        initial={{ opacity: 0, y: isMobileDevice ? 50 : -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <motion.a 
          href="https://twitter.com/jmartinezflores" 
          target="_blank" 
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, y: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaXTwitter />
        </motion.a>
        <motion.a 
          href="https://github.com/jerielmartinez" 
          target="_blank" 
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, y: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaGithub />
        </motion.a>
        <motion.a 
          href="https://linkedin.com/in/jerielmartinez" 
          target="_blank" 
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, y: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaLinkedin />
        </motion.a>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        className={styles.ctaButtonsLeft}
        initial={{ opacity: 0, y: isMobileDevice ? 50 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <motion.button 
          className={styles.sayHelloBtn}
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(83, 140, 255, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          SAY HELLO
        </motion.button>
        <motion.button 
          className={styles.downloadCvBtn}
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 255, 255, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          DOWNLOAD CV
        </motion.button>
      </motion.div>

      {/* Skills List */}
      <motion.div 
        className={styles.skillsList}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        {["FULL STACK", "DEVELOPER", "SOFTWARE", "ENGINEER", "ANIMATION", "UI", "UX", "AI"].map((skill, index) => (
          <motion.span
            key={skill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: isMobileDevice ? 0.3 : 0.5,
              delay: 1.5 + (index * (isMobileDevice ? 0.05 : 0.1))
            }}
            whileHover={!isMobileDevice && { color: "#538CFF", scale: 1.1 }}
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>

      {!isMobileDevice && (
        <motion.div 
          className={styles.scrollIndicator}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 2,
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <span />
        </motion.div>
      )}
    </motion.section>
  );
};

export default HeroSection;
