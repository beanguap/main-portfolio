import projectsData from '@assets/projectsData';
import { Scene3D } from '@components/Projects/Scene3D';
import {
    AnimatePresence,
    motion,
    useInView,
    useScroll,
    useTransform,
} from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FaAngleDown, FaGithub, FaPlay } from 'react-icons/fa6';
import styles from './Projects.module.scss';

gsap.registerPlugin(ScrollTrigger);

// Section transition variants - new for magnetic detaching effect
const sectionVariants = {
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      ease: [0.25, 0.1, 0.25, 1.0], // Smooth entrance
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.98,
    y: 30, // Exit downward unlike hero section's upward exit for direction variety
    transition: { 
      duration: 0.4,
      ease: [0.36, 0, 0.66, -0.56], // Elastic/magnetic-like exit
      when: "afterChildren" 
    }
  }
};

// Define titleVariants
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Optimize animation variants for better performance
const cardVariants = {
  hidden: { opacity: 0, y: 20 }, // Reduced y distance
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4, // Slightly faster
      ease: 'easeOut', // Simpler easing function
    },
  }),
  hover: {
    y: -5, // Reduced movement
    transition: { duration: 0.2 }, // Faster transition
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Scroll down indicator component
const ScrollDownIndicator = () => {
  return (
    <motion.div
      className={styles.rocketScrollIndicator} // Use a new class for specific styling
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
    >
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FaAngleDown />
      </motion.div>
      <span>Scroll for Next Section</span>
    </motion.div>
  );
};

const ProjectsScrollEffects = ({ sectionRef, setBackgroundTransforms }) => {
  // Only run useScroll if ref is attached
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  });

  // Enhanced transform values for more dramatic effect
  const backgroundOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0],
    { clamp: true }
  );
  const backgroundScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.85, 1.1, 1.1, 0.85],
    { clamp: true }
  );
  const backgroundRotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [-10, 0, 10],
    { clamp: true }
  );
  const backgroundRotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [5, 0, -5],
    { clamp: true }
  );

  // Pass transforms up to parent
  useEffect(() => {
    setBackgroundTransforms({
      backgroundOpacity,
      backgroundScale,
      backgroundRotateY,
      backgroundRotateX,
    });
  }, [backgroundOpacity, backgroundScale, backgroundRotateY, backgroundRotateX, setBackgroundTransforms]);

  return null;
};

const Projects = ({ isActive }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const sceneContainerRef = useRef(null);
  const projectCardsRef = useRef([]);

  const isHeadingInView = useInView(headingRef, { once: true, amount: 0.8 });
  const [showScene, setShowScene] = useState(false);
  const [backgroundTransforms, setBackgroundTransforms] = useState({
    backgroundOpacity: 1,
    backgroundScale: 1,
    backgroundRotateY: 0,
    backgroundRotateX: 0,
  });

  // Initialize smooth scrolling
  useEffect(() => {
    // Removed local Lenis and rAF loop for performance. Use root Lenis instance from App if needed.

    // Trigger for showing/hiding the scene
    const sceneTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => setShowScene(true),
      onLeave: () => setShowScene(false),
      onEnterBack: () => setShowScene(true),
      onLeaveBack: () => setShowScene(false),
    });

    return () => {
      sceneTrigger.kill();
    };
  }, []);

  // Enhanced GSAP animations
  useLayoutEffect(() => {
    if (showScene && sceneContainerRef.current && projectCardsRef.current.length > 0) {
      const _ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '#projects',
            start: 'top center',
            end: 'bottom center',
            scrub: 1, // Increased scrub time for smoother effect
            toggleActions: 'play none none reverse',
          },
        });

        // Enhanced initial state
        gsap.set(sceneContainerRef.current, {
          opacity: 0,
          scale: 0.85,
          rotateY: -10,
          rotateX: 5,
          z: -100,
        });

        // Enhanced animation sequence
        tl.to(sceneContainerRef.current, {
          opacity: 1,
          scale: 1.1,
          rotateY: 0,
          rotateX: 0,
          z: 0,
          duration: 1.2,
          ease: 'power2.out',
        }).to(sceneContainerRef.current, {
          scale: 1,
          duration: 0.8,
          ease: 'power1.inOut',
        });

        // Add floating animation
        gsap.to(sceneContainerRef.current, {
          y: '20px',
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      return () => _ctx.revert();
    }
  }, [showScene]);

  // Render optimization for project cards
  const renderProjectCard = React.useCallback(
    ({ project, index }) => (
      <motion.div
        key={project.id}
        ref={(el) => (projectCardsRef.current[index] = el)}
        className={`${styles.projectCard} project-card`}
        variants={cardVariants}
        custom={index}
        initial="hidden"
        whileInView="visible" // Change from animate to whileInView
        viewport={{ once: true, margin: '-50px' }}
        whileHover="hover"
        whileTap="tap"
      >
        <div className={styles.projectImage}>
          <img
            src={project.imageUrl}
            alt={`Screenshot of ${project.title} project`}
            loading="lazy"
            decoding="async" // Add async decoding
          />
          <motion.div
            className={styles.projectLinks}
            initial={false} // Disable initial animation
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Simplified link animations */}
            <motion.a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source code for ${project.title}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGithub />
            </motion.a>
            <motion.a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View live demo for ${project.title}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlay />
            </motion.a>
          </motion.div>
        </div>
        <div className={styles.projectContent}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className={styles.techStack}>
            {project.tech.map((tech, i) => (
              <motion.span
                key={i}
                className={styles.techTag}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }} // Reduced delay
                viewport={{ once: true }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    ),
    []
  ); // Memoize card render function

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.section
          className={styles.projectsSection}
          id="projects"
          ref={sectionRef}
          variants={sectionVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          style={{ position: 'relative' }}
        >
          {/* Scroll-based transforms are now managed by ProjectsScrollEffects */}
          <ProjectsScrollEffects sectionRef={sectionRef} setBackgroundTransforms={setBackgroundTransforms} />
          <div className={styles.projectsIndicator}>
            <motion.div
              className={styles.scrollIndicator}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FaAngleDown />
            </motion.div>
          </div>

          <motion.div
            className={styles.backgroundScene}
            style={{
              opacity: backgroundTransforms.backgroundOpacity,
              scale: backgroundTransforms.backgroundScale,
              rotateY: backgroundTransforms.backgroundRotateY,
              rotateX: backgroundTransforms.backgroundRotateX,
              position: 'fixed',
              width: '100%',
              height: '100vh',
              pointerEvents: 'auto',
              transformPerspective: 1000,
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              ref={sceneContainerRef}
              className="scene-container"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
              }}
            >
              <Scene3D projects={projectsData} />
            </div>
          </motion.div>

          <motion.h2
            ref={(el) => {
              headingRef.current = el;
            }}
            className="projects-heading"
            variants={titleVariants} // Use defined titleVariants
            initial="hidden"
            animate={isHeadingInView ? 'visible' : 'hidden'}
          >
            <span className={styles.headingAccent}>Featured</span> Projects
          </motion.h2>

          <motion.div
            className={styles.projectsGrid}
            initial={false} // Disable initial animation for container
          >
            {projectsData.map((project, index) =>
              renderProjectCard({ project, index })
            )}
          </motion.div>

          <ScrollDownIndicator />
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default React.memo(Projects); // Memoize entire component
