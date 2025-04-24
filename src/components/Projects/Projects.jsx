import projectsData from '@assets/projectsData';
import { cardVariants, sectionVariants, titleVariants } from '@styles/animationVariants';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FaAngleDown, FaGithub, FaPlay } from 'react-icons/fa6';
import styles from './Projects.module.scss';

// Lazy load the Scene3D component
const LazyScene3D = lazy(() =>
  import('@components/Projects/Scene3D').then(module => ({ default: module.Scene3D }))
);

gsap.registerPlugin(ScrollTrigger);

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

const Projects = ({ isActive }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const sceneContainerRef = useRef(null);
  const projectCardsRef = useRef([]);

  const isHeadingInView = useInView(headingRef, { once: true, amount: 0.8 });
  const [showScene, setShowScene] = useState(false);

  // Set up ScrollTrigger after ref is attached
  useLayoutEffect(() => {
    if (!sectionRef.current) return;
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
  }, [sectionRef]);

  // Call useScroll unconditionally
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
    layoutEffect: false
  });

  // Enhanced transform values for more dramatic effect
  const backgroundOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0],
    { clamp: true }
  );

  useEffect(() => {
    const unsubscribe = backgroundOpacity.on('change', () => {});
    return unsubscribe;
  }, [backgroundOpacity]);

  const backgroundScale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.85, 1.1, 1.1, 0.85],
    { clamp: true }
  );

  // Add rotation effect
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

  // Always render the section, use CSS classes for visibility
  return (
    <motion.section
      className={
        styles.projectsSection +
        ' ' + (isActive ? styles.visible : styles.hidden)
      }
      id="projects"
      ref={sectionRef}
      variants={sectionVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ position: 'relative' }}
    >
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
          opacity: backgroundOpacity,
          scale: backgroundScale,
          rotateY: backgroundRotateY,
          rotateX: backgroundRotateX,
          position: 'fixed',
          zIndex: -1, // Ensure background is behind content
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
          <Suspense fallback={null}>
            {showScene && <LazyScene3D projects={projectsData} />}
          </Suspense>
        </div>
      </motion.div>

      <motion.h2
        ref={(el) => {
          headingRef.current = el;
        }}
        className="projects-heading"
        variants={titleVariants}
        initial="hidden"
        animate={isHeadingInView ? 'visible' : 'hidden'}
        style={{ position: 'relative', zIndex: 1 }} // Ensure heading is above background
      >
        <span className={styles.headingAccent}>Featured</span> Projects
      </motion.h2>

      <motion.div
        className={styles.projectsGrid}
        initial={false}
        style={{ position: 'relative', zIndex: 1 }} // Ensure grid is above background
      >
        {projectsData.map((project, index) =>
          renderProjectCard({ project, index })
        )}
      </motion.div>

      <ScrollDownIndicator />
    </motion.section>
  );
};

export default React.memo(Projects); // Memoize entire component
