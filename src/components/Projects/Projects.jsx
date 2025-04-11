import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { FaGithub, FaPlay, FaAngleDown } from 'react-icons/fa6';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene3D } from './Scene3D';
import styles from './Projects.module.scss';

gsap.registerPlugin(ScrollTrigger);

const projectsData = [
  {
    id: 1,
    title: 'AI Finger Drummer',
    description: 'Computer vision-based hand tracking application that turns hand gestures into drum beats. Built with Python for ML processing and JavaScript for the web interface.',
    imageUrl: '/src/assets/129.jpg',
    tech: ['Python', 'JavaScript', 'TensorFlow', 'MediaPipe', 'WebAudio API'],
    links: {
      github: 'https://github.com/yourusername/ai-finger-drummer',
      demo: 'https://demo-url.com/finger-drummer'
    }
  },
  {
    id: 2,
    title: 'Tank Battle Mobile',
    description: 'A React Native mobile game featuring tank battles with real-time physics and multiplayer capabilities. Available on iOS.',
    imageUrl: '/src/assets/156.jpg',
    tech: ['React Native', 'TypeScript', 'Redux', 'React Game Engine', 'iOS'],
    links: {
      github: 'https://github.com/yourusername/tank-battle',
      demo: 'https://apps.apple.com/app/tank-battle'
    }
  },
  {
    id: 3,
    title: 'Brain Progress Animation',
    description: 'Custom React component featuring an animated "unwinding" brain logo effect using SVG animations. Perfect for loading states or progress indicators.',
    imageUrl: '/src/assets/MockPortfolioLanding.png',
    tech: ['React', 'TypeScript', 'SVG', 'Framer Motion', 'SCSS'],
    links: {
      github: 'https://github.com/yourusername/brain-progress',
      demo: 'https://demo-url.com/brain-progress'
    }
  }
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
      ease: "easeOut"
    }
  }
};

const titleVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, 0.01, 0.9]
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    },
  }),
  hover: {
    y: -8,
    boxShadow: "0 15px 30px rgba(83, 140, 255, 0.2)",
    transition: { duration: 0.3 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.15 }
  }
};

const Projects = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const isHeadingInView = useInView(headingRef, { once: true, amount: 0.8 });

  // Initialize smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Enhanced scroll animations specifically tuned for iPhone 12 Pro
  useLayoutEffect(() => {
    const isMobile = window.innerWidth <= 767;
    const mobilePadding = isMobile ? "80%" : "center";
    
    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#projects',
          start: `top ${mobilePadding}`,
          end: 'bottom center',
          scrub: 1,
          onEnter: () => {
            document.body.classList.add(styles.projectsActive);
          },
          onLeaveBack: () => {
            document.body.classList.remove(styles.projectsActive);
          }
        },
      })
      .fromTo('.scene-container', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2 }
      )
      .fromTo('.projects-heading', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '<0.2'
      )
      .fromTo('.project-card', 
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 0.7 },
        '<0.3'
      );
    });

    return () => ctx.revert();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.9]);

  return (
    <motion.section 
      className={styles.projectsSection} 
      id="projects"
      ref={sectionRef}
      variants={sectionVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
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
          position: 'fixed', // Ensure position is explicitly set
          width: '100%',     // Ensure full width
          height: '100vh'    // Ensure full height
        }}
      >
        <div className="scene-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Scene3D projects={projectsData} />
        </div>
      </motion.div>

      <motion.h2 
        ref={headingRef}
        className="projects-heading"
        variants={titleVariants}
        initial="hidden"
        animate={isHeadingInView ? "visible" : "hidden"}
      >
        <span className={styles.headingAccent}>Featured</span> Projects
      </motion.h2>

      <motion.div
        className={styles.projectsGrid}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        viewport={{ once: true, amount: 0.05 }}
      >
        {projectsData.map((project, index) => (
          <motion.div
            key={project.id}
            className={`${styles.projectCard} project-card`}
            variants={cardVariants}
            custom={index}
            whileHover="hover"
            whileTap="tap"
            initial="hidden"
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className={styles.projectImage}>
              <img src={project.imageUrl} alt={project.title} loading="lazy" />
              <motion.div 
                className={styles.projectLinks}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.a 
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Source Code"
                  whileHover={{ scale: 1.15, rotate: 5, backgroundColor: "rgba(83, 140, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaGithub />
                </motion.a>
                <motion.a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Live Demo"
                  whileHover={{ scale: 1.15, rotate: -5, backgroundColor: "rgba(83, 140, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlay />
                </motion.a>
              </motion.div>
            </div>
            <motion.div 
              className={styles.projectContent}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.techStack}>
                {project.tech.map((tech, i) => (
                  <motion.span
                    key={i}
                    className={styles.techTag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ scale: 1.08, y: -2, backgroundColor: "rgba(83, 140, 255, 0.2)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Projects;