import projectsData from '@assets/projectsData';
import { Scene3D } from '@components/Projects/Scene3D';
import {
    AnimatePresence,
    motion,
    useInView,
    useScroll,
    useTransform,
} from 'framer-motion';
import React, { useCallback, useRef } from 'react';
import { FaAngleDown, FaGithub, FaPlay } from 'react-icons/fa6';
import styles from './Projects.module.scss';

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

// New Component for Background Effects
const ProjectBackgroundEffects = ({ targetRef }) => {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
    layoutEffect: false,
  });

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

  return (
    <motion.div
      className={styles.backgroundScene}
      style={{
        opacity: backgroundOpacity,
        scale: backgroundScale,
        rotateY: backgroundRotateY,
        rotateX: backgroundRotateX,
        position: 'fixed',
        width: '100%',
        height: '100vh',
        pointerEvents: 'auto',
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        zIndex: 1,
      }}
    >
      <div
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
  );
};

const Projects = ({ isActive }) => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const projectCardsRef = useRef([]);

  const isHeadingInView = useInView(headingRef, { once: true, amount: 0.8 });

  const renderProjectCard = useCallback(
    ({ project, index }) => (
      <motion.div
        key={project.id}
        ref={(el) => (projectCardsRef.current[index] = el)}
        className={`${styles.projectCard} project-card`}
        variants={cardVariants}
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        whileHover="hover"
        whileTap="tap"
      >
        <div className={styles.projectImage}>
          <img
            src={project.imageUrl}
            alt={`Screenshot of ${project.title} project`}
            loading="lazy"
            decoding="async"
          />
          <motion.div
            className={styles.projectLinks}
            initial={false}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
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
                transition={{ delay: 0.05 * i }}
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
  );

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
          <ProjectBackgroundEffects targetRef={sectionRef} />

          <div className={styles.projectsIndicator}>
            <motion.div
              className={styles.scrollIndicator}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FaAngleDown />
            </motion.div>
          </div>

          <motion.h2
            ref={headingRef}
            className="projects-heading"
            variants={titleVariants}
            initial="hidden"
            animate={isHeadingInView ? 'visible' : 'hidden'}
          >
            <span className={styles.headingAccent}>Featured</span> Projects
          </motion.h2>

          <motion.div
            className={styles.projectsGrid}
            style={{ position: 'relative', zIndex: 2 }}
            initial={false}
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

export default React.memo(Projects);
