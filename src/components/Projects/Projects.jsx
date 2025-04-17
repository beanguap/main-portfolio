import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { FaGithub, FaPlay, FaAngleDown } from "react-icons/fa6";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Scene3D } from "./Scene3D";
import styles from "./Projects.module.scss";

gsap.registerPlugin(ScrollTrigger);

const projectsData = [
  {
    id: 1,
    title: "AI Finger Drummer",
    description:
      "Computer vision-based hand tracking application that turns hand gestures into drum beats. Built with Python for ML processing and JavaScript for the web interface.",
    imageUrl: "/src/assets/129.jpg",
    tech: ["Python", "JavaScript", "TensorFlow", "MediaPipe", "WebAudio API"],
    links: {
      github: "https://github.com/yourusername/ai-finger-drummer",
      demo: "https://demo-url.com/finger-drummer",
    },
  },
  {
    id: 2,
    title: "Tank Battle Mobile",
    description:
      "A React Native mobile game featuring tank battles with real-time physics and multiplayer capabilities. Available on iOS.",
    imageUrl: "/src/assets/156.jpg",
    tech: ["React Native", "TypeScript", "Redux", "React Game Engine", "iOS"],
    links: {
      github: "https://github.com/yourusername/tank-battle",
      demo: "https://apps.apple.com/app/tank-battle",
    },
  },
  {
    id: 3,
    title: "Brain Progress Animation",
    description:
      'Custom React component featuring an animated "unwinding" brain logo effect using SVG animations. Perfect for loading states or progress indicators.',
    imageUrl: "/src/assets/MockPortfolioLanding.png",
    tech: ["React", "TypeScript", "SVG", "Framer Motion", "SCSS"],
    links: {
      github: "https://github.com/yourusername/brain-progress",
      demo: "https://demo-url.com/brain-progress",
    },
  },
];

// Enhanced animation variants for better mobile experience
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const titleVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
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
      ease: "easeOut", // Simpler easing function
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
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <FaAngleDown />
      </motion.div>
      <span>Scroll for Next Section</span>
    </motion.div>
  );
};

const Projects = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const sceneContainerRef = useRef(null);
  const projectsHeadingRef = useRef(null);
  const projectCardsRef = useRef([]);

  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const isHeadingInView = useInView(headingRef, { once: true, amount: 0.8 });
  const [showScene, setShowScene] = useState(false);

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Trigger for showing/hiding the scene
    const sceneTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => setShowScene(true),
      onLeave: () => setShowScene(false),
      onEnterBack: () => setShowScene(true),
      onLeaveBack: () => setShowScene(false),
    });

    return () => {
      lenis.destroy();
      sceneTrigger.kill();
    };
  }, []);

  // Enhanced scroll-based animations with wider transform range
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
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
    [0.85, 1.1, 1.1, 0.85], // Increased scale range for more dramatic effect
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
  useEffect(() => {
    if (showScene && sceneContainerRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#projects",
            start: "top center",
            end: "bottom center",
            scrub: 1, // Increased scrub time for smoother effect
            toggleActions: "play none none reverse",
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
          ease: "power2.out",
        }).to(sceneContainerRef.current, {
          scale: 1,
          duration: 0.8,
          ease: "power1.inOut",
        });

        // Add floating animation
        gsap.to(sceneContainerRef.current, {
          y: "20px",
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      return () => ctx.revert();
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
        viewport={{ once: true, margin: "-50px" }}
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
    <motion.section
      className={styles.projectsSection}
      id="projects"
      ref={sectionRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      style={{ position: "relative" }}
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
          position: "fixed",
          width: "100%",
          height: "100vh",
          pointerEvents: showScene ? "auto" : "none",
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
        }}
      >
        {showScene && (
          <div
            ref={sceneContainerRef}
            className="scene-container"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
            }}
          >
            <Scene3D projects={projectsData} />
          </div>
        )}
      </motion.div>

      <motion.h2
        ref={(el) => {
          headingRef.current = el;
          projectsHeadingRef.current = el;
        }}
        className="projects-heading"
        variants={titleVariants}
        initial="hidden"
        animate={isHeadingInView ? "visible" : "hidden"}
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
  );
};

export default React.memo(Projects); // Memoize entire component
